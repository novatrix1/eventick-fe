import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

/* =======================
   TYPES
======================= */

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

type ScreenConfig = {
  name: string;
  title: string;
  icon: IoniconsName;
  iconFocused: IoniconsName;
};

/* =======================
   SCREENS CONFIG
======================= */

const screens: ScreenConfig[] = [
  { name: 'home', title: 'Accueil', icon: 'home-outline', iconFocused: 'home' },
  { name: 'explore', title: 'Explorer', icon: 'compass-outline', iconFocused: 'compass' },
  { name: 'ticket', title: 'Tickets', icon: 'ticket-outline', iconFocused: 'ticket' },
  { name: 'notification', title: 'Notifications', icon: 'notifications-outline', iconFocused: 'notifications' },
  { name: 'profile', title: 'Profil', icon: 'person-outline', iconFocused: 'person' },
];

/* =======================
   TABS LAYOUT
======================= */

export default function TabsLayout() {
  const { unreadCount } = useUnreadNotifications();
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00f5ff',
        tabBarInactiveTintColor: '#B0BEC5',
        tabBarLabelStyle: styles.label,

        /* 🔑 RESPONSIVE ANDROID / IOS */
        tabBarStyle: [
          styles.tabBarBase,
          isAndroid ? styles.androidTabBar : styles.iosTabBar,
          {
            paddingBottom: isAndroid
              ? Math.max(insets.bottom, 8)
              : insets.bottom + 10,
          },
        ],

        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(0, 20, 24, 0.98)', 'rgba(0, 50, 58, 0.98)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      {screens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: ({ focused, color }) => (
              <View style={[styles.iconWrapper, focused && styles.iconFocused]}>
                <Ionicons
                  name={focused ? screen.iconFocused : screen.icon}
                  size={22}
                  color={color}
                />

                {/* 🔴 BADGE NOTIFICATIONS */}
                {screen.name === 'notification' && unreadCount > 0 && (
                  <View
                    style={[
                      styles.badge,
                      unreadCount > 99 ? styles.badgeLarge : styles.badgeNormal,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}

                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  tabBarBase: {
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  /* 🍏 iOS — flottant */
  iosTabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    height: 90,
    borderRadius: 22,
    overflow: 'hidden',
  },

  /* 🤖 Android — FIXE (pas absolu) */
  androidTabBar: {
    position: 'relative',
    height: 72,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },

  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
    position: 'relative',
  },

  iconFocused: {
    transform: [{ scale: 1.05 }],
  },

  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 12,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#00f5ff',
  },

  /* 🔴 BADGE */
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 20, 24, 1)',
  },

  badgeNormal: {
    minWidth: 18,
    height: 18,
  },

  badgeLarge: {
    minWidth: 24,
    height: 18,
    paddingHorizontal: 4,
  },

  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 14,
  },
});
