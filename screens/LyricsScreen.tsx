import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Share, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song } from '../lib/types';
import { theme } from '../lib/theme';
import { getLyrics, formatDuration } from '../lib/api';

interface LyricsScreenProps {
  song: Song;
  onPlayPress: () => void;
  isPlaying: boolean;
  navigation: any;
}

export default function LyricsScreen({ song, onPlayPress, isPlaying, navigation }: LyricsScreenProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadLyrics();
  }, [song.id]);

  const loadLyrics = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await getLyrics(song.artist, song.title);
      setLyrics(result);
      if (!result) setError(true);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const shareLyrics = async () => {
    if (!lyrics) return;
    try {
      await Share.share({
        message: `🎵 ${song.title} - ${song.artist}\n\n${lyrics}`,
      });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Lirik Lagu</Text>
        <Pressable style={styles.shareButton} onPress={shareLyrics}>
          <Ionicons name="share-outline" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Song Info */}
      <View style={styles.songInfo}>
        <Image
          source={{ uri: song.artwork }}
          style={styles.artwork}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.songDetails}>
          <Text style={styles.songTitle} numberOfLines={2}>{song.title}</Text>
          <Text style={styles.songArtist}>{song.artist}</Text>
          <View style={styles.songMeta}>
            <View style={styles.genreTag}>
              <Text style={styles.genreText}>{song.genre}</Text>
            </View>
            <Text style={styles.albumText}>{song.album}</Text>
          </View>
        </View>
      </View>

      {/* Play Button */}
      {song.previewUrl && (
        <Pressable style={styles.playButton} onPress={onPlayPress}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color="#fff"
          />
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause Preview' : 'Putar Preview'}
          </Text>
        </Pressable>
      )}

      {/* Lyrics */}
      <View style={styles.lyricsSection}>
        <View style={styles.lyricsHeader}>
          <Text style={styles.lyricsTitle}>📝 Lirik</Text>
          <Pressable onPress={loadLyrics}>
            <Ionicons name="refresh" size={20} color={theme.colors.primary} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Mencari lirik...</Text>
          </View>
        ) : error || !lyrics ? (
          <View style={styles.errorContainer}>
            <Ionicons name="document-text-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.errorTitle}>Lirik Tidak Ditemukan</Text>
            <Text style={styles.errorSubtitle}>
              Maaf, lirik untuk lagu ini belum tersedia. Coba lagu lain atau cari manual.
            </Text>
            <Pressable style={styles.retryButton} onPress={loadLyrics}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.retryText}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView style={styles.lyricsScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.lyricsText}>{lyrics}</Text>
            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    alignItems: 'center',
  },
  artwork: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceLight,
  },
  songDetails: {
    flex: 1,
    gap: 4,
  },
  songTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  songArtist: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  genreTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 6,
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
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  playButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  lyricsSection: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  lyricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lyricsTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  errorTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    marginTop: 8,
  },
  errorSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  lyricsScroll: {
    flex: 1,
  },
  lyricsText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : undefined,
  },
  bottomSpacer: {
    height: 60,
  },
});
