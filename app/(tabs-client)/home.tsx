import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import logo from '@/assets/logo.png';

// 🟩 TYPES
type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  category: string;
  promo?: boolean;
  image: string;
};

type Category = {
  id: string;
  name: keyof typeof Ionicons.glyphMap;
  icon: keyof typeof Ionicons.glyphMap;
};

// 🟩 DONNÉES
const eventData: Event[] = [
  {
    id: '1',
    title: 'Festival des Dattes',
    date: '15 Sept 2023',
    location: 'Nouakchott',
    price: '1500 MRO',
    category: 'culture',
    promo: true,
    image: 'https://cdn.pixabay.com/photo/2020/01/15/17/38/fireworks-4768501_1280.jpg'
  },
  {
    id: '2',
    title: 'Match de Football',
    date: '20 Sept 2023',
    location: 'Nouadhibou',
    price: '2000 MRO',
    category: 'sport',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Conférence Tech',
    date: '25 Sept 2023',
    location: 'Atar',
    price: '500 MRO',
    category: 'business',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: 'Concert Traditionnel',
    date: '30 Sept 2023',
    location: 'Kaédi',
    price: '2500 MRO',
    category: 'concerts',
    promo: true,
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
  },

];

const categories: Category[] = [
  { id: 'all', name: 'Tous', icon: 'apps' },
  { id: 'concerts', name: 'Concerts', icon: 'musical-notes' },
  { id: 'sport', name: 'Sport', icon: 'football' },
  { id: 'culture', name: 'Culture', icon: 'color-palette' },
  { id: 'business', name: 'Business', icon: 'briefcase' }
];

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [isLocating, setIsLocating] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setNearbyEvents([eventData[0], eventData[2]]);
      setIsLocating(false);
    }, 1500);
  }, []);

  const filteredEvents = selectedCategory === 'all'
    ? eventData
    : eventData.filter(event => event.category === selectedCategory);

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      className="w-60 mr-5 bg-white/10 rounded-2xl overflow-hidden shadow-lg"
      activeOpacity={0.8}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      {item.promo && (
        <View className="absolute top-3 right-3 bg-red-600 py-1 px-3 rounded-full z-10 shadow">
          <Text className="text-white text-xs font-bold tracking-wide">PROMO</Text>
        </View>
      )}
      <Image
        source={{ uri: item.image }}
        className="w-full h-40 rounded-t-2xl"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-white font-bold text-lg mb-2 truncate">{item.title}</Text>
        <View className="flex-row items-center mb-1">
          <Ionicons name="calendar" size={14} color="#ec673b" />
          <Text className="text-gray-300 text-xs ml-2">{item.date}</Text>
        </View>
        <View className="flex-row items-center mb-4">
          <Ionicons name="location" size={14} color="#ec673b" />
          <Text className="text-gray-300 text-xs ml-2">{item.location}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-white font-semibold text-lg">{item.price}</Text>
          <TouchableOpacity
            className="bg-[#ec673b] rounded-lg py-2 px-4 shadow-md"
            onPress={() => router.push(`/event/${item.id}`)}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-sm">Réserver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      className={`items-center mr-6 py-3 px-5 rounded-2xl ${selectedCategory === item.id ? 'bg-[#ec673b]' : 'bg-teal-400/20'}`}
      onPress={() => setSelectedCategory(item.id)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={item.icon}
        size={26}
        color={selectedCategory === item.id ? '#001215' : '#ec673b'}
      />
      <Text
        className={`mt-2 text-sm font-semibold ${selectedCategory === item.id ? 'text-gray-900' : 'text-white'}`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1">
        <StatusBar style="light" />
        <ScrollView
          className="flex-1 px-5 pt-2 pb-16"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-3">
            <Image
              source={logo}
              className="w-28 h-28 rounded-full"
              resizeMode="contain"
            />
            <View className="flex-row space-x-6">
              <TouchableOpacity activeOpacity={0.7}
                onPress={() => router.push('/notification')}
              >
                <Ionicons name="notifications-circle-outline" size={30} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bannière principale */}
          <View className="rounded-3xl overflow-hidden mb-8 relative shadow-lg">
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
              }}
              className="w-full h-56"
              resizeMode="cover"
            />
            <View className="absolute bottom-0 left-0 right-0 p-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <Text className="text-white text-2xl font-extrabold">Festival du Chameau</Text>
              <Text className="text-teal-400 text-base mt-1">12-15 Octobre 2023 • Nouakchott</Text>
              <TouchableOpacity
                className="bg-[#ec673b] rounded-lg py-3 px-6 mt-4 shadow-lg self-start"
                onPress={() => router.push('/event/1')}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-base">Découvrir</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Catégories */}
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-xl font-extrabold">Catégories</Text>
          </View>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />

          {/* Recommandés */}
          <View className="flex-row justify-between items-center mt-8 mb-5">
            <Text className="text-white text-xl font-extrabold">Pour vous</Text>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text className="text-[#ec673b] text-sm font-semibold">Voir tout</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={filteredEvents}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />

          {/* Près de vous */}
          <View className="flex-row justify-between items-center mt-8 mb-5">
            <Text className="text-white text-xl font-extrabold">Près de vous</Text>
            <TouchableOpacity>
              <Text className="text-teal-400 text-sm font-semibold">Actualiser</Text>
            </TouchableOpacity>
          </View>
          {isLocating ? (
            <View className="flex-row items-center justify-center py-6 bg-teal-400/10 rounded-xl mb-6">
              <Ionicons name="location" size={24} color="#4ade80" />
              <Text className="text-white ml-4 text-base font-medium">
                Recherche d'événements près de vous...
              </Text>
            </View>
          ) : nearbyEvents.length > 0 ? (
            <FlatList
              horizontal
              data={nearbyEvents}
              renderItem={renderEventCard}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View className="flex-row items-center justify-center py-6 bg-teal-400/10 rounded-xl mb-6">
              <Text className="text-white text-base font-medium">Aucun événement trouvé près de vous</Text>
            </View>
          )}

          {/* Promotions */}
          <View className="flex-row justify-between items-center mt-8 mb-5">
            <Text className="text-white text-xl font-extrabold">Offres spéciales</Text>
            <TouchableOpacity onPress={() => router.push('/screens/PromotionsScreen')}>
              <Text className="text-[#ec673b] text-sm font-semibold">Économisez</Text>
            </TouchableOpacity>
          </View>
          <View className="mb-10 space-y-4">
            {eventData
              .filter((event) => event.promo)
              .map((event) => (
                <View
                  key={event.id}
                  className="flex-row bg-teal-400/20 rounded-xl overflow-hidden shadow-md"
                >
                  <Image
                    source={{ uri: event.image }}
                    className="w-28 h-28 rounded-l-xl"
                    resizeMode="cover"
                  />
                  <View className="flex-1 p-4 justify-center">
                    <Text className="text-white font-bold text-lg">{event.title}</Text>
                    <View className="flex-row items-center mt-2">
                      <Text className="text-gray-400 text-sm line-through mr-3">2000 MRO</Text>
                      <Text className="text-[#ec673b] font-bold text-lg">{event.price}</Text>
                    </View>
                    <Text className="text-gray-400 text-xs mt-1">{event.date}</Text>
                  </View>
                </View>
              ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default HomeScreen;
