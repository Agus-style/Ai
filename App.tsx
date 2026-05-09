// ── PATCH: App.tsx — MiniPlayer fix ──────────────────────────────────────────
// BUG: MiniPlayer diimport tapi tidak pernah dirender
// FIX: Render MiniPlayer sebagai tabBarBackground di Tab.Navigator
//      agar muncul di atas tab bar, bukan terpisah

// Ganti bagian tabBarStyle di Tab.Navigator screenOptions:
// SEBELUM:
//   tabBarStyle: {
//     height: currentSong ? 110 : 60,
//     paddingBottom: currentSong ? 0 : 8,
//     ...
//   }
//
// SESUDAH: lihat implementasi di bawah

// ─────────────────────────────────────────────────────────────────────────────
// Perubahan yang harus diterapkan di App.tsx (tambah import MiniPlayer sudah ada):

// 1. Di screenOptions Tab.Navigator, ubah tabBarStyle:
//
//   tabBarStyle: {
//     backgroundColor: theme.colors.surface,
//     borderTopColor: theme.colors.border,
//     borderTopWidth: 1,
//     height: 60,     // ← tetap 60, MiniPlayer ditaruh TERPISAH di atas tab
//     paddingBottom: 8,
//     paddingTop: 4,
//   },

// 2. Tambahkan tabBarBackground prop:
//   tabBarBackground: () =>
//     currentSong ? (
//       <MiniPlayer
//         song={currentSong}
//         isPlaying={isPlaying}
//         onTogglePlay={togglePlay}
//         onPress={handleMiniPlayerPress}
//       />
//     ) : null,

// ─────────────────────────────────────────────────────────────────────────────
// ALTERNATIF LEBIH CLEAN: render MiniPlayer sebagai overlay di atas Tab

// Di dalam return App(), tambahkan sebelum </View>:
//
//   {currentSong && !showPlayer && (
//     <View style={styles.miniPlayerWrapper}>
//       <MiniPlayer
//         song={currentSong}
//         isPlaying={isPlaying}
//         onTogglePlay={togglePlay}
//         onPress={handleMiniPlayerPress}
//       />
//     </View>
//   )}

// Dan di styles, tambahkan:
//   miniPlayerWrapper: {
//     position: 'absolute',
//     bottom: 60,   // tinggi tab bar
//     left: 0,
//     right: 0,
//     zIndex: 50,
//   },

// Dan update tabBarStyle agar tidak resize:
//   tabBarStyle: {
//     backgroundColor: theme.colors.surface,
//     borderTopColor: theme.colors.border,
//     borderTopWidth: 1,
//     height: 60,
//     paddingBottom: 8,
//     paddingTop: 4,
//   },

// ─────────────────────────────────────────────────────────────────────────────
// FULL APP.TSX YANG SUDAH DIPATCH:

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { theme } from './lib/theme';
import { Song, Genre } from './lib/types';

