import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../lib/types';
import { theme } from '../lib/theme';
import { formatDuration } from '../lib/api';

interface SongCardProps {
  song: Song;
  onPress: (song: Song) => void;
  isPlaying?: boolean;
  compact?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SongCard({ song, onPress, isPlaying, compact }: SongCardProps) {
  return (
    <Pressable
      style={[styles.container, compact && styles.compact]}
      onPress={() => onPress(song)}
      android_ripple={{ color: 'rgba(139,92,246,0.1)' }}
    >
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: song.artwork }}
          style={[styles.artwork, compact && styles.artworkCompact]}
          contentFit="cover"
          placeholder={require('../assets/icon.png')}
          transition={200}
        />
        {isPlaying && (
          <View style={styles.playingOverlay}>
            <Ionicons name="musical-note" size={16} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
        {!compact && (
          <View style={styles.metaRow}>
            <View style={[styles.genreTag, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={styles.genreText}>{song.genre}</Text>
            </View>
            <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        {song.previewUrl ? (
          <Ionicons name="play-circle" size={32} color={theme.colors.primary} />
        ) : (
          <Ionicons name="play-circle-outline" size={32} color={theme.colors.textMuted} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  compact: {
    paddingVertical: 6,
  },
  artworkContainer: {
    position: 'relative',
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceLight,
  },
  artworkCompact: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  playingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    backgroundColor: 'rgba(139,92,246,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  artist: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  genreTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  genreText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  duration: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
