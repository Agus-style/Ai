import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song, Genre } from '../lib/types';
import { theme } from '../lib/theme';
import { searchSongsByGenre } from '../lib/api';
import { genreDescriptions } from '../lib/data';
import SongCard from '../components/SongCard';

interface GenreDetailScreenProps {
  genre: Genre;
  onSongPress: (song: Song) => void;
  navigation: any;
}

export default function GenreDetailScreen({ genre, onSongPress, navigation }: GenreDetailScreenProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSongs();
  }, [genre.id]);

  const loadSongs = async () => {
    setLoading(true);
    try {
      const searchTerm = genre.searchTerms[0];
      const results = await searchSongsByGenre(searchTerm, 25);
      setSongs(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const description = genreDescriptions[genre.id] || genre.description;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Genre</Text>
        <View style={styles.backButton} />
      </View>

      {/* Genre Header */}
      <View style={[styles.genreHeader, { backgroundColor: genre.color + '15' }]}>
        <View style={[styles.genreIconLarge, { backgroundColor: genre.color + '25' }]}>
          <Text style={styles.genreIconText}>{genre.icon}</Text>
        </View>
        <Text style={[styles.genreName, { color: genre.color }]}>{genre.name}</Text>
        <Text style={styles.genreDescription}>{description}</Text>
      </View>

      {/* Songs */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Memuat lagu {genre.name}...</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SongCard song={item} onPress={onSongPress} />}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎶 Lagu {genre.name}</Text>
              <Text style={styles.songCount}>{songs.length} lagu</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Belum ada lagu tersedia</Text>
            </View>
          }
          contentContainerStyle={songs.length === 0 ? styles.flex : styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: { flex: 1 },
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
  genreHeader: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: 8,
  },
  genreIconLarge: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  genreIconText: {
    fontSize: 36,
  },
  genreName: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
  },
  genreDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  songCount: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
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
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
});
