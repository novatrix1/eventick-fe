import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Event } from '../types';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  onEventPress: (eventId: string) => void;
  onResetFilters: () => void;
  primaryColor: string;
}

const EventList: React.FC<EventListProps> = ({
  events,
  onEventPress,
  onResetFilters,
  primaryColor
}) => {
  if (events.length === 0) {
    return (
      <View className="bg-white/10 rounded-xl p-8 items-center">
        <MaterialIcons name="search-off" size={48} color={primaryColor} />
        <Text className="text-white font-bold mt-5 text-lg">Aucun événement trouvé</Text>
        <Text className="text-gray-400 text-center mt-3 text-base">
          Essayez de modifier vos filtres ou votre recherche
        </Text>
        <TouchableOpacity
          className="py-3 px-8 mt-5 rounded-xl"
          style={{ backgroundColor: primaryColor }}
          onPress={onResetFilters}
          accessibilityRole="button"
        >
          <Text className="text-gray-900 font-bold text-base">Réinitialiser les filtres</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={events.slice(0, 8)} 
      renderItem={({ item }) => (
        <EventCard
          event={item}
          onPress={onEventPress}
          primaryColor={primaryColor}
          variant="horizontal" 
        />
      )}
      keyExtractor={item => item._id}
      horizontal={true} 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
    />
  );
};

export default EventList;