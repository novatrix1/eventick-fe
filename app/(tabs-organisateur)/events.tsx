import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, Image, Animated, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };

interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  totalTickets: number;
  availableTickets: number;
  image: string | null;
  category: string;
  city: string;
  organizer: string;
  isActive: boolean;
  paymentMethods: string[];
  createdAt: string;
  updatedAt: string;
  ticketsSold: number;
  revenue: number;
  tickets: Array<{
    type: string;
    price: number;
    totalTickets: number;
    availableTickets: number;
    sold: number;
    revenue: number;
    description: string;
  }>;
}

const OrganizerEvents = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState<'date' | 'sales' | 'revenue'>('date');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const categories = [
    { id: 'all', name: 'Toutes catégories', icon: 'grid' },
    { id: 'Concert', name: 'Concert', icon: 'musical-notes' },
    { id: 'Sport', name: 'Sport', icon: 'football' },
    { id: 'Culture', name: 'Culture', icon: 'brush' },
    { id: 'Business', name: 'Business', icon: 'briefcase' },
    { id: 'Education', name: 'Education', icon: 'school' },
    { id: 'Autre', name: 'Autre', icon: 'ellipse' },
  ];

  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erreur", "Token d'authentification manquant");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/events/organizer/my-events`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 Events data:", data);
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      Alert.alert("Erreur", "Impossible de charger les événements");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const applyFilters = () => {
    let result = [...events];

    // Filter by status
    if (selectedStatus !== 'all') {
      result = result.filter(event => 
        selectedStatus === 'active' ? event.isActive : !event.isActive
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(event => event.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort events
    result.sort((a, b) => {
      if (sortOption === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortOption === 'sales') {
        return (b.ticketsSold || 0) - (a.ticketsSold || 0);
      } else {
        return (b.revenue || 0) - (a.revenue || 0);
      }
    });

    setFilteredEvents(result);
    setIsFilterModalVisible(false);
    setIsSortModalVisible(false);
  };

  const handleDelete = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      "Supprimer l'événement",
      "Êtes-vous sûr de vouloir supprimer cet événement ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(`${API_URL}/api/events/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                setEvents(events.filter(event => event._id !== id));
                Alert.alert("Succès", "Événement supprimé avec succès");
              } else {
                Alert.alert("Erreur", "Échec de la suppression de l'événement");
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert("Erreur", "Une erreur s'est produite lors de la suppression");
            }
          }
        }
      ]
    );
  };

  const handleCreateEvent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/screens/CreateEvent')
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, sortOption, events, selectedStatus, selectedCategory]);

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (!event.isActive) {
      return { status: 'completed', label: 'Terminé', color: 'bg-gray-500/20', textColor: 'text-gray-400' };
    }
    
    if (eventDate > now) {
      return { status: 'upcoming', label: 'À venir', color: 'bg-green-500/20', textColor: 'text-green-400' };
    }
    
    // If event date is today or in the past but still active, consider it active
    const timeDiff = eventDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    if (hoursDiff <= 24 && hoursDiff >= -24) {
      return { status: 'active', label: 'En cours', color: 'bg-blue-500/20', textColor: 'text-blue-400' };
    }
    
    return eventDate > now ? 
      { status: 'upcoming', label: 'À venir', color: 'bg-green-500/20', textColor: 'text-green-400' } :
      { status: 'completed', label: 'Terminé', color: 'bg-gray-500/20', textColor: 'text-gray-400' };
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    const statusInfo = getEventStatus(item);
    const progress = item.totalTickets > 0 ? ((item.ticketsSold || 0) / item.totalTickets) * 100 : 0;

    const imageSource = item.image
      ? { uri: item.image }
      : { uri: 'https://res.cloudinary.com/daxa8aqwd/image/upload/v1755673452/qiwssa9y370si1agfrzp.jpg' };

    return (
      <Animated.View style={{ opacity: fadeAnim }} className="bg-white/5 rounded-xl p-4 mb-4 overflow-hidden">
        <View className="flex-row">
          <Image
            source={imageSource}
            className="w-24 h-24 rounded-lg mr-4"
          />

          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <Text className="text-white font-bold text-lg flex-1">{item.title}</Text>
              <View className={`px-2 py-1 rounded-full ${statusInfo.color}`}>
                <Text className={`text-xs ${statusInfo.textColor}`}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar" size={14} color="#68f2f4" />
              <Text className="text-teal-400 ml-2 text-xs">
                {new Date(item.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })} • {item.time}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={14} color="#68f2f4" />
              <Text className="text-teal-400 ml-2 text-xs">{item.location}</Text>
            </View>

            <View className="mt-2">
              <View className="flex-row justify-between mb-1">
                <Text className="text-teal-400 text-xs">
                  {Math.round(progress)}% vendus
                </Text>
                <Text className="text-gray-400 text-xs">
                  {item.ticketsSold || 0}/{item.totalTickets} billets
                </Text>
              </View>
              <View className="w-full bg-gray-700 rounded-full h-2">
                <View
                  className={`h-2 rounded-full ${progress > 70 ? 'bg-green-500' :
                      progress > 30 ? 'bg-yellow-500' : 'bg-teal-400'
                    }`}
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>

            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-white font-bold text-sm">{item.revenue?.toLocaleString() || 0} MRO</Text>
              <Text className="text-teal-400 text-xs">Revenus générés</Text>
            </View>

            {item.tickets && item.tickets.length > 0 && (
              <View className="mt-2">
                <Text className="text-teal-400 text-xs mb-1">Types de billets:</Text>
                <View className="flex-row flex-wrap">
                  {item.tickets.map((ticket, ticketIndex) => (
                    <View key={ticketIndex} className="bg-teal-400/20 px-2 py-1 rounded mr-2 mb-1">
                      <Text className="text-teal-400 text-xs">
                        {ticket.type}: {ticket.sold || 0} vendus
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row justify-between mt-4 border-t border-white/10 pt-3">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push(`/EditEvent/${item._id}`)}
          >
            <Ionicons name="create" size={20} color="#68f2f4" />
            <Text className="text-teal-400 ml-1 text-xs">Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push(`/EventStatistics/${item._id}`)}
          >
            <Ionicons name="analytics" size={20} color="#68f2f4" />
            <Text className="text-teal-400 ml-1 text-xs">Statistiques</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash" size={20} color="#ff6b6b" />
            <Text className="text-red-400 ml-1 text-xs">Supprimer</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#68f2f4" />
          <Text className="text-white mt-4 text-lg">Chargement des événements...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <View className="flex-1 px-4 pt-16">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-2xl font-bold">Événements</Text>
          <TouchableOpacity
            className="bg-teal-400 flex-row items-center py-2 px-4 rounded-full"
            onPress={handleCreateEvent}
          >
            <Ionicons name="add" size={20} color="#001215" />
            <Text className="text-gray-900 font-bold ml-2">Créer</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row mb-4">
          <View className="flex-1 bg-white/10 rounded-xl px-4 py-2 mr-3 flex-row items-center">
            <Ionicons name="search" size={20} color="#68f2f4" />
            <TextInput
              placeholder="Rechercher un événement..."
              placeholderTextColor="#68f2f499"
              className="flex-1 text-white ml-3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            className="bg-teal-400/10 p-3 rounded-xl mr-2"
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={24} color="#68f2f4" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-teal-400/10 p-3 rounded-xl"
            onPress={() => setIsSortModalVisible(true)}
          >
            <Ionicons name="swap-vertical" size={24} color="#68f2f4" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View className="bg-white/5 rounded-xl p-8 items-center justify-center mt-4">
              <Ionicons name="calendar" size={48} color="#68f2f4" />
              <Text className="text-white text-center mt-4 text-lg">
                Aucun événement trouvé
              </Text>
              <Text className="text-teal-400 text-center mt-2">
                Créez votre premier événement
              </Text>
              <TouchableOpacity
                className="mt-4 bg-teal-400 py-2 px-6 rounded-full"
                onPress={handleCreateEvent}
              >
                <Text className="text-gray-900 font-bold">Créer un événement</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Modal de filtrage */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">Filtrer les événements</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#68f2f4" />
              </TouchableOpacity>
            </View>

            <Text className="text-teal-400 font-medium mb-2">Statut</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              <View className="flex-row">
                <TouchableOpacity
                  className={`p-3 rounded-xl mr-3 ${selectedStatus === 'all' ? 'bg-teal-400' : 'bg-white/10'
                    }`}
                  onPress={() => setSelectedStatus('all')}
                >
                  <Text className={selectedStatus === 'all' ? 'text-gray-900 font-bold' : 'text-white'}>
                    Tous
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-3 rounded-xl mr-3 ${selectedStatus === 'active' ? 'bg-teal-400' : 'bg-white/10'
                    }`}
                  onPress={() => setSelectedStatus('active')}
                >
                  <Text className={selectedStatus === 'active' ? 'text-gray-900 font-bold' : 'text-white'}>
                    Actifs
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-3 rounded-xl mr-3 ${selectedStatus === 'inactive' ? 'bg-teal-400' : 'bg-white/10'
                    }`}
                  onPress={() => setSelectedStatus('inactive')}
                >
                  <Text className={selectedStatus === 'inactive' ? 'text-gray-900 font-bold' : 'text-white'}>
                    Inactifs
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <Text className="text-teal-400 font-medium mb-2">Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              <View className="flex-row">
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    className={`p-3 rounded-xl mr-3 ${selectedCategory === category.id ? 'bg-teal-400' : 'bg-white/10'
                      }`}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <View className="items-center">
                      <Ionicons
                        name={category.icon as any}
                        size={24}
                        color={selectedCategory === category.id ? '#001215' : '#68f2f4'}
                      />
                      <Text className={`mt-1 text-center ${selectedCategory === category.id ? 'text-gray-900 font-bold' : 'text-white'}`}>
                        {category.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-white/10 py-3 px-6 rounded-full flex-1 mr-3"
                onPress={() => {
                  setSelectedStatus('all');
                  setSelectedCategory('all');
                }}
              >
                <Text className="text-white text-center">Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-teal-400 py-3 px-6 rounded-full flex-1"
                onPress={applyFilters}
              >
                <Text className="text-gray-900 font-bold text-center">Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de tri */}
      <Modal
        visible={isSortModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">Trier par</Text>
              <TouchableOpacity onPress={() => setIsSortModalVisible(false)}>
                <Ionicons name="close" size={24} color="#68f2f4" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`p-4 rounded-xl mb-3 ${sortOption === 'date' ? 'bg-teal-400' : 'bg-white/10'}`}
              onPress={() => setSortOption('date')}
            >
              <Text className={`${sortOption === 'date' ? 'text-gray-900 font-bold' : 'text-white'}`}>
                Date récente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-4 rounded-xl mb-3 ${sortOption === 'sales' ? 'bg-teal-400' : 'bg-white/10'}`}
              onPress={() => setSortOption('sales')}
            >
              <Text className={`${sortOption === 'sales' ? 'text-gray-900 font-bold' : 'text-white'}`}>
                Billets vendus
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-4 rounded-xl ${sortOption === 'revenue' ? 'bg-teal-400' : 'bg-white/10'}`}
              onPress={() => setSortOption('revenue')}
            >
              <Text className={`${sortOption === 'revenue' ? 'text-gray-900 font-bold' : 'text-white'}`}>
                Revenus générés
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-teal-400 py-3 px-6 rounded-full mt-6"
              onPress={() => setIsSortModalVisible(false)}
            >
              <Text className="text-gray-900 font-bold text-center">Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </BackgroundWrapper>
  );
};

export default OrganizerEvents;