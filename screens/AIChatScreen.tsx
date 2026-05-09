import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song, ChatMessage } from '../lib/types';
import { theme } from '../lib/theme';
import { searchSongs, getLyrics } from '../lib/api';
import { genres, genreDescriptions, musicFacts } from '../lib/data';
import SongCard from '../components/SongCard';

// ── NEW: pick audio/video files on web + native ──────────────────────────────
import * as DocumentPicker from 'expo-document-picker';

interface AIChatScreenProps {
  navigation: any;
  onSongPress: (song: Song) => void;
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  text:
    'Halo! 🎵 Saya adalah AI asisten musikmu. Saya bisa membantu kamu:\n\n' +
    '🔍 Mencari lagu dan artis\n' +
    '📝 Mencari lirik lagu\n' +
    '🎶 Menjelaskan genre musik\n' +
    '💡 Memberikan fakta menarik tentang musik\n' +
    '🎧 Menganalisis file musikmu (tekan tombol 📎)\n\n' +
    'Coba tanyakan sesuatu! Misalnya:\n' +
    '• "Cari lagu Taylor Swift"\n' +
    '• "Apa itu genre K-Pop?"\n' +
    '• "Lirik lagu Bohemian Rhapsody"\n' +
    '• "Fakta musik yang menarik"',
  isUser: false,
  timestamp: new Date(),
};

// ── Claude API call ──────────────────────────────────────────────────────────
async function callClaudeAPI(
  systemPrompt: string,
  userContent: string | { type: string; [k: string]: any }[],
): Promise<string> {
  const messages: { role: string; content: any }[] = [
    { role: 'user', content: userContent },
  ];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.content?.find((b: any) => b.type === 'text')?.text ?? 'Tidak ada respons.';
}

