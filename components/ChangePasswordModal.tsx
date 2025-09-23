import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { PRIMARY_COLOR } from '../constants/profile';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  password: string;
  setPassword: (password: string) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  onSubmit: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  password,
  setPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-center items-center p-6">
        <View className="bg-[#0f172a] rounded-3xl p-6 w-full max-w-md shadow-lg border-t-4 border-[#ec673b]">
          <Text className="text-white text-2xl font-bold mb-6 text-center">
            Changer le mot de passe
          </Text>

          <TextInput
            className="bg-white/10 text-white rounded-xl px-5 py-4 mb-4 text-lg border border-white/10"
            placeholder="Mot de passe actuel"
            placeholderTextColor="#ccc"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            className="bg-white/10 text-white rounded-xl px-5 py-4 mb-4 text-lg border border-white/10"
            placeholder="Nouveau mot de passe"
            placeholderTextColor="#ccc"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            className="bg-white/10 text-white rounded-xl px-5 py-4 mb-8 text-lg border border-white/10"
            placeholder="Confirmer le nouveau mot de passe"
            placeholderTextColor="#ccc"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View className="flex-row space-x-4">
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl items-center bg-white/10"
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: PRIMARY_COLOR }}
              onPress={onSubmit}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChangePasswordModal;