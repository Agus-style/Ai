import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Song } from '../lib/types';

export function useAudioPlayer() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Setup audio mode for background play
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('✅ Audio mode configured');
      } catch (err) {
        console.error('❌ Audio mode error:', err);
      }
    };
    setupAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Track progress
  useEffect(() => {
    if (isPlaying && soundRef.current) {
      progressInterval.current = setInterval(async () => {
        try {
          const status = await soundRef.current?.getStatusAsync();
          if (status?.isLoaded) {
            setPositionMillis(status.positionMillis);
            
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPositionMillis(0);
            }
          }
        } catch (err) {
          console.log('Progress error:', err);
        }
      }, 1000);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying]);

  const playSong = useCallback(async (song: Song) => {
    if (!song.audioUrl) {
      setError(`No audio URL for: ${song.title}`);
      console.error('❌ No audioUrl:', song.title);
      return;
    }

    console.log(`🎵 Playing: ${song.title}`);
    console.log(`🔗 Audio URL: ${song.audioUrl}`);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      
      // Get duration
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setDurationMillis(status.durationMillis || 0);
        setPositionMillis(0);
      }
      
      setCurrentSong(song);
      setIsPlaying(true);
      setIsLoading(false);
      
      console.log(`✅ Playing: ${song.title} (${song.duration / 1000}s)`);
      
    } catch (err) {
      console.error('❌ Play error:', err);
      setError('Failed to play song');
      setIsLoading(false);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!soundRef.current) return;
    
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          console.log('⏸️ Paused');
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
          console.log('▶️ Resumed');
        }
      }
    } catch (err) {
      console.error('Toggle play error:', err);
    }
  }, [isPlaying]);

  const seekTo = useCallback(async (millis: number) => {
    if (soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(millis);
        setPositionMillis(millis);
      } catch (err) {
        console.error('Seek error:', err);
      }
    }
  }, []);

  const stopPlayback = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        setIsPlaying(false);
        setPositionMillis(0);
      } catch (err) {
        console.error('Stop error:', err);
      }
    }
  }, []);

  return {
    currentSong,
    isPlaying,
    positionMillis,
    durationMillis,
    isLoading,
    error,
    playSong,
    togglePlay,
    seekTo,
    stopPlayback,
  };
}
