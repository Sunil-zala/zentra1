import { createContext, useContext, ReactNode } from 'react';
import { useMusic } from './useMusic';

type MusicApi = ReturnType<typeof useMusic>;

const MusicContext = createContext<MusicApi | null>(null);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const music = useMusic();
  return <MusicContext.Provider value={music}>{children}</MusicContext.Provider>;
};

export const useMusicLibrary = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusicLibrary must be used inside MusicProvider');
  return ctx;
};
