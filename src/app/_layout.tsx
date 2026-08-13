import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme, View, Text } from 'react-native';
import { Colors } from '@/constants/theme';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [appLockEnabled, setAppLockEnabled] = useState(false);

  useEffect(() => {
    async function checkAppLock() {
      try {
        const lockEnabled = await AsyncStorage.getItem('appLockEnabled');
        if (lockEnabled === 'true') {
          setAppLockEnabled(true);
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Otključajte aplikaciju',
            fallbackLabel: 'Koristi lozinku',
          });
          if (result.success) {
            setIsUnlocked(true);
          } else {
            setIsUnlocked(false);
          }
        } else {
          setIsUnlocked(true);
        }
      } catch (e) {
        setIsUnlocked(true);
      }
    }
    
    async function setupNotifications() {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          return;
        }

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

    checkAppLock().then(setupNotifications);
  }, []);

  if (appLockEnabled && !isUnlocked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <MaterialIcons name="lock" size={64} color={colors.text} />
        <Text style={{ color: colors.text, fontSize: 18, marginTop: 16 }}>Aplikacija je zaključana</Text>
      </View>
    );
  }

  return (
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          tabBarStyle: {
            backgroundColor: scheme === 'dark' ? '#121212' : '#FFFFFF',
            borderTopColor: scheme === 'dark' ? '#2C2C2E' : '#D1D1D6',
            borderTopWidth: 1,
            height: 70,
            paddingBottom: 12,
            paddingTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: scheme === 'dark' ? 0.5 : 0.1,
            shadowRadius: 8,
            elevation: 15,
          },
          tabBarActiveTintColor: scheme === 'dark' ? '#64D2FF' : '#007AFF',
          tabBarInactiveTintColor: scheme === 'dark' ? '#A0A0A5' : '#8E8E93',
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '700',
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
          name="settings"
          options={{
            title: 'Postavke',
            tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={26} color={color} />,
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
        <Tabs.Screen
          name="pay"
          options={{
            href: null,
          }}
        />
      </Tabs>
  );
}
