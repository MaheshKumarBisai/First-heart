import { Tabs } from 'expo-router';
import { Home, Armchair, Calendar, User, Film } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B0B15', // Dark theme background
          borderTopWidth: 0,
          elevation: 0,
          height: 90, // Increased for phone navigation spacing
          paddingBottom: 30, // Increased to bring content above native nav
        },
        tabBarActiveTintColor: '#8A2BE2', // Purple
        tabBarInactiveTintColor: '#6B7280', // Gray
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cinema"
        options={{
          title: 'Cinema',
          tabBarIcon: ({ color, size }) => <Film color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shows"
        options={{
          title: 'Movies',
          tabBarIcon: ({ color, size }) => <Film color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
