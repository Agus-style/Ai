import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Genre } from '../lib/types';
import { theme } from '../lib/theme';
import { genres } from '../lib/data';

interface GenresScreenProps {
  navigation: any;
}

export default function GenresScreen({ navigation }: GenresScreenProps) {
  const renderGenreItem = ({ item }: { item: Genre }) => (
    <Pressable
      style={[styles.genreCard, { borderLeftColor: item.color }]}
      onPress={() => navigation.navigate('GenreDetail', { genre: item })}
      android_ripple={{ color: 'rgba(139,92,246,0.1)' }}
    >
      <View style={[styles.genreIconContainer, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.genreIcon}>{item.icon}</Text>
      </View>
      <View style={styles.genreInfo}>
        <Text style={[styles.genreName, { color: item.color }]}>{item.name}</Text>
        <Text style={styles.genreDesc} numberOfLines={2}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>🎵 Genre Musik</Text>
        <Text style={styles.subtitle}>Jelajahi berbagai genre musik dari seluruh dunia</Text>
      </View>
      <FlatList
        data={genres}
        renderItem={renderGenreItem}
        keyExtractor={(item) => item.id}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  genreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    marginBottom: 10,
    gap: 14,
  },
  genreIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreIcon: {
    fontSize: 26,
  },
  genreInfo: {
    flex: 1,
    gap: 3,
  },
  genreName: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  genreDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    lineHeight: 16,
  },
});
