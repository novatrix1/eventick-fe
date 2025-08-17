import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FavoriteEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
};

const favoriteEvents: FavoriteEvent[] = [
  {
    id: '1',
    title: 'Festival du Chameau',
    date: '15 Oct 2023',
    location: 'Nouakchott',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'Concert Traditionnel',
    date: '20 Oct 2023',
    location: 'Kaédi',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Conférence Tech',
    date: '25 Oct 2023',
    location: 'Atar',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80'
  }
];

const FavoriteEventsScreen = () => {
  const renderFavoriteEvent = ({ item }: { item: FavoriteEvent }) => (
    <TouchableOpacity className="w-full mb-4 bg-white/5 rounded-xl overflow-hidden flex-row">
      <Image
        source={{ uri: item.image }}
        className="w-24 h-24"
        resizeMode="cover"
      />
      <View className="p-4 flex-1">
        <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{item.title}</Text>
        <Text className="text-gray-400 text-sm mb-2">{item.date} • {item.location}</Text>
        <View className="flex-row justify-between items-center mt-2">
          <TouchableOpacity className="bg-teal-400/10 py-1 px-3 rounded-full">
            <Text className="text-teal-400 text-xs">Voir détails</Text>
          </TouchableOpacity>
          <Ionicons name="heart" size={20} color="#FF6347" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-bold">Événements favoris</Text>
        <TouchableOpacity>
          <Text className="text-teal-400 text-sm">Trier</Text>
        </TouchableOpacity>
      </View>

      {favoriteEvents.length > 0 ? (
        <FlatList
          data={favoriteEvents}
          renderItem={renderFavoriteEvent}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="bg-white/10 rounded-2xl p-6 items-center justify-center flex-1">
          <Ionicons name="heart" size={40} color="#68f2f4" />
          <Text className="text-white font-bold mt-4">Aucun événement favori</Text>
          <Text className="text-gray-400 text-center mt-2">
            Ajoutez des événements à vos favoris pour les retrouver facilement ici
          </Text>
          <TouchableOpacity className="mt-4 bg-teal-400 py-2 px-6 rounded-full">
            <Text className="text-gray-900 font-bold">Parcourir les événements</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default FavoriteEventsScreen;