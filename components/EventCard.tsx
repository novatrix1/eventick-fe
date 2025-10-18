import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';
//import { getMinPrice } from '../utils/priceFormatter';

interface EventCardProps {
  event: Event;
  onPress: (eventId: string) => void;
  primaryColor?: string;
  variant?: 'vertical' | 'horizontal' | 'category';
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  primaryColor = '#ec673b',
  variant = 'vertical'
}) => {
  
  //const minPrice = getMinPrice(event.ticket);
  console.log("Le getMinPrice est  : ", event.ticket)
  const eventId = (event as any)._id ?? (event as any).id; // compatibilité API

  if (variant === 'horizontal') {
    return (
      <View className="flex-row bg-white/10 rounded-xl overflow-hidden shadow-md mb-4"
        style={{ borderLeftWidth: 3, borderLeftColor: primaryColor }}>
        <View className="w-28 h-28 bg-teal-400/20 items-center justify-center">
          {event.image ? (
            <Image
              source={{ uri: event.image }}
              className="w-full h-full"
              resizeMode="cover"
              accessibilityLabel={`Image de l'événement ${event.title}`}
            />
          ) : (
            <Ionicons name="image-outline" size={30} color={primaryColor} />
          )}
        </View>
        
        <View className="flex-1 p-3 justify-center">
          <Text className="text-white font-bold text-sm" numberOfLines={1}>
            {event.title}
          </Text>
          
          <Text className="text-gray-400 text-xs mt-1">
            {event.date} • {event.city}
          </Text>

          <View className="flex-row items-center mt-1">
            <Text className="font-bold text-sm" style={{ color: primaryColor }}>
              {event.price}
              
            </Text>
          </View>
          
          <TouchableOpacity
            className="py-1 px-3 rounded-full mt-2 self-start"
            style={{ backgroundColor: primaryColor }}
            onPress={() => onPress(eventId)}
          >
            <Text className="text-white text-xs font-bold">Détails</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (variant === 'category') {
    return (
      <TouchableOpacity 
        className="w-48 mr-4 bg-white/10 rounded-xl overflow-hidden"
        activeOpacity={0.8}
        style={{ borderLeftWidth: 3, borderLeftColor: primaryColor }}
        onPress={() => onPress(eventId)}
      >
        {event.image && (
          <Image
            source={{ uri: event.image }}
            className="w-full h-32"
            resizeMode="cover"
          />
        )}
        <View className="p-3">
          <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>
            {event.title}
          </Text>
          <Text className="text-gray-400 text-xs">{event.date}</Text>
          <Text className="text-teal-400 text-xs font-bold mt-1">{event.price}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Vertical (par défaut)
  return (
    <TouchableOpacity
      className="w-60 mr-5 bg-white/10 rounded-2xl overflow-hidden shadow-lg"
      activeOpacity={0.8}
      style={{ borderLeftWidth: 4, borderLeftColor: primaryColor }}
      onPress={() => onPress(eventId)}
    >
      <View className="w-full h-40 bg-teal-400/20 items-center justify-center">
        {event.image ? (
          <Image
            source={{ uri: event.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="image-outline" size={50} color={primaryColor} />
        )}
      </View>
      
      <View className="p-4">
        <Text className="text-white font-bold text-lg mb-2" numberOfLines={1}>
          {event.title}
        </Text>
        
        <View className="flex-row items-center mb-1">
          <Ionicons name="calendar" size={14} color={primaryColor} />
          <Text className="text-gray-300 text-xs ml-2">
            {event.date}
          </Text>
        </View>
        
        <View className="flex-row items-center mb-4">
          <Ionicons name="location" size={14} color={primaryColor} />
          <Text className="text-gray-300 text-xs ml-2" numberOfLines={1}>
            {event.location}, {event.city}
          </Text>
        </View>
        
        <View className="flex-row justify-between items-center">
          {/* Badge type (en ligne / en personne) */}
          {event.type && (
            <View
              className={`px-3 py-1 rounded-xl ${
                event.type === 'online' ? 'bg-blue-500/20' : 'bg-green-500/20'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  event.type === 'online' ? 'text-blue-400' : 'text-green-400'
                }`}
              >
                {event.type === 'online' ? 'En ligne' : 'En personne'}
              </Text>
            </View>
          )}

          <Text className="text-white font-semibold text-lg">{event.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;
