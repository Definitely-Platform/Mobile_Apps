import { Tabs } from 'expo-router';
import { useColorScheme, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          display: isAuthenticated ? 'flex' : 'none',
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 52 : 60,
          paddingTop: 3,
          paddingBottom: Platform.OS === 'ios' ? 6 : 4,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hub',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={19} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Platform',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'layers' : 'layers-outline'} size={19} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'pulse' : 'pulse-outline'} size={19} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={19} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="auth/callback"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
