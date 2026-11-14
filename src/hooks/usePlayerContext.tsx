import { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from './useAudioPlayer';

type PlayerApi = ReturnType<typeof useAudioPlayer>;

const PlayerContext = createContext<PlayerApi | null>(null);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const player = useAudioPlayer();
  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
};
