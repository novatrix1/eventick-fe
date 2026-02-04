import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Switch } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NotificationSettings } from '../types';
import { PRIMARY_COLOR, NOTIFICATION_CATEGORIES, NOTIFICATION_TYPES } from '../constants/notifications';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onTogglePushEnabled: () => void;
  onToggleCategory: (category: keyof NotificationSettings['categories']) => void;
}


const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onTogglePushEnabled,
  onToggleCategory
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-[#0f172a] rounded-t-3xl p-6 max-h-[85%] border-t-4 border-[#ec673b]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-xl font-bold">Paramètres des notifications</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="pb-4">
            <View className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white font-bold text-lg">Notifications Push</Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    Recevez des notifications sur votre téléphone
                  </Text>
                </View>
                <Switch
                  value={settings.pushEnabled}
                  onValueChange={onTogglePushEnabled}
                  trackColor={{ false: '#767577', true: PRIMARY_COLOR }}
                  thumbColor={settings.pushEnabled ? '#001215' : '#f4f3f4'}
                />
              </View>

              {settings.pushEnabled && (
                <View className="mt-4">
                  <Text className="text-white font-bold mb-3 text-lg">Catégories à suivre</Text>
                  <View>
                    {NOTIFICATION_CATEGORIES.map(category => (
                      <View
                        key={category.id}
                        className="flex-row justify-between items-center py-3 border-b border-white/10"
                      >
                        <View className="flex-row items-center">
                          <Ionicons
                            name={category.icon as any}
                            size={20}
                            color={PRIMARY_COLOR}
                            className="mr-3"
                          />
                          <Text className="text-white">{category.name}</Text>
                        </View>
                        <Switch
                          value={settings.categories[category.id as keyof NotificationSettings['categories']]}
onValueChange={() => onToggleCategory(category.id as keyof NotificationSettings['categories'])}
                          trackColor={{ false: '#767577', true: PRIMARY_COLOR }}
                          thumbColor={settings.categories[category.id as keyof NotificationSettings['categories']] ? '#001215' : '#f4f3f4'}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Text className="text-white font-bold mb-3 text-lg">Types de notifications</Text>

              {NOTIFICATION_TYPES.map(type => (
                <View key={type.id} className="flex-row items-center py-3 border-b border-white/10">
                  <MaterialIcons 
                    name={type.icon as any} 
                    size={24} 
                    color={type.color} 
                    className="mr-3" 
                  />
                  <Text className="text-white flex-1">{type.name}</Text>
                  <Ionicons name="checkmark" size={24} color={PRIMARY_COLOR} />
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            className="py-3 px-6 rounded-xl mt-6 items-center"
            style={{ backgroundColor: PRIMARY_COLOR }}
            onPress={onClose}
          >
            <Text className="text-white font-bold text-lg">Enregistrer les paramètres</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SettingsModal;