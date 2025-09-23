import React, { useState } from 'react';
import { View, ScrollView, FlatList, SafeAreaView } from 'react-native';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';

import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import NotificationHeader from '@/components/NotificationHeader';
import NotificationItem from '@/components/NotificationItem';
import SettingsModal from '@/components/SettingsModal';
import EmptyState from '@/components/EmptyState';
import InfoBanner from '@/components/InfoBanner';

const NotificationsScreen = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { settings, togglePushEnabled, toggleCategory } = useNotificationSettings();

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={['top']}>
        <StatusBar style="light" />
        <ScrollView
          className="flex-1 px-4 pt-4 pb-32"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          <NotificationHeader
            onMarkAllAsRead={markAllAsRead}
            onOpenSettings={() => setShowSettings(true)}
          />

          {notifications.length > 0 ? (
            <View className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
              <FlatList
                data={notifications}
                renderItem={({ item }) => (
                  <NotificationItem
                    notification={item}
                    onPress={markAsRead}
                  />
                )}
                keyExtractor={item => item.id}
                scrollEnabled={false}
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