import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  {
    name: 'dashboard',
    title: 'Tableau de bord',
    icon: 'speedometer-outline',
    iconFocused: 'speedometer',
  },
  {
    name: 'events',
    title: 'Événements',
    icon: 'calendar-outline',
    iconFocused: 'calendar',
  },
  {
    name: 'scan',
    title: 'Scan',
    icon: 'qr-code-outline',
    iconFocused: 'qr-code',
  },
  {
    name: 'payments',
    title: 'Paiements',
    icon: 'card-outline',
    iconFocused: 'card',
  },
  {
    name: 'profile',
    title: 'Profil',
    icon: 'person-outline',
    iconFocused: 'person',
  },
];

/* =======================
   TABS LAYOUT
======================= */

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00f5ff',
        tabBarInactiveTintColor: '#B0BEC5',
        tabBarLabelStyle: styles.label,

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

  /* 🍏 iOS — tab bar flottante */
  iosTabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    height: 90,
    borderRadius: 22,
    overflow: 'hidden',
  },

  /* 🤖 Android — tab bar FIXE (pas absolue) */
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
});
