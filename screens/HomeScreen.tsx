import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song, Genre } from '../lib/types';
import { theme } from '../lib/theme';
import { searchSongs, getTopSongs } from '../lib/api';
import { genres, musicFacts } from '../lib/data';
import SongCard from '../components/SongCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
  onSongPress: (song: Song) => void;
}

export default function HomeScreen({ navigation, onSongPress }: HomeScreenProps) {
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fact, setFact] = useState('');

  useEffect(() => {
    loadData();
    setFact(musicFacts[Math.floor(Math.random() * musicFacts.length)]);
  }, []);

  const loadData = async () => {
    try {
      const songs = await getTopSongs(15);
      setTopSongs(songs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setFact(musicFacts[Math.floor(Math.random() * musicFacts.length)]);
    setRefreshing(false);
  };

  const renderGenreItem = ({ item }: { item: Genre }) => (
    <Pressable
      style={[styles.genreCard, { backgroundColor: item.color + '20' }]}
      onPress={() => navigation.navigate('GenreDetail', { genre: item })}
    >
      <Text style={styles.genreIcon}>{item.icon}</Text>
      <Text style={[styles.genreName, { color: item.color }]}>{item.name}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={topSongs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>🎵 Selamat Datang</Text>
                <Text style={styles.subtitle}>Temukan musik favoritmu</Text>
              </View>
              <Pressable style={styles.profileButton} onPress={() => navigation.navigate('AIChat')}>
                <Ionicons name="sparkles" size={22} color={theme.colors.primary} />
              </Pressable>
            </View>

            {/* Music Fact */}
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>💡 Tahukah Kamu?</Text>
              <Text style={styles.factText}>{fact}</Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cari Musik</Text>
              <View style={styles.quickActions}>
                <Pressable style={styles.actionButton} onPress={() => navigation.navigate('Search')}>
                  <Ionicons name="search" size={20} color={theme.colors.primary} />
                  <Text style={styles.actionText}>Cari Lagu</Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => navigation.navigate('AIChat')}>
                  <Ionicons name="chatbubbles" size={20} color={theme.colors.secondary} />
                  <Text style={styles.actionText}>Tanya AI</Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => navigation.navigate('Genres')}>
                  <Ionicons name="grid" size={20} color={theme.colors.accent} />
                  <Text style={styles.actionText}>Genre</Text>
                </Pressable>
              </View>
            </View>

            {/* Genres */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Genre Populer</Text>
                <Pressable onPress={() => navigation.navigate('Genres')}>
                  <Text style={styles.seeAll}>Lihat Semua</Text>
                </Pressable>
              </View>
              <FlatList
                data={genres.slice(0, 8)}
                renderItem={renderGenreItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.genreList}
              />
            </View>

            {/* Top Songs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 Lagu Populer</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <SongCard song={item} onPress={onSongPress} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  greeting: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  factCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  factLabel: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    marginBottom: 6,
  },
  factText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  seeAll: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  genreList: {
    gap: 10,
    paddingRight: 20,
    marginTop: 12,
  },
  genreCard: {
    width: 100,
    height: 90,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  genreIcon: {
    fontSize: 28,
  },
  genreName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
});
