import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BackgroundWrapper from '@/components/BackgroundWrapper';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('Mohamed Salem');
  const [email, setEmail] = useState('mohamed@example.mr');
  const [phone, setPhone] = useState('+222 12 34 56 78');

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1 ">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="p-2"
              >
                <Ionicons name="arrow-back" size={26} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-3xl font-extrabold ml-4">Edit Profile</Text>
            </View>

            <View className="items-center mb-10">
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
                }}
                className="w-28 h-28 rounded-full border-4 border-teal-400"
              />
              <TouchableOpacity
                className="bg-[#ec673b] py-3 px-6 rounded-full mt-5 shadow-lg shadow-teal-500/50"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-lg">Changer la photo</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              className="bg-white/10 text-white rounded-xl px-5 py-4 mb-5 text-lg"
              placeholder="Nom"
              placeholderTextColor="#ccc"
              value={name}
              onChangeText={setName}
              selectionColor="#68f2f4"
            />
            <TextInput
              className="bg-white/10 text-white rounded-xl px-5 py-4 mb-5 text-lg"
              placeholder="Email"
              placeholderTextColor="#ccc"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              selectionColor="#68f2f4"
            />
            <TextInput
              className="bg-white/10 text-white rounded-xl px-5 py-4 mb-8 text-lg"
              placeholder="Téléphone"
              placeholderTextColor="#ccc"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              selectionColor="#68f2f4"
            />

            <TouchableOpacity
              className="bg-[#ec673b] py-4 rounded-xl items-center shadow-lg shadow-teal-500/60"
              activeOpacity={0.85}
              onPress={() => alert('Profil mis à jour!')}
            >
              <Text className="text-white font-bold text-lg">Enregistrer</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default EditProfileScreen;
