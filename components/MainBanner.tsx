import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';
import { formatDate } from '../utils/dateFormatter';

interface MainBannerProps {
  event: Event;
  onPress: (eventId: string) => void;
}

const MainBanner: React.FC<MainBannerProps> = ({ event, onPress }) => {
  return (
    <TouchableOpacity 
      className="rounded-3xl overflow-hidden mb-8 relative shadow-lg"
      onPress={() => onPress(event._id)}
      activeOpacity={0.9}
    >
      <View className="w-full h-56 bg-teal-400/20 items-center justify-center">
        {event.image ? (
          <Image
            source={{ uri: event.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="image-outline" size={50} color="#68f2f4" />
        )}
      </View>
      
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/60">
        <Text className="text-white text-2xl font-extrabold" numberOfLines={1}>
          {event.title}
        </Text>
        <Text className="text-teal-400 text-base mt-1" numberOfLines={1}>
          {formatDate(event.date)} • {event.city}
        </Text>
        <TouchableOpacity
          className="bg-[#ec673b] rounded-lg py-3 px-6 mt-4 shadow-lg self-start"
          onPress={() => onPress(event._id)}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">Découvrir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default MainBanner;