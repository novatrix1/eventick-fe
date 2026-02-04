import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';
import EventCard from './EventCard';

interface LocationSectionProps {
  isLocating: boolean;
  userCity: string;
  nearbyEvents: Event[];
  onRefreshLocation: () => void;
  onEventPress: (eventId: string) => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  isLocating,
  userCity,
  nearbyEvents,
  onRefreshLocation,
  onEventPress
}) => {
  if (isLocating) {
    return (
      <View className="flex-row items-center justify-center py-6 bg-teal-400/10 rounded-xl mb-6">
        <Ionicons name="location" size={24} color="#4ade80" />
        <Text className="text-white ml-4 text-base font-medium">
          {"Recherche d'événements près de vous..."}
        </Text>
      </View>
    );
  }

  if (nearbyEvents.length === 0) {
    return (
      <View className="flex-row items-center justify-center py-6 bg-teal-400/10 rounded-xl mb-6">
        <Text className="text-white text-base font-medium">
          Aucun événement trouvé à {userCity}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={nearbyEvents}
      renderItem={({ item }) => (
        <EventCard event={item} onPress={onEventPress} />
      )}
      keyExtractor={(item) => item._id}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default LocationSection;