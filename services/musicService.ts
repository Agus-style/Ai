export async function getTrendingSongs(): Promise<Song[]> {
  try {
    console.log('Fetching trending songs from Jamendo...');
    
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: 20,
        order: 'popularity_total',
      },
    });

    console.log('Jamendo response:', response.data.results?.length || 0, 'songs found');

    const songs = response.data.results.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      album: track.album_name,
      artwork: track.image,
      previewUrl: track.audio,
      audioUrl: track.audio,  // FULL LAGU!
      genre: 'Popular',
      duration: track.duration * 1000,
      releaseDate: track.releasedate || new Date().toISOString(),
    }));

    console.log('Mapped songs:', songs.length);
    return songs;
    
  } catch (error) {
    console.error('Error fetching trending songs:', error);
    return [];
  }
}
