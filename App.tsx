import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './lib/theme';
import { Song } from './lib/types';
import { useAudioPlayer } from './hooks/useAudioPlayer';

import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import GenresScreen from './screens/GenresScreen';
import GenreDetailScreen from './screens/GenreDetailScreen';
import PlayerScreen from './screens/PlayerScreen';
import LyricsScreen from './screens/LyricsScreen';
import AIChatScreen from './screens/AIChatScreen';
import MiniPlayer from './components/MiniPlayer';

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
          const genre = props.route.params?.genre;
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
          const genre = props.route.params?.genre;
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
  
  const {
    currentSong,
    isPlaying,
    positionMillis,
    durationMillis,
    isLoading,
    playSong,
    togglePlay,
    seekTo,
  } = useAudioPlayer();

  const [showPlayer, setShowPlayer] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  const handleSongPress = useCallback((song: Song) => {
    console.log('App: handleSongPress', song.title);
    setShowPlayer(true);
    playSong(song);
  }, [playSong]);

  const handleMiniPlayerPress = () => {
    if (currentSong) setShowPlayer(true);
  };

  const handleLyricsPress = () => {
    setShowPlayer(false);
    setShowLyrics(true);
  };

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
              height: 60,
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

        {showPlayer && currentSong && (
          <View style={styles.modalOverlay}>
            <PlayerScreen
              song={currentSong}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onLyricsPress={handleLyricsPress}
              positionMillis={positionMillis}
              durationMillis={durationMillis}
              onSeek={seekTo}
              isLoading={isLoading}
              navigation={{ goBack: () => setShowPlayer(false) }}
            />
          </View>
        )}

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
  miniPlayerWrapper: {
    position: 'absolute',
    bottom: 60,
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
