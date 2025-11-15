// components/NotificationItem.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Animated, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../types';
import { PRIMARY_COLOR } from '../constants/notifications';
import BackgroundWrapper from './BackgroundWrapper';

interface NotificationItemProps {
  notification: Notification;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onPress,
  onDelete 
}) => {
  const { _id, notificationType, title, Message, status, createdAt } = notification;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  let iconName = 'notifications';
  let iconColor = PRIMARY_COLOR;

  switch (notificationType) {
    case 'Payment':
      iconName = 'card';
      iconColor = '#32CD32';
      break;
    case 'Event':
      iconName = 'calendar';
      iconColor = '#FF6347';
      break;
    case 'Promotion':
      iconName = 'pricetag';
      iconColor = '#FFD700';
      break;
    case 'System':
      iconName = 'information-circle';
      iconColor = '#1E90FF';
      break;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer la notification",
      "Êtes-vous sûr de vouloir supprimer cette notification ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => onDelete(_id) }
      ]
    );
  };

  const isUnread = status === 'send';

  // Couper le message à 80 caractères
  const shortMessage = Message.length > 80 ? `${Message.slice(0, 80)}...` : Message;

  return (
    <>
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          className={`p-4 border-b border-white/10 ${isUnread ? 'bg-[#ec673b]/10' : ''}`}
          onPress={() => setModalVisible(true)}
          onLongPress={handleDelete}
        >
          <View className="flex-row">
            <View className="mr-3">
              <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={24} color={iconColor} />
              {isUnread && (
                <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </View>

            <View className="flex-1">
              <Text className={`font-bold text-lg ${isUnread ? 'text-white' : 'text-gray-400'}`}>
                {title}
              </Text>
              <Text className={`mt-1 ${isUnread ? 'text-gray-300' : 'text-gray-500'}`}>
                {shortMessage}
              </Text>

              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-500 text-xs">{formatDate(createdAt)}</Text>
                <View className="flex-row items-center">
                  <Text className={`text-xs mr-2 ${isUnread ? 'text-orange-400' : 'text-green-400'}`}>
                    {isUnread ? 'Non lu' : 'Lu'}
                  </Text>
                  <TouchableOpacity onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal pour afficher le message complet */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <BackgroundWrapper>
            <View 
              style={styles.modalContent}
              onStartShouldSetResponder={() => true} // Empêche la fermeture en touchant le contenu
            >
              <Text style={styles.modalTitle}>{title}</Text>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalMessage}>{Message}</Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </BackgroundWrapper>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#001215', // Couleur adaptée au BackgroundWrapper
    width: '90%',
    maxHeight: '70%',
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  modalScroll: {
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    color: 'white',
  },
  closeButton: {
    backgroundColor: '#006873',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NotificationItem;
