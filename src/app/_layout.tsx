import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Povijest',
          tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Novi Račun',
          tabBarIcon: ({ color }) => <MaterialIcons name="add-circle" size={24} color={color} />,
        }}
      />
      {/* We can hide other screens like explore if they exist, or just delete them */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // hides from tabs
        }}
      />
    </Tabs>
  );
}
