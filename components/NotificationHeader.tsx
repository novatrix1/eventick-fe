import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '../constants/notifications';

interface NotificationHeaderProps {
  onMarkAllAsRead: () => void;
  onOpenSettings: () => void;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  onMarkAllAsRead,
  onOpenSettings
}) => {
  return (
    <View className="flex-row justify-between items-center mb-6">
      <View>
        <Text className="text-white text-3xl font-bold">Notifications</Text>
        <Text className="text-slate-400">Restez informé de vos activités</Text>
      </View>
      <View className="flex-row">
        <TouchableOpacity
          className="p-2 bg-white/10 rounded-full mr-2"
          onPress={onMarkAllAsRead}
        >
          <MaterialIcons name="mark-email-read" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity
          className="p-2 bg-white/10 rounded-full"
          onPress={onOpenSettings}
        >
          <Ionicons name="settings" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotificationHeader;