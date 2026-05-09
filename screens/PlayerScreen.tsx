import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song } from '../lib/types';
import { theme } from '../lib/theme';
import { formatDuration } from '../lib/api';
import { Audio } from 'expo-av';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PlayerScreenProps {
  song: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onLyricsPress: () => void;
  navigation: any;
}

export default function PlayerScreen({ song, isPlaying, onTogglePlay, onLyricsPress, navigation }: PlayerScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.5;
          if (next >= song.duration) {
            setProgress(0);
            return 0;
          }
          setProgress(next / song.duration);
          return next;
        });
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, song.duration]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Sedang Diputar</Text>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: song.artwork }}
          style={styles.artwork}
          contentFit="cover"
          transition={400}
        />
        <View style={styles.artworkGlow} />
      </View>

      {/* Song Info */}
      <View style={styles.songInfo}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
            <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.genreTag}>
            <Text style={styles.genreText}>{song.genre}</Text>
          </View>
          <Text style={styles.albumText} numberOfLines={1}>{song.album}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatDuration(currentTime)}</Text>
          <Text style={styles.timeText}>{formatDuration(song.duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.controlButton}>
          <Ionicons name="shuffle" size={24} color={theme.colors.textMuted} />
        </Pressable>
        <Pressable style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={28} color={theme.colors.text} />
        </Pressable>
        <Pressable style={styles.playButton} onPress={onTogglePlay}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={36}
            color="#fff"
          />
        </Pressable>
        <Pressable style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={28} color={theme.colors.text} />
        </Pressable>
        <Pressable style={styles.controlButton}>
          <Ionicons name="repeat" size={24} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Pressable style={styles.actionButton} onPress={onLyricsPress}>
          <Ionicons name="document-text" size={20} color={theme.colors.primary} />
          <Text style={styles.actionText}>Lirik</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={theme.colors.secondary} />
          <Text style={styles.actionText}>Favorit</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color={theme.colors.accent} />
          <Text style={styles.actionText}>Bagikan</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
  },
  artwork: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
  },
  artworkGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: SCREEN_WIDTH * 0.25,
    backgroundColor: theme.colors.primary + '15',
    top: SCREEN_WIDTH * 0.1,
    zIndex: -1,
  },
  songInfo: {
    paddingHorizontal: 28,
    marginTop: 28,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  songTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
  },
  songArtist: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genreTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 8,
  },
  genreText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  albumText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    flex: 1,
  },
  progressSection: {
    paddingHorizontal: 28,
    marginTop: 24,
  },
  progressBackground: {
    height: 4,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 28,
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 28,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
  },
});
