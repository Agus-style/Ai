import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../lib/types';
import { theme } from '../lib/theme';

interface MiniPlayerProps {
  song: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPress: () => void;
}

export default function MiniPlayer({ song, isPlaying, onTogglePlay, onPress }: MiniPlayerProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: '35%' }]} />
      </View>
      <View style={styles.content}>
        <Image
          source={{ uri: song.artwork }}
          style={styles.artwork}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
        </View>
        <Pressable onPress={onTogglePlay} style={styles.playButton}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={28}
            color={theme.colors.text}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceLight,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  progressBackground: {
    height: 2,
    backgroundColor: theme.colors.border,
  },
  progressFill: {
    height: 2,
    backgroundColor: theme.colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 12,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  info: {
    flex: 1,
    gap: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  artist: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  playButton: {
    padding: 4,
  },
});