import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import GenresScreen from './screens/GenresScreen';
import GenreDetailScreen from './screens/GenreDetailScreen';
import PlayerScreen from './screens/PlayerScreen';
import LyricsScreen from './screens/LyricsScreen';
import AIChatScreen from './screens/AIChatScreen';
import MiniPlayer from './components/MiniPlayer'; // ← sudah diimport

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack({ onSongPress }: { onSongPress: (song: Song) => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain">
        {(props) => <HomeScreen {...props} onSongPress={onSongPress} />}
      </Stack.Screen>
      <Stack.Screen name="GenreDetail">
        {(props: any) => {
          const genre = props.route.params?.genre as Genre | undefined;
          return <GenreDetailScreen {...props} genre={genre} onSongPress={onSongPress} />;
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function SearchStack({ onSongPress }: { onSongPress: (song: Song) => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain">
        {(props) => <SearchScreen {...props} onSongPress={onSongPress} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function GenresStack({ onSongPress }: { onSongPress: (song: Song) => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GenresMain">
        {(props) => <GenresScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="GenreDetail">
        {(props: any) => {
          const genre = props.route.params?.genre as Genre | undefined;
          return <GenreDetailScreen {...props} genre={genre} onSongPress={onSongPress} />;
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function AIChatStack({ onSongPress }: { onSongPress: (song: Song) => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AIChatMain">
        {(props) => <AIChatScreen {...props} onSongPress={onSongPress} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.log('Audio mode setup error:', e);
      }
    })();
    return () => { if (soundRef.current) soundRef.current.unloadAsync(); };
  }, []);

  const playSong = useCallback(async (song: Song) => {
    try {
      if (soundRef.current) { await soundRef.current.unloadAsync(); soundRef.current = null; }
      setCurrentSong(song);
      setIsPlaying(false);
      if (song.previewUrl) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: song.previewUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
              if (status.didJustFinish) setIsPlaying(false);
            }
          }
        );
        soundRef.current = sound;
        setIsPlaying(true);
      }
    } catch (e) { console.log('Play error:', e); }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) { await soundRef.current.pauseAsync(); setIsPlaying(false); }
        else { await soundRef.current.playAsync(); setIsPlaying(true); }
      }
    } catch (e) { console.log('Toggle play error:', e); }
  }, []);

  const handleSongPress = useCallback((song: Song) => {
    setCurrentSong(song);
    setShowPlayer(true);
    playSong(song);
  }, [playSong]);

  const handleMiniPlayerPress = () => { if (currentSong) setShowPlayer(true); };
  const handleLyricsPress = () => { setShowPlayer(false); setShowLyrics(true); };

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.secondary,
        },
        fonts: {
          regular: { fontFamily: Platform.OS === 'ios' ? 'System' : 'normal', fontWeight: '400' },
          medium: { fontFamily: Platform.OS === 'ios' ? 'System' : 'normal', fontWeight: '500' },
          bold: { fontFamily: Platform.OS === 'ios' ? 'System' : 'normal', fontWeight: '700' },
          heavy: { fontFamily: Platform.OS === 'ios' ? 'System' : 'normal', fontWeight: '900' },
        },
      }}
    >
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = 'home';
              if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
              else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
              else if (route.name === 'Genres') iconName = focused ? 'grid' : 'grid-outline';
              else if (route.name === 'AI Chat') iconName = focused ? 'sparkles' : 'sparkles-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textMuted,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              borderTopWidth: 1,
              height: 60,       // ← FIX: tidak resize, MiniPlayer overlay terpisah
              paddingBottom: 8,
              paddingTop: 4,
            },
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          })}
        >
          <Tab.Screen name="Home">{(props) => <HomeStack {...props} onSongPress={handleSongPress} />}</Tab.Screen>
          <Tab.Screen name="Search">{(props) => <SearchStack {...props} onSongPress={handleSongPress} />}</Tab.Screen>
          <Tab.Screen name="Genres">{(props) => <GenresStack {...props} onSongPress={handleSongPress} />}</Tab.Screen>
          <Tab.Screen name="AI Chat">{(props) => <AIChatStack {...props} onSongPress={handleSongPress} />}</Tab.Screen>
        </Tab.Navigator>

        {/* ── FIX: MiniPlayer sekarang dirender sebagai overlay di atas tab bar ── */}
        {currentSong && !showPlayer && !showLyrics && (
          <View style={styles.miniPlayerWrapper}>
            <MiniPlayer
              song={currentSong}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onPress={handleMiniPlayerPress}
            />
          </View>
        )}

        {/* Full Player Modal */}
        {showPlayer && currentSong && (
          <View style={styles.modalOverlay}>
            <PlayerScreen
              song={currentSong}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onLyricsPress={handleLyricsPress}
              navigation={{ goBack: () => setShowPlayer(false) }}
            />
          </View>
        )}

        {/* Lyrics Modal */}
        {showLyrics && currentSong && (
          <View style={styles.modalOverlay}>
            <LyricsScreen
              song={currentSong}
              isPlaying={isPlaying}
              onPlayPress={togglePlay}
              navigation={{ goBack: () => setShowLyrics(false) }}
            />
          </View>
        )}
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  // ── NEW: MiniPlayer positioned just above the tab bar ──
  miniPlayerWrapper: {
    position: 'absolute',
    bottom: 60,   // tinggi tab bar
    left: 0,
    right: 0,
    zIndex: 50,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    zIndex: 100,
  },
});
