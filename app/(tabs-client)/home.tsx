import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, SafeAreaView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import logo from "../../assets/logo.png";

import { Event, Category } from '@/types';
import { useEvents } from '@/hooks/useEvents';
import { useLocation } from '@/hooks/useLocation';
import LoadingIndicator from '@/components/LoadingIndicator';
import EventCard from '@/components/EventCard';
import CategoryItem from '@/components/CategoryItem';
import MainBanner from '@/components/MainBanner';
import LocationSection from '@/components/LocationSection';

const categories: Category[] = [
  { id: 'all', name: 'Tous', icon: 'apps' },
  { id: 'Concert', name: 'Concerts', icon: 'musical-notes' },
  { id: 'Sport', name: 'Sport', icon: 'football' },
  { id: 'Culture', name: 'Culture', icon: 'color-palette' },
  { id: 'Business', name: 'Business', icon: 'briefcase' },
  { id: 'Festival', name: 'Festivals', icon: 'wine' },
  { id: 'Conférence', name: 'Conférences', icon: 'mic' },
];

const HomeScreen = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [popularEvents, setPopularEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  const { events, isLoading, refreshing, onRefresh } = useEvents();
  const { isLocating, userCity, nearbyEvents, getUserLocation } = useLocation(events);

  const getCategoryEvents = () => {
    if (selectedCategory === 'all') return events;
    return events.filter(event => event.category === selectedCategory);
  };

  useEffect(() => {
    if (events.length > 0) {
      setPopularEvents(events.slice(0, 3));
    }
  }, [events]);

  useEffect(() => {
    const categoryEvents = getCategoryEvents();
    setFilteredEvents(categoryEvents);
  }, [selectedCategory, events]);

  const handleEventPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <LoadingIndicator message="Chargement des événements..." />
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1">
        <StatusBar style="light" />
        <ScrollView
          className="flex-1 px-5 pt-2 pb-16"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ec673b']}
              tintColor={'#ec673b'}
            />
          }
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
                <Ionicons name="notifications-outline" size={30} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bannière principale */}
          {events.length > 0 && (
            <MainBanner 
              event={events[0]} 
              onPress={handleEventPress} 
            />
          )}

          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-xl font-extrabold">Catégories</Text>
          </View>
          <FlatList
            horizontal
            data={categories}
            renderItem={({ item }) => (
              <CategoryItem
                category={item}
                isSelected={selectedCategory === item.id}
                onPress={setSelectedCategory}
              />
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />

          <View className="flex-row justify-between items-center mt-8 mb-5">
            <Text className="text-white text-xl font-extrabold">Pour vous</Text>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text className="text-[#ec673b] text-sm font-semibold">Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {filteredEvents.length > 0 ? (
            <FlatList
              horizontal
              data={filteredEvents}
              renderItem={({ item }) => (
                <EventCard event={item} onPress={handleEventPress} />
              )}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View className="py-10 items-center justify-center">
              <Ionicons name="calendar-outline" size={50} color="#68f2f4" />
              <Text className="text-white mt-4 text-center">
                Aucun événement dans cette catégorie
              </Text>
            </View>
          )}

          <View className="flex-row justify-between items-center mt-8 mb-5">
            <Text className="text-white text-xl font-extrabold">À {userCity}</Text>
            <TouchableOpacity onPress={getUserLocation}>
              <Text className="text-teal-400 text-sm font-semibold">Actualiser</Text>
            </TouchableOpacity>
          </View>
          
          <LocationSection
            isLocating={isLocating}
            userCity={userCity}
            nearbyEvents={nearbyEvents}
            onRefreshLocation={getUserLocation}
            onEventPress={handleEventPress}
          />

          <View className="flex-row justify-between items-center mt-8 mb-5">
            <Text className="text-white text-xl font-extrabold">Populaires</Text>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text className="text-[#ec673b] text-sm font-semibold">Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {popularEvents.length > 0 ? (
            <FlatList
              data={popularEvents}
              renderItem={({ item }) => (
                <EventCard 
                  event={item} 
                  onPress={handleEventPress} 
                  variant="horizontal" 
                />
              )}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          ) : (
            <View className="py-6 bg-teal-400/10 rounded-xl items-center justify-center">
              <Ionicons name="flame-outline" size={40} color="#68f2f4" />
              <Text className="text-white mt-2 text-center">
                Aucun événement populaire pour le moment
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default HomeScreen;