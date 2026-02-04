import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-center items-center p-6">
        <View className="bg-[#0f172a] rounded-3xl p-6 w-full max-w-md items-center shadow-lg border-t-4 border-[#ec673b]">
          <MaterialIcons name="delete" size={56} color="#FF6347" />
          <Text className="text-white text-2xl font-bold mt-6 mb-5 text-center">
            Supprimer votre compte
          </Text>
          <Text className="text-gray-400 text-center mb-8 px-4">
            Êtes-vous sûr de vouloir supprimer définitivement votre compte ?
            Toutes vos données seront perdues.
          </Text>
          <View className="flex-row justify-between w-full px-4">
            <TouchableOpacity
              className="bg-white/10 py-4 px-8 rounded-xl flex-1 mr-3 items-center"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text className="text-white text-lg font-semibold">Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-4 px-8 rounded-xl flex-1 ml-3 items-center"
              style={{ backgroundColor: '#FF6347' }}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text className="text-white text-lg font-bold">Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteAccountModal;