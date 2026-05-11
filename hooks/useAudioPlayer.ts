
import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Song } from '../lib/types';

export function useAudioPlayer() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(async () => {
        if (soundRef.current) {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            setPositionMillis(status.positionMillis);
            if (status.didJustFinish) setIsPlaying(false);
          }
        }
      }, 1000);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying]);

  const playSong = useCallback(async (song: Song) => {
    if (!song.audioUrl) {
      console.error('No audioUrl for song:', song.title);
      return;
    }

    setIsLoading(true);
    
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      const status = await sound.getStatusAsync();
      
      setCurrentSong(song);
      setIsPlaying(true);
      setPositionMillis(0);
      setDurationMillis(status.isLoaded ? status.durationMillis || 0 : 0);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Play error:', error);
      setIsLoading(false);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!soundRef.current) return;
    
    const status = await soundRef.current.getStatusAsync();
    if (status.isLoaded) {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  const seekTo = useCallback(async (millis: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(millis);
      setPositionMillis(millis);
    }
  }, []);

  return {
    currentSong,
    isPlaying,
    positionMillis,
    durationMillis,
    isLoading,
    playSong,
    togglePlay,
    seekTo,
  };
}
