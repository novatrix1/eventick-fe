import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

const screens: {
  name: string;
  title: string;
  icon: IoniconsName;
  iconFocused: IoniconsName;
}[] = [
  { name: 'home', title: 'Accueil', icon: 'home-outline', iconFocused: 'home' },
  { name: 'explore', title: 'Explorer', icon: 'compass-outline', iconFocused: 'compass' },
  { name: 'ticket', title: 'Tickets', icon: 'ticket-outline', iconFocused: 'ticket' },
  { name: 'notification', title: 'Notifications', icon: 'notifications-outline', iconFocused: 'notifications' },
  { name: 'profile', title: 'Profil', icon: 'person-outline', iconFocused: 'person' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: '#00f5ff',
        tabBarInactiveTintColor: '#B0BEC5',
        tabBarLabelStyle: styles.label,
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
            tabBarIcon: ({ focused, color, size }) => (
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

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    height: Platform.OS === 'ios' ? 90 : 70,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabItem: {
    paddingTop: 10,
    paddingBottom: 4,
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
    left: '50%',
    transform: [{ translateX: -6 }],
    width: 12,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#00f5ff',
  },
});