import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, ActivityIndicator } from 'react-native';
import CameraScreen from './screens/CameraScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';
import NotesScreen from './screens/NotesScreen';
import { initDatabase } from './database';

const HomeScreen = ({ navigation }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text onPress={() => navigation.navigate('Camera')}
          style={{ fontSize: 18, padding: 20, backgroundColor: '#C9A96E', marginBottom: 10 }}>
      Open Camera
    </Text>
    <Text onPress={() => navigation.navigate('Result', {
      wine: {
        name: 'Château Margaux',
        vintage: 2018,
        producer: 'Château Margaux',
        region: 'Bordeaux',
        grape: 'Cabernet Sauvignon',
        appellation: 'Margaux AOC',
        tasting_notes: 'Dark plum, cedar, long finish.',
        food_pairings: ['Lamb', 'Duck confit', 'Aged cheese'],
      }
    })}
          style={{ fontSize: 18, padding: 20, backgroundColor: '#1D9E75' }}>
      Test Result Screen
    </Text>
  </View>
);

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack pour l'onglet Scan
function ScanStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"   component={HomeScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Notes"  component={NotesScreen} />
    </Stack.Navigator>
  );
}

// Stack pour l'onglet History
function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryMain" component={HistoryScreen} />
      <Stack.Screen name="Notes"       component={NotesScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setIsDbReady(true))
      .catch((err) => console.error('Erreur init DB:', err));
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6B2D3E" />
        <Text style={{ marginTop: 10 }}>Chargement de la base de données...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Scan"    component={ScanStack} />
        <Tab.Screen name="History" component={HistoryStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
