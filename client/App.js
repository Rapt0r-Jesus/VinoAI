import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';

// Placeholders temporaires
const HomeScreen    = () => <View><Text>Home</Text></View>;
const HistoryScreen = () => <View><Text>History</Text></View>;
const CameraScreen  = () => <View><Text>Camera</Text></View>;
const ResultScreen  = () => <View><Text>Result</Text></View>;
const NotesScreen   = () => <View><Text>Notes</Text></View>;

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"   component={HomeScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Notes"  component={NotesScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Scan"    component={MainStack} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
