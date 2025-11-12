import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserInfo, OrganizerStatus } from '../types';

interface UserInfoSectionProps {
  userInfo: UserInfo;
  organizerStatus: OrganizerStatus;
}

const UserInfoSection: React.FC<UserInfoSectionProps> = ({ userInfo, organizerStatus }) => {
  const hasProfilePicture = userInfo.profilePicture && userInfo.profilePicture.trim() !== '';

  return (
    <View className="items-center mb-10">
      {hasProfilePicture ? (
        <Image
          source={{ uri: userInfo.profilePicture }}
          className="w-28 h-28 rounded-full border-4 border-[#ec673b]"
        />
      ) : (
        <View className="w-28 h-28 rounded-full border-4 border-[#ec673b] bg-[#ec673b]/20 justify-center items-center">
          <Ionicons name="person" size={52} color="#ec673b" />
        </View>
      )}

      {organizerStatus.isOrganizer && !organizerStatus.isVerified && (
        <View className="mt-4 bg-orange-500/20 px-4 py-2 rounded-full flex-row items-center">
          <Ionicons name="time" size={16} color="#f97316" className="mr-2" />
          <Text className="text-orange-400 font-medium w-60 text-center">
            Compte organisateur en attente de vérification
          </Text>
        </View>
      )}

      <Text className="text-white text-2xl font-extrabold mt-5">
        {userInfo.name}
      </Text>
      <Text className="text-gray-400 mt-1">{userInfo.email}</Text>
      <Text className="text-gray-400">{userInfo.phone}</Text>
    </View>
  );
};

export default UserInfoSection;