// ── Read file as base64 ──────────────────────────────────────────────────────
async function fileToBase64(uri: string): Promise<string> {
  // On React Native we use fetch → blob → FileReader
  const resp = await fetch(uri);
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // strip data:...;base64,
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AIChatScreen({ navigation, onSongPress }: AIChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const addBotMessage = (text: string, songs?: Song[]) => {
    const msg: ChatMessage = {
      id: generateId(),
      text,
      isUser: false,
      timestamp: new Date(),
      songs,
    };
    setMessages(prev => [...prev, msg]);
    scrollToBottom();
  };

  // ── Upload & analyze music file ──────────────────────────────────────────
  const handleUploadMusic = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'video/*'],
        copyToCacheDirectory: true,
      });

      // expo-document-picker v11+: result.canceled
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const { name, mimeType, uri, size } = asset;

      // Safety: block huge files (>20 MB) to avoid OOM
      if (size && size > 20 * 1024 * 1024) {
        Alert.alert('File terlalu besar', 'Maksimal 20 MB untuk analisis.');
        return;
      }

      const userMsg: ChatMessage = {
        id: generateId(),
        text: `🎵 Upload: ${name}`,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      scrollToBottom();
      setIsTyping(true);

      // ── Build prompt for Claude ──────────────────────────────────────────
      // Audio analysis via API (base64 document)
      try {
        const base64 = await fileToBase64(uri);
        const mediaType = (mimeType || 'audio/mpeg') as string;

        // Claude supports audio in "document" block (claude-sonnet-4-20250514+)
        const content = [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: 'text',
            text:
              `Analisis file audio berikut dengan detail:\n` +
              `Nama file: ${name}\n\n` +
              `Berikan analisis musikal lengkap dalam Bahasa Indonesia meliputi:\n` +
              `1. 🎵 Genre & sub-genre yang terdeteksi\n` +
              `2. 🎸 Instrumen yang terdengar\n` +
              `3. 🥁 Tempo / BPM (perkiraan)\n` +
              `4. 🎼 Tangga nada / kunci (jika bisa dideteksi)\n` +
              `5. 😊 Mood & emosi lagu\n` +
              `6. ⚡ Energi & intensitas\n` +
              `7. 🎤 Vokal (ada/tidak, gaya)\n` +
              `8. 💬 Kesan umum & rekomendasi pendengar`,
          },
        ];

        const reply = await callClaudeAPI(
          'Kamu adalah analis musik profesional. Analisis file audio yang diberikan secara detail dan akurat. Gunakan Bahasa Indonesia.',
          content,
        );
        addBotMessage(reply);
      } catch (apiErr: any) {
        // Fallback: Claude tidak bisa baca audio langsung → analisis dari nama file
        console.log('Audio API failed, falling back to metadata analysis:', apiErr?.message);
        const reply = await callClaudeAPI(
          'Kamu adalah analis musik profesional. Jawab dalam Bahasa Indonesia.',
          `Saya upload file musik bernama: "${name}" (tipe: ${mimeType}, ukuran: ${size ? Math.round(size / 1024) + ' KB' : 'unknown'}).\n\n` +
          `Berikan analisis berdasarkan nama file ini (tebak genre, mood, dsb), dan tips untuk menganalisis musik secara umum. ` +
          `Catatan: analisis ini hanya berdasarkan metadata karena audio tidak bisa dibaca langsung oleh AI saat ini.`,
        ).catch(() => 'Maaf, terjadi kesalahan saat menganalisis file. Coba lagi ya! 😅');
        addBotMessage('⚠️ Analisis audio penuh tidak tersedia, ini estimasi berdasarkan metadata:\n\n' + reply);
      }
    } catch (err: any) {
      if (!err?.message?.includes('cancel')) {
        addBotMessage('Gagal membuka file. Coba lagi ya! 😅');
      }
    } finally {
      setIsTyping(false);
    }
  };

  // ── Regular text query ────────────────────────────────────────────────────
  const processQuery = async (query: string) => {
    const lower = query.toLowerCase().trim();
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 400));

    try {
      // Genre questions
      if (lower.includes('genre') || lower.includes('apa itu')) {
        for (const genre of genres) {
          const genreName = genre.name.toLowerCase();
          if (lower.includes(genreName) || lower.includes(genre.id)) {
            const desc = genreDescriptions[genre.id] || genre.description;
            addBotMessage(`🎶 **${genre.name}**\n\n${desc}\n\nEmoji: ${genre.icon}\nWarna genre: ${genre.color}`);
            setIsTyping(false);
            return;
          }
        }
        addBotMessage(
          '🎵 Ada banyak genre musik yang bisa saya jelaskan!\n\n' +
          genres.map(g => `${g.icon} ${g.name}`).join(' | ') +
          '\n\nTanyakan tentang genre tertentu, misalnya: "Apa itu genre K-Pop?"',
        );
        setIsTyping(false);
        return;
      }

      // Lyrics
      if (lower.includes('lirik') || lower.includes('lyrics')) {
        let searchTerm = query;
        ['lirik lagu', 'lirik', 'lyrics', 'cari lirik', 'carikan lirik'].forEach(w => {
          searchTerm = searchTerm.replace(new RegExp(w, 'gi'), '').trim();
        });
        if (searchTerm.length > 1) {
          addBotMessage(`🔍 Mencari lirik untuk "${searchTerm}"...`);
          const songs = await searchSongs(searchTerm, 5);
          if (songs.length > 0) {
            const song = songs[0];
            const lyrics = await getLyrics(song.artist, song.title);
            if (lyrics) {
              addBotMessage(
                `📝 **Lirik ${song.title} - ${song.artist}**\n\n${lyrics.substring(0, 1500)}${lyrics.length > 1500 ? '\n\n... (dilanjutkan)' : ''}`,
                [song],
              );
            } else {
              addBotMessage(
                `Saya menemukan "${song.title}" oleh ${song.artist}, tapi lirik belum tersedia. 😔\n\nTap lagu untuk melihat detailnya.`,
                [song],
              );
            }
          } else {
            addBotMessage('Maaf, tidak bisa menemukan lagu tersebut. Coba nama yang lebih spesifik. 🤔');
          }
        } else {
          addBotMessage('Tentukan judul lagu! Contoh: "Lirik lagu Bohemian Rhapsody" 🎵');
        }
        setIsTyping(false);
        return;
      }

      // Facts
      if (lower.includes('fakta') || lower.includes('fact') || lower.includes('tahukah') || lower.includes('menarik')) {
        const randomFacts = musicFacts.sort(() => Math.random() - 0.5).slice(0, 3);
        addBotMessage('💡 **Fakta Menarik Tentang Musik:**\n\n' + randomFacts.map((f, i) => `${i + 1}. ${f}`).join('\n\n'));
        setIsTyping(false);
        return;
      }

      // Search song
      if (lower.includes('cari') || lower.includes('search') || lower.includes('putar') || lower.includes('dengar') || lower.includes('lagu')) {
        let searchTerm = query;
        ['cari lagu', 'carikan lagu', 'cari', 'search', 'putar', 'dengar', 'lagu', 'tolong cari', 'minta'].forEach(w => {
          searchTerm = searchTerm.replace(new RegExp(w, 'gi'), '').trim();
        });
        if (searchTerm.length > 1) {
          addBotMessage(`🔍 Mencari "${searchTerm}"...`);
          const songs = await searchSongs(searchTerm, 8);
          if (songs.length > 0) {
            addBotMessage(`🎵 Ditemukan ${songs.length} lagu untuk "${searchTerm}"! Tap untuk mendengarkan:`, songs);
          } else {
            addBotMessage('Maaf, tidak ada lagu yang ditemukan. Coba kata kunci lain. 🤔');
          }
        } else {
          addBotMessage('Sebutkan lagu atau artis yang ingin kamu cari! Contoh: "Cari lagu Ed Sheeran" 🎶');
        }
        setIsTyping(false);
        return;
      }

      // Popular artists
      const popularArtists = ['taylor swift', 'bts', 'ed sheeran', 'billie eilish', 'the weeknd', 'adele', 'drake', 'dua lipa', 'blackpink', 'coldplay', 'bruno mars', 'ariana grande', 'justin bieber', 'bad bunny', 'rosalia'];
      for (const artist of popularArtists) {
        if (lower.includes(artist)) {
          addBotMessage(`🔍 Mencari musik dari ${artist}...`);
          const songs = await searchSongs(artist, 6);
          if (songs.length > 0) {
            addBotMessage(`🎤 Lagu dari ${artist.charAt(0).toUpperCase() + artist.slice(1)}:`, songs);
          }
          setIsTyping(false);
          return;
        }
      }

      // Default: try search + Claude fallback
      if (query.trim().length > 2) {
        addBotMessage(`🔍 Mencari "${query}"...`);
        const songs = await searchSongs(query, 5);
        if (songs.length > 0) {
          addBotMessage(`🎵 Ini yang saya temukan untuk "${query}":`, songs);
        } else {
          // Use Claude for general music questions
          try {
            const reply = await callClaudeAPI(
              'Kamu adalah asisten musik yang ramah dan berpengetahuan luas. Jawab dalam Bahasa Indonesia. Fokus hanya pada topik musik.',
              query,
            );
            addBotMessage(reply);
          } catch {
            addBotMessage(
              'Hmm, saya tidak yakin apa yang kamu maksud. Coba:\n\n' +
              '• "Cari lagu [judul/artis]"\n' +
              '• "Lirik lagu [judul]"\n' +
              '• "Apa itu genre [nama genre]"\n' +
              '• "Fakta musik yang menarik"',
            );
          }
        }
      } else {
        addBotMessage('Tanyakan sesuatu tentang musik! Saya bisa membantu mencari lagu, lirik, dan menjelaskan genre. 🎵');
      }
    } catch {
      addBotMessage('Maaf, terjadi kesalahan. Coba lagi ya! 😅');
    }
    setIsTyping(false);
  };

  const sendMessage = () => {
    if (!input.trim() || isTyping) return;
    const userMsg: ChatMessage = {
      id: generateId(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    const query = input.trim();
    setInput('');
    scrollToBottom();
    processQuery(query);
  };

  // ── FIX: songs rendered INSIDE message container, not outside ─────────────
  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageWrapper, item.isUser && styles.userMessageWrapper]}>
      {!item.isUser && (
        <View style={styles.botAvatar}>
          <Ionicons name="musical-note" size={16} color="#fff" />
        </View>
      )}
      <View style={[styles.messageGroup, item.isUser && styles.userMessageGroup]}>
        <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, item.isUser && styles.userMessageText]}>
            {item.text}
          </Text>
        </View>
        {/* FIX: songs inside message group, not detached */}
        {item.songs && item.songs.length > 0 && (
          <View style={styles.songsContainer}>
            {item.songs.map(song => (
              <SongCard key={song.id} song={song} onPress={onSongPress} compact />
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              <Ionicons name="sparkles" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Musik</Text>
              <Text style={styles.headerSubtitle}>{isTyping ? 'Sedang mengetik...' : 'Online'}</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        {/* Typing indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.typingText}>AI sedang berpikir...</Text>
            </View>
          </View>
        )}

        {/* Input row — FIX: attach button added */}
        <View style={styles.inputContainer}>
          {/* Upload music button */}
          <Pressable
            style={styles.attachButton}
            onPress={handleUploadMusic}
            disabled={isTyping}
          >
            <Ionicons
              name="musical-notes-outline"
              size={22}
              color={isTyping ? theme.colors.textMuted : theme.colors.primaryLight}
            />
          </Pressable>

          <TextInput
            style={styles.textInput}
            placeholder="Tanya tentang musik..."
            placeholderTextColor={theme.colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            editable={!isTyping}
            multiline
            maxLength={500}
          />

          <Pressable
            style={[styles.sendButton, (!input.trim() || isTyping) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || isTyping}
          >
            <Ionicons
              name="send"
              size={20}
              color={input.trim() && !isTyping ? '#fff' : theme.colors.textMuted}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: '700' },
  headerSubtitle: { color: theme.colors.success, fontSize: theme.fontSize.xs },
  messagesList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  // ── FIX: proper layout for message + songs ──────────────────────────────
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '90%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageGroup: {
    flex: 1,
    gap: 6,
  },
  userMessageGroup: {
    alignItems: 'flex-end',
  },
  botAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8, marginTop: 2, flexShrink: 0,
  },
  messageBubble: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 18 },
  botBubble: { backgroundColor: theme.colors.surfaceLight, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  messageText: { color: theme.colors.text, fontSize: theme.fontSize.md, lineHeight: 22 },
  userMessageText: { color: '#fff' },
  songsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
  },

  typingContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 18, borderBottomLeftRadius: 4, alignSelf: 'flex-start',
  },
  typingText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },

  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 12, gap: 8,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  attachButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border,
  },
  textInput: {
    flex: 1, color: theme.colors.text, fontSize: theme.fontSize.md,
    maxHeight: 80, paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: theme.colors.surfaceLight, borderRadius: 20,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: theme.colors.surfaceLight },
});
