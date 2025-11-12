// app/notification.tsx
import React, { useState, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  FlatList, 
  RefreshControl, 
  Text, 
  ActivityIndicator 
} from 'react-native';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';

import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import NotificationHeader from '@/components/NotificationHeader';
import NotificationItem from '@/components/NotificationItem';
import SettingsModal from '@/components/SettingsModal';
import EmptyState from '@/components/EmptyState';
import InfoBanner from '@/components/InfoBanner';
import { SafeAreaView } from "react-native-safe-area-context";

const NotificationsScreen = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  const { 
    notifications, 
    loading, 
    refreshing,
    error, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead,
    refreshNotifications 
  } = useNotifications();
  
  const { settings, togglePushEnabled, toggleCategory } = useNotificationSettings();

  const onRefresh = useCallback(async () => {
    await refreshNotifications();
  }, [refreshNotifications]);

  // Afficher le loading initial seulement si pas de données
  if (loading && notifications.length === 0) {
    return (
      <BackgroundWrapper>
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ec673b" />
          <Text className="text-white mt-4">Chargement des notifications...</Text>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={['top']}>
        <StatusBar style="light" />
        <ScrollView
          className="flex-1 px-4 pt-4 pb-32"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: 80,
            flexGrow: 1 
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ec673b"
              colors={['#ec673b']}
            />
          }
        >
          <NotificationHeader
            onMarkAllAsRead={markAllAsRead}
            onOpenSettings={() => setShowSettings(true)}
            hasUnread={notifications.some(notif => notif.status === 'send')}
          />

          {error && notifications.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-red-400 text-center mb-4">{error}</Text>
              <Text className="text-gray-400 text-center">
                Les données en cache sont affichées
              </Text>
            </View>
          ) : null}

          {notifications.length > 0 ? (
            <View className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
              <FlatList
                data={notifications}
                renderItem={({ item }) => (
                  <NotificationItem
                    notification={item}
                    onPress={markAsRead}
                    onDelete={deleteNotification}
                  />
                )}
                keyExtractor={item => item._id}
                scrollEnabled={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
              />
            </View>
          ) : (
            <EmptyState
              title="Aucune notification"
              message="Vous n'avez pas de nouvelles notifications pour le moment"
            />
          )}

          <InfoBanner />
        </ScrollView>

        <SettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onTogglePushEnabled={togglePushEnabled}
          onToggleCategory={toggleCategory}
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default NotificationsScreen;