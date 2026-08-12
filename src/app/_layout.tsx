import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  useEffect(() => {
    async function setupNotifications() {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          return; // permission denied
        }

        // Schedule monthly reminder
        await Notifications.cancelAllScheduledNotificationsAsync();
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Vrijeme je za račune! 📅",
            body: "Jeste li poplaćali i unijeli sve račune za ovaj mjesec?",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            day: 20,
            hour: 10,
            minute: 0,
            repeats: true,
          },
        });
      } catch (e) {
        console.warn('Notification setup failed:', e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    setupNotifications();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: scheme === 'dark' ? '#1C1C1E' : '#F8F8F8',
          borderTopColor: scheme === 'dark' ? '#38383A' : '#E5E5EA',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: scheme === 'dark' ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 10,
        },
        tabBarActiveTintColor: '#208AEF',
        tabBarInactiveTintColor: scheme === 'dark' ? '#8E8E93' : '#999999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Povijest',
          tabBarIcon: ({ color }) => <MaterialIcons name="history" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Novi Račun',
          tabBarIcon: ({ color }) => <MaterialIcons name="add-circle" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Kategorije',
          tabBarIcon: ({ color }) => <MaterialIcons name="category" size={26} color={color} />,
        }}
      />
      {/* We can hide other screens like explore if they exist, or just delete them */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // hides from tabs
        }}
      />
      {/* Also hide edit and scan which are modal/stack screens in app root but might accidentally show if misconfigured */}
      <Tabs.Screen
        name="scan"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
