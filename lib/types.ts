export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  previewUrl: string | null;
  genre: string;
  duration: number;
  releaseDate: string;
}

export interface Genre {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  searchTerms: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  songs?: Song[];
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
}
