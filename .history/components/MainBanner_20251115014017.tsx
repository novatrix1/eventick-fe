import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';

interface MainBannerProps {
  event: Event;
  onPress: (eventId: string) => void;
}

const MainBanner: React.FC<MainBannerProps> = ({ event, onPress }) => {
  return (
    <TouchableOpacity 
      className="rounded-2xl overflow-hidden mb-4 bg-teal-400/20 shadow-lg "
      onPress={() => onPress(event._id)}
      activeOpacity={0.9}
    >
      <View className="flex-row h-32">
        <View className="w-32 h-full bg-gray-100">
          {event.image ? (
            <Image
              source={{ uri: event.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-teal-50">
              <Ionicons name="ticket-outline" size={24} color="#14b8a6" />
            </View>
          )}
        </View>

        <View className="flex-1 p-3 justify-between">
          <View>
            <View className="flex-row justify-between items-start mb-1">
              <Text className="text-sm font-bold text-white flex-1 mr-2" numberOfLines={2}>
                {event.title}
              </Text>
              {event.category && (
                <View className="bg-teal-500 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-medium">
                    {event.category}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar-outline" size={12} color="#ec673b" />
              <Text className="text-white text-xs ml-1">
                {event.date}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={12} color="#ec673b" />
              <Text className="text-white text-xs ml-1">
                {event.city}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            {event.price ? (
              <Text className="text-white font-bold text-sm">
                {event.price} MRU
              </Text>
            ) : (
              <Text className="text-gray-500 text-xs">Gratuit</Text>
            )}
            
            <TouchableOpacity
              className="bg-[#ec673b] rounded-lg px-3 py-2"
              onPress={() => onPress(event._id)}
              activeOpacity={0.8}
            >
              <Text className="text-white font-medium text-xs">Voir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


    </TouchableOpacity>
  );
};

export default MainBanner;