import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../types';
import { PRIMARY_COLOR } from '../constants/notifications';

interface NotificationItemProps {
  notification: Notification;
  onPress: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const { id, type, title, message, timestamp, read, amount } = notification;

  let iconName = 'notifications';
  let iconColor = PRIMARY_COLOR;

  switch (type) {
    case 'promotion':
      iconName = 'pricetag';
      iconColor = '#FFD700'; 
      break;
    case 'reminder':
      iconName = 'alarm';
      iconColor = '#FF6347'; 
      break;
    case 'payment':
      iconName = 'checkmark-circle';
      iconColor = '#32CD32'; 
      break;
  }

  return (
    <TouchableOpacity
      className={`p-4 border-b border-white/10 ${!read ? 'bg-[#ec673b]/10' : ''}`}
      onPress={() => onPress(id)}
    >
      <View className="flex-row">
        <View className="mr-3">
          <Ionicons name={iconName} size={24} color={iconColor} />
          {!read && (
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          )}
        </View>

        <View className="flex-1">
          <Text className={`font-bold text-lg ${!read ? 'text-white' : 'text-gray-400'}`}>
            {title}
          </Text>
          <Text className={`mt-1 ${!read ? 'text-gray-300' : 'text-gray-500'}`}>
            {message}
          </Text>

          {type === 'payment' && amount && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="cash" size={14} color={PRIMARY_COLOR} />
              <Text className="text-gray-500 text-xs ml-1">
                Montant: {amount}
              </Text>
            </View>
          )}

          <Text className="text-gray-500 text-xs mt-2">
            {timestamp}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;