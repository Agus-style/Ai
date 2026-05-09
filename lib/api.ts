import { Song } from './types';

const ITUNES_BASE = 'https://itunes.apple.com';
const LYRICS_BASE = 'https://api.lyrics.ovh/v1';

export async function searchSongs(query: string, limit: number = 20): Promise<Song[]> {
  try {
    const response = await fetch(
      `${ITUNES_BASE}/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=${limit}`
    );
    const data = await response.json();
    
    if (!data.results) return [];
    
    return data.results.map((item: any) => ({
      id: String(item.trackId),
      title: item.trackName || 'Unknown',
      artist: item.artistName || 'Unknown',
      album: item.collectionName || 'Unknown',
      artwork: (item.artworkUrl100 || '').replace('100x100', '600x600'),
      previewUrl: item.previewUrl || null,
      genre: item.primaryGenreName || 'Unknown',
      duration: item.trackTimeMillis ? item.trackTimeMillis / 1000 : 30,
      releaseDate: item.releaseDate || '',
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function searchSongsByGenre(genre: string, limit: number = 20): Promise<Song[]> {
  try {
    const response = await fetch(
      `${ITUNES_BASE}/search?term=${encodeURIComponent(genre)}&media=music&entity=song&limit=${limit}`
    );
    const data = await response.json();
    
    if (!data.results) return [];
    
    return data.results.map((item: any) => ({
      id: String(item.trackId),
      title: item.trackName || 'Unknown',
      artist: item.artistName || 'Unknown',
      album: item.collectionName || 'Unknown',
      artwork: (item.artworkUrl100 || '').replace('100x100', '600x600'),
      previewUrl: item.previewUrl || null,
      genre: item.primaryGenreName || 'Unknown',
      duration: item.trackTimeMillis ? item.trackTimeMillis / 1000 : 30,
      releaseDate: item.releaseDate || '',
    }));
  } catch (error) {
    console.error('Genre search error:', error);
    return [];
  }
}

export async function getTopSongs(limit: number = 10): Promise<Song[]> {
  try {
    const response = await fetch(
      `${ITUNES_BASE}/search?term=top+hits+2024&media=music&entity=song&limit=${limit}`
    );
    const data = await response.json();
    
    if (!data.results) return [];
    
    return data.results.map((item: any) => ({
      id: String(item.trackId),
      title: item.trackName || 'Unknown',
      artist: item.artistName || 'Unknown',
      album: item.collectionName || 'Unknown',
      artwork: (item.artworkUrl100 || '').replace('100x100', '600x600'),
      previewUrl: item.previewUrl || null,
      genre: item.primaryGenreName || 'Unknown',
      duration: item.trackTimeMillis ? item.trackTimeMillis / 1000 : 30,
      releaseDate: item.releaseDate || '',
    }));
  } catch (error) {
    console.error('Top songs error:', error);
    return [];
  }
}

export async function getLyrics(artist: string, title: string): Promise<string | null> {
  try {
    const cleanTitle = title.replace(/\s*\(.*?\)\s*/g, '').replace(/\s*-\s*.*/g, '').trim();
    const cleanArtist = artist.replace(/\s*ft\..*/gi, '').replace(/\s*feat\..*/gi, '').trim();
    
    const response = await fetch(
      `${LYRICS_BASE}/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.lyrics || null;
  } catch (error) {
    console.error('Lyrics error:', error);
    return null;
  }
}

export async function lookupSong(id: string): Promise<Song | null> {
  try {
    const response = await fetch(`${ITUNES_BASE}/lookup?id=${id}&entity=song`);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) return null;
    
    const item = data.results[0];
    return {
      id: String(item.trackId),
      title: item.trackName || 'Unknown',
      artist: item.artistName || 'Unknown',
      album: item.collectionName || 'Unknown',
      artwork: (item.artworkUrl100 || '').replace('100x100', '600x600'),
      previewUrl: item.previewUrl || null,
      genre: item.primaryGenreName || 'Unknown',
      duration: item.trackTimeMillis ? item.trackTimeMillis / 1000 : 30,
      releaseDate: item.releaseDate || '',
    };
  } catch (error) {
    console.error('Lookup error:', error);
    return null;
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
