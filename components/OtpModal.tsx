import React, { useState, useRef } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface OtpModalProps {
  showOtpModal: boolean;
  setShowOtpModal: (show: boolean) => void;
  formData: {
    email: string;
  };
  verifyOtp: (otp: string) => void;
  loading: boolean;
  resendOtp: () => void;
}

const OtpModal: React.FC<OtpModalProps> = ({
  showOtpModal,
  setShowOtpModal,
  formData,
  verifyOtp,
  loading,
  resendOtp
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (text && index === 5) {
      const finalOtp = newOtp.join('');
      verifyOtp(finalOtp);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const clearOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setShowOtpModal(false);
  };

  const handleVerifyOtp = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      verifyOtp(otpCode);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showOtpModal}
      onRequestClose={clearOtp}
    >
      <View className="flex-1 bg-black/70 justify-center items-center p-4">
        <View className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
          <TouchableOpacity 
            onPress={clearOtp}
            className="absolute top-4 right-4 z-10"
          >
            <Ionicons name="close-circle" size={30} color="#9ca3af" />
          </TouchableOpacity>

          <View className="items-center mb-6">
            <Ionicons name="lock-closed" size={48} color="#ec673b" />
            <Text className="text-white text-xl font-bold mt-4">Vérification par Email</Text>
          </View>

          <Text className="text-gray-400 text-center mb-6">
            Nous avons envoyé un code à 6 chiffres au {formData.email}. Entrez-le ci-dessous.
          </Text>

          <View className="flex-row justify-between mb-6">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
ref={(ref) => { inputRefs.current[index] = ref; }}
                className="bg-white/10 text-white text-xl font-bold text-center rounded-xl w-12 h-12"
                maxLength={1}
                keyboardType="number-pad"
                value={otp[index]}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!loading}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            className={`py-3 rounded-xl items-center mb-4 ${loading ? 'bg-gray-500' : 'bg-[#ec673b]'}`}
            onPress={handleVerifyOtp}
            disabled={loading || otp.join('').length !== 6}
          >
            <Text className="text-white font-bold">
              {loading ? "Vérification..." : "Vérifier"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={resendOtp}
            disabled={loading}
          >
            <Text className={`${loading ? 'text-gray-500' : 'text-[#ec673b]'}`}>
              Renvoyer le code
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default OtpModal;