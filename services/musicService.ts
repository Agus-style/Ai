import axios from 'axios';
import { Song } from '../lib/types';

// Client ID Jamendo kamu
const JAMENDO_CLIENT_ID = '2a953e84';

// Ambil lagu trending/populer
export async function getTrendingSongs(): Promise<Song[]> {
  try {
    console.log('📡 Fetching trending songs from Jamendo...');
    
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: 30,
        order: 'popularity_total',
        include: 'musicinfo',
      },
    });

    if (!response.data || !response.data.results) {
      console.log('❌ No data from Jamendo');
      return [];
    }

    console.log(`✅ Found ${response.data.results.length} songs from Jamendo`);

    const songs: Song[] = response.data.results.map((track: any) => ({
      id: String(track.id),
      title: track.name || 'Unknown Title',
      artist: track.artist_name || 'Unknown Artist',
      album: track.album_name || 'Unknown Album',
      artwork: track.image || 'https://via.placeholder.com/300',
      previewUrl: track.audio || null,
      audioUrl: track.audio || '',  // FULL LAGU!
      genre: track.genre || 'Pop',
      duration: (track.duration || 180) * 1000,
      releaseDate: track.releasedate || new Date().toISOString(),
    }));

    return songs;
    
  } catch (error) {
    console.error('❌ Error fetching trending songs:', error);
    return [];
  }
}

// Cari lagu berdasarkan query
export async function searchSongs(query: string): Promise<Song[]> {
  if (!query || query.length < 2) return [];
  
  try {
    console.log(`🔍 Searching for: ${query}`);
    
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: 30,
        search: query,
        order: 'relevance',
        include: 'musicinfo',
      },
    });

    if (!response.data || !response.data.results) {
      return [];
    }

    console.log(`✅ Found ${response.data.results.length} search results`);

    const songs: Song[] = response.data.results.map((track: any) => ({
      id: String(track.id),
      title: track.name || 'Unknown Title',
      artist: track.artist_name || 'Unknown Artist',
      album: track.album_name || 'Unknown Album',
      artwork: track.image || 'https://via.placeholder.com/300',
      previewUrl: track.audio || null,
      audioUrl: track.audio || '',
      genre: track.genre || 'Unknown',
      duration: (track.duration || 180) * 1000,
      releaseDate: track.releasedate || new Date().toISOString(),
    }));

    return songs;
    
  } catch (error) {
    console.error('❌ Error searching songs:', error);
    return [];
  }
}

// Ambil lagu berdasarkan genre
export async function getSongsByGenre(genreName: string): Promise<Song[]> {
  try {
    console.log(`🎵 Fetching songs for genre: ${genreName}`);
    
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: 30,
        tags: genreName.toLowerCase(),
        order: 'popularity_total',
        include: 'musicinfo',
      },
    });

    if (!response.data || !response.data.results) {
      return [];
    }

    const songs: Song[] = response.data.results.map((track: any) => ({
      id: String(track.id),
      title: track.name || 'Unknown Title',
      artist: track.artist_name || 'Unknown Artist',
      album: track.album_name || 'Unknown Album',
      artwork: track.image || 'https://via.placeholder.com/300',
      previewUrl: track.audio || null,
      audioUrl: track.audio || '',
      genre: genreName,
      duration: (track.duration || 180) * 1000,
      releaseDate: track.releasedate || new Date().toISOString(),
    }));

    return songs;
    
  } catch (error) {
    console.error(`❌ Error fetching songs for genre ${genreName}:`, error);
    return [];
  }
                 }
