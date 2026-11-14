import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Clock, X, Music, Disc, User, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MusicTrack } from '@/hooks/useMusic';

interface SearchBarProps {
  onSearch: (query: string, filter?: string) => void;
  loading: boolean;
  autocompleteSuggestions?: MusicTrack[];
  onAutocomplete?: (query: string) => void;
  onClearAutocomplete?: () => void;
  onPlayTrack?: (track: MusicTrack) => void;
}

const MAX_HISTORY = 8;
const STORAGE_KEY = 'zentra-search-history';

const FILTERS = [
  { key: 'all', label: 'All', icon: Search },
  { key: 'songs', label: 'Songs', icon: Music },
  { key: 'albums', label: 'Albums', icon: Disc },
  { key: 'artists', label: 'Artists', icon: User },
];

const getHistory = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
};

const saveHistory = (history: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
};

// Simple fuzzy match — checks if all chars of pattern appear in str in order
const fuzzyMatch = (str: string, pattern: string): boolean => {
  const s = str.toLowerCase();
  const p = pattern.toLowerCase();
  let pi = 0;
  for (let i = 0; i < s.length && pi < p.length; i++) {
    if (s[i] === p[pi]) pi++;
  }
  return pi === p.length;
};

const SearchBar = ({
  onSearch, loading, autocompleteSuggestions = [], onAutocomplete, onClearAutocomplete, onPlayTrack,
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<string[]>(getHistory);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim(), activeFilter === 'all' ? undefined : activeFilter);
    setHistory(prev => {
      const filtered = prev.filter(h => h.toLowerCase() !== query.trim().toLowerCase());
      const next = [query.trim(), ...filtered].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
    setShowDropdown(false);
    onClearAutocomplete?.();
  }, [query, onSearch, activeFilter, onClearAutocomplete]);

  const handleHistoryClick = useCallback((term: string) => {
    setQuery(term);
    onSearch(term, activeFilter === 'all' ? undefined : activeFilter);
    setShowDropdown(false);
    onClearAutocomplete?.();
  }, [onSearch, activeFilter, onClearAutocomplete]);

  const handleAutocompletePick = useCallback((track: MusicTrack) => {
    setQuery(track.title);
    onPlayTrack?.(track);
    setShowDropdown(false);
    onClearAutocomplete?.();
  }, [onPlayTrack, onClearAutocomplete]);

  const removeFromHistory = useCallback((term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => {
      const next = prev.filter(h => h !== term);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 2 && focused) {
      debounceRef.current = setTimeout(() => {
        onAutocomplete?.(query.trim());
      }, 300);
    } else {
      onClearAutocomplete?.();
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, focused]);

  // Show dropdown logic
  useEffect(() => {
    if (!focused) {
      setShowDropdown(false);
      return;
    }
    if (autocompleteSuggestions.length > 0 && query.trim().length >= 2) {
      setShowDropdown(true);
    } else if (history.length > 0 && !query.trim()) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [focused, autocompleteSuggestions.length, history.length, query]);

  // Fuzzy-matched history
  const filteredHistory = query.trim()
    ? history.filter(h => fuzzyMatch(h, query.trim()))
    : history;

  const showHistorySection = !query.trim() && filteredHistory.length > 0;
  const showAutocompleteSection = query.trim().length >= 2 && autocompleteSuggestions.length > 0;

  return (
    <div className="relative max-w-2xl mx-auto space-y-3">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative group">
          <motion.div
            className="absolute -inset-0.5 gradient-primary rounded-xl blur transition-opacity"
            animate={{ opacity: focused ? 0.5 : 0.15 }}
            transition={{ duration: 0.3 }}
          />
          <div className="relative flex items-center glass rounded-xl overflow-hidden">
            <motion.div
              animate={{ rotate: focused ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
            </motion.div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Search any song, artist, or album..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-foreground placeholder:text-muted-foreground font-body caret-primary"
            />
            {/* Filter toggle */}
            <motion.button
              type="button"
              onClick={() => setShowFilters(p => !p)}
              className={`p-2 mr-1 rounded-lg transition-colors ${showFilters || activeFilter !== 'all' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Filter className="w-4 h-4" />
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="gradient-primary px-6 py-2 mr-2 rounded-lg font-display font-semibold text-sm text-primary-foreground disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                  Searching...
                </motion.span>
              ) : 'Search'}
            </motion.button>
          </div>
        </div>
      </motion.form>

      {/* Filter chips */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            {FILTERS.map(f => {
              const Icon = f.icon;
              const active = activeFilter === f.key;
              return (
                <motion.button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? 'gradient-primary text-primary-foreground'
                      : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-3 h-3" />
                  {f.label}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown: history + autocomplete */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 w-full mt-2 glass rounded-xl border border-border/30 overflow-hidden"
          >
            {/* Autocomplete suggestions */}
            {showAutocompleteSection && (
              <>
                <div className="px-4 py-2 border-b border-border/20">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Music className="w-3 h-3" /> Suggestions
                  </span>
                </div>
                {autocompleteSuggestions.map((track, i) => (
                  <motion.button
                    key={track.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleAutocompletePick(track)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors"
                  >
                    <img src={track.image} alt="" className="w-8 h-8 rounded-md object-cover" />
                    <div className="min-w-0 text-left">
                      <p className="text-sm text-foreground truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                  </motion.button>
                ))}
              </>
            )}

            {/* History */}
            {showHistorySection && (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/20">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Recent Searches
                  </span>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                {filteredHistory.map((term, i) => (
                  <motion.button
                    key={term}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleHistoryClick(term)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/50 transition-colors group/item"
                  >
                    <span className="flex items-center gap-3 text-sm text-foreground">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {term}
                    </span>
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      onClick={(e) => removeFromHistory(term, e)}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </motion.div>
                  </motion.button>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
