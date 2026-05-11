import axios from 'axios';
import { Song } from '../lib/types';

const JAMENDO_CLIENT_ID = '2a953e84';

export async function getTrendingSongs(): Promise<Song[]> {
  try {
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: 50,
        order: 'popularity_total',
      },
    });

    return response.data.results.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      album: track.album_name,
      artwork: track.image,
      previewUrl: track.audio,
      audioUrl: track.audio,
      genre: 'Popular',
      duration: track.duration * 1000,
      releaseDate: track.releasedate || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching trending songs:', error);
    return [];
  }
}

export async function searchSongs(query: string): Promise<Song[]> {
  try {
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: 50,
        search: query,
        order: 'popularity_total',
      },
    });

    return response.data.results.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      album: track.album_name,
      artwork: track.image,
      previewUrl: track.audio,
      audioUrl: track.audio,
      genre: 'Search Result',
      duration: track.duration * 1000,
      releaseDate: track.releasedate || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
}
