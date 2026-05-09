import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song } from '../lib/types';
import { theme } from '../lib/theme';
import { searchSongs } from '../lib/api';
import SongCard from '../components/SongCard';

interface SearchScreenProps {
  navigation: any;
  onSongPress: (song: Song) => void;
}

const RECENT_SEARCHES_KEY = 'recent_searches';

const popularSearches = [
  'Taylor Swift', 'BTS', 'Ed Sheeran', 'Billie Eilish',
  'The Weeknd', 'Adele', 'Drake', 'Dua Lipa',
  'BLACKPINK', 'Coldplay', 'Bruno Mars', 'Ariana Grande',
];

export default function SearchScreen({ navigation, onSongPress }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    
    setQuery(q);
    setLoading(true);
    setSearched(true);
    
    try {
      const songs = await searchSongs(q, 25);
      setResults(songs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={theme.colors.textMuted} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Cari lagu, artis, album..."
              placeholderTextColor={theme.colors.textMuted}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Mencari musik...</Text>
          </View>
        ) : searched ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SongCard song={item} onPress={onSongPress} />
            )}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Ionicons name="search-outline" size={64} color={theme.colors.textMuted} />
                <Text style={styles.emptyTitle}>Tidak Ditemukan</Text>
                <Text style={styles.emptySubtitle}>Coba kata kunci lain</Text>
              </View>
            }
            contentContainerStyle={results.length === 0 ? styles.flex : styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionTitle}>🔥 Pencarian Populer</Text>
            <View style={styles.tagContainer}>
              {popularSearches.map((term) => (
                <Pressable
                  key={term}
                  style={styles.tag}
                  onPress={() => handleSearch(term)}
                >
                  <Text style={styles.tagText}>{term}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.suggestionTitle, { marginTop: 24 }]}>💡 Tips Pencarian</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipRow}>
                <Ionicons name="musical-note" size={18} color={theme.colors.primary} />
                <Text style={styles.tipText}>Cari judul lagu untuk menemukan lirik</Text>
              </View>
              <View style={styles.tipRow}>
                <Ionicons name="person" size={18} color={theme.colors.secondary} />
                <Text style={styles.tipText}>Cari nama artis untuk discography</Text>
              </View>
              <View style={styles.tipRow}>
                <Ionicons name="chatbubbles" size={18} color={theme.colors.accent} />
                <Text style={styles.tipText}>Tanya AI untuk info genre & musik</Text>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    padding: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    marginTop: 8,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  suggestionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  tipsContainer: {
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
});
