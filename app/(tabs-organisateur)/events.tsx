import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, Image, Animated, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EventStatus = 'published' | 'draft' | 'completed';

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  tickets: TicketType[];
  category: string;
  image?: any;
  status: EventStatus;
  totalTickets: number;
  availableTickets: number;
  description: string;
  isActive: boolean;
  totalRevenue?: number;
}

const OrganizerEvents = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'tickets' | 'analytics'>('events');
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState<'date' | 'popularity' | 'revenue'>('date');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Catégories pour les filtres
  const categories = [
    { id: 'all', name: 'Toutes catégories', icon: 'grid' },
    { id: 'Concert', name: 'Concert', icon: 'musical-notes' },
    { id: 'Sport', name: 'Sport', icon: 'football' },
    { id: 'Culture', name: 'Culture', icon: 'brush' },
    { id: 'Business', name: 'Business', icon: 'briefcase' },
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

      const response = await fetch('https://eventick.onrender.com/api/events/organizer/my-events', {
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

      const transformedEvents: Event[] = data.map((event: any) => {
        let status: EventStatus = 'draft';
        const eventDate = new Date(event.date);
        const now = new Date();

        if (event.isActive) {
          status = eventDate > now ? 'published' : 'completed';
        }

        const tickets: TicketType[] = event.ticket.map((ticket: any) => ({
          id: ticket._id,
          name: ticket.type,
          price: 0,
          quantity: ticket.totalTickets,
          sold: ticket.totalTickets - ticket.availableTickets,
        }));

        return {
          id: event._id,
          title: event.title,
          description: event.description,
          date: new Date(event.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          time: new Date(event.time).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          location: event.location,
          category: event.category,
          image: event.image,
          status: status,
          isActive: event.isActive,
          totalTickets: event.totalTickets,
          availableTickets: event.availableTickets,
          tickets: tickets,
          totalRevenue: tickets.reduce((total, ticket) => total + (ticket.price * ticket.sold), 0),
        };
      });

      setEvents(transformedEvents);
      setFilteredEvents(transformedEvents);
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

  const calculateTotalRevenue = (tickets: TicketType[]) => {
    return tickets.reduce((total, ticket) => total + (ticket.price * ticket.sold), 0);
  };

  const applyFilters = () => {
    let result = [...events];

    if (selectedStatus !== 'all') {
      result = result.filter(event => event.status === selectedStatus);
    }

    if (selectedCategory !== 'all') {
      result = result.filter(event => event.category === selectedCategory);
    }

    if (searchQuery) {
      result = result.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (sortOption === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortOption === 'popularity') {
        const aSold = a.tickets.reduce((total, ticket) => total + ticket.sold, 0);
        const bSold = b.tickets.reduce((total, ticket) => total + ticket.sold, 0);
        return bSold - aSold;
      } else {
        const aRevenue = calculateTotalRevenue(a.tickets);
        const bRevenue = calculateTotalRevenue(b.tickets);
        return bRevenue - aRevenue;
      }
    });

    setFilteredEvents(result);
    setIsFilterModalVisible(false);
    setIsSortModalVisible(false);
  };

  const handleDelete = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`https://eventick.onrender.com/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setEvents(events.filter(event => event.id !== id));
        Alert.alert("Succès", "Événement supprimé avec succès");
      } else {
        Alert.alert("Erreur", "Échec de la suppression de l'événement");
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de la suppression");
    }
  };

  const handleCreateEvent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organizer/create-event');
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
  }, [searchQuery, sortOption, events]);

  const renderEventItem = ({ item }: { item: Event }) => {
    const totalRevenue = calculateTotalRevenue(item.tickets);
    const totalSold = item.tickets.reduce((sum, ticket) => sum + ticket.sold, 0);
    const totalTickets = item.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const progress = totalTickets > 0 ? (totalSold / totalTickets) * 100 : 0;

    const imageSource = item.image
      ? { uri: item.image }
      : { uri: 'https://i.postimg.cc/DfMFF7hk/476089770-1317719446099312-2542227566238149344-n.jpg' };

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
              <View className={`px-2 py-1 rounded-full ${item.status === 'published' ? 'bg-green-500/20' :
                  item.status === 'completed' ? 'bg-gray-500/20' : 'bg-yellow-500/20'
                }`}>
                <Text className={`text-xs ${item.status === 'published' ? 'text-green-400' :
                    item.status === 'completed' ? 'text-gray-400' : 'text-yellow-400'
                  }`}>
                  {item.status === 'published' ? 'Publié' :
                    item.status === 'completed' ? 'Terminé' : 'Brouillon'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar" size={14} color="#68f2f4" />
              <Text className="text-teal-400 ml-2 text-xs">{item.date} • {item.time}</Text>
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
                  {totalSold}/{totalTickets} billets
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
              <Text className="text-white font-bold text-sm">{totalRevenue.toLocaleString()} MRO</Text>
              <Text className="text-teal-400 text-xs">Revenus générés</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between mt-4 border-t border-white/10 pt-3">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push(`/EditEvent/${item.id}`)}
          >
            <Ionicons name="create" size={20} color="#68f2f4" />
            <Text className="text-teal-400 ml-1 text-xs">Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push(`/EventStatistics/${item.id}`)}
          >
            <Ionicons name="analytics" size={20} color="#68f2f4" />
            <Text className="text-teal-400 ml-1 text-xs">Statistiques</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => handleDelete(item.id)}
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
          <Text className="text-white text-lg">Chargement des événements...</Text>
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
            onPress={() => router.push("/screens/CreateEvent")}
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
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View className="bg-white/5 rounded-xl p-8 items-center justify-center mt-4">
              <Ionicons name="calendar" size={48} color="#68f2f4" />
              <Text className="text-white text-center mt-4">
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
                  className={`p-3 rounded-xl mr-3 ${selectedStatus === 'published' ? 'bg-teal-400' : 'bg-white/10'
                    }`}
                  onPress={() => setSelectedStatus('published')}
                >
                  <Text className={selectedStatus === 'published' ? 'text-gray-900 font-bold' : 'text-white'}>
                    Publiés
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-3 rounded-xl mr-3 ${selectedStatus === 'draft' ? 'bg-teal-400' : 'bg-white/10'
                    }`}
                  onPress={() => setSelectedStatus('draft')}
                >
                  <Text className={selectedStatus === 'draft' ? 'text-gray-900 font-bold' : 'text-white'}>
                    Brouillons
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-3 rounded-xl mr-3 ${selectedStatus === 'completed' ? 'bg-teal-400' : 'bg-white/10'
                    }`}
                  onPress={() => setSelectedStatus('completed')}
                >
                  <Text className={selectedStatus === 'completed' ? 'text-gray-900 font-bold' : 'text-white'}>
                    Terminés
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
              className={`p-4 rounded-xl mb-3 ${sortOption === 'popularity' ? 'bg-teal-400' : 'bg-white/10'}`}
              onPress={() => setSortOption('popularity')}
            >
              <Text className={`${sortOption === 'popularity' ? 'text-gray-900 font-bold' : 'text-white'}`}>
                Popularité (ventes)
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