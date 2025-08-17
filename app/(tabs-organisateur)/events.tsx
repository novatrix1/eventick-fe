import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, Image, Animated, Platform } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Types
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
  status: EventStatus;
  tickets: TicketType[];
  category: string;
  image?: any;
}

const OrganizerEvents = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Festival des Dattes',
      date: '15 Oct 2023',
      time: '18:00 - 00:00',
      location: 'Nouakchott',
      status: 'published',
      category: 'culture',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      tickets: [
        { id: 't1', name: 'Standard', price: 1500, quantity: 500, sold: 245 },
        { id: 't2', name: 'VIP', price: 3000, quantity: 100, sold: 45 }
      ]
    },
    {
      id: '2',
      title: 'Match de Football',
      date: '20 Oct 2023',
      time: '14:00 - 16:00',
      location: 'Nouadhibou',
      status: 'draft',
      category: 'sport',
      image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80',
      tickets: [
        { id: 't1', name: 'Tribune Nord', price: 2000, quantity: 300, sold: 0 },
        { id: 't2', name: 'Tribune Sud', price: 2000, quantity: 300, sold: 0 },
        { id: 't3', name: 'VIP', price: 5000, quantity: 50, sold: 0 }
      ]
    },
    {
      id: '3',
      title: 'Conférence Tech',
      date: '25 Sept 2023',
      time: '09:00 - 17:00',
      location: 'Atar',
      status: 'completed',
      category: 'business',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
      tickets: [
        { id: 't1', name: 'Early Bird', price: 500, quantity: 100, sold: 100 },
        { id: 't2', name: 'Standard', price: 1000, quantity: 200, sold: 200 }
      ]
    },
    {
      id: '4',
      title: 'Concert National',
      date: '5 Nov 2023',
      time: '20:00 - 23:30',
      location: 'Kaédi',
      status: 'published',
      category: 'concerts',
      image: 'https://cdn.pixabay.com/photo/2020/01/15/17/38/fireworks-4768501_1280.jpg',
      tickets: [
        { id: 't1', name: 'Général', price: 2500, quantity: 1000, sold: 650 },
        { id: 't2', name: 'Gold', price: 5000, quantity: 200, sold: 200 }
      ]
    }
  ]);

  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'tickets' | 'analytics'>('events');
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState<'date' | 'popularity' | 'revenue'>('date');
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Catégories pour les filtres
  const categories = [
    { id: 'all', name: 'Toutes catégories', icon: 'grid' },
    { id: 'culture', name: 'Culture', icon: 'brush' },
    { id: 'sport', name: 'Sport', icon: 'football' },
    { id: 'business', name: 'Business', icon: 'briefcase' },
    { id: 'concerts', name: 'Concerts', icon: 'musical-notes' },
  ];

  const statusOptions = [
    { id: 'all', name: 'Tous statuts', icon: 'list' },
    { id: 'published', name: 'Publié', icon: 'eye' },
    { id: 'draft', name: 'Brouillon', icon: 'document' },
    { id: 'completed', name: 'Terminé', icon: 'checkmark-done' },
  ];

  // Calculer le revenu total pour un événement
  const calculateTotalRevenue = (tickets: TicketType[]) => {
    return tickets.reduce((total, ticket) => total + (ticket.price * ticket.sold), 0);
  };

  // Appliquer les filtres
  const applyFilters = () => {
    let result = [...events];
    
    // Filtre par statut
    if (selectedStatus !== 'all') {
      result = result.filter(event => event.status === selectedStatus);
    }
    
    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      result = result.filter(event => event.category === selectedCategory);
    }
    
    // Filtre par recherche
    if (searchQuery) {
      result = result.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Appliquer le tri
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

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEvents(events.filter(event => event.id !== id));
  };


  const handleCreateEvent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organizer/create-event');
  };

  // Effet pour animer l'apparition
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Effet pour appliquer les filtres lors des changements
  useEffect(() => {
    applyFilters();
  }, [searchQuery, sortOption]);

  // Rendu d'un événement
  const renderEventItem = ({ item }: { item: Event }) => {
    const totalRevenue = calculateTotalRevenue(item.tickets);
    const totalSold = item.tickets.reduce((sum, ticket) => sum + ticket.sold, 0);
    const totalTickets = item.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const progress = (totalSold / totalTickets) * 100;

    return (
      <Animated.View style={{ opacity: fadeAnim }} className="bg-white/5 rounded-xl p-4 mb-4 overflow-hidden">
        {/* En-tête avec image et statut */}
        <View className="flex-row">
          <Image 
            source={{uri : item.image}} 
            className="w-24 h-24 rounded-lg mr-4" 
          />
          
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <Text className="text-white font-bold text-lg flex-1">{item.title}</Text>
              <View className={`rounded-full px-3 py-1 ${
                item.status === 'published' ? 'bg-green-500/20' : 
                item.status === 'draft' ? 'bg-yellow-500/20' : 
                'bg-gray-500/20'
              }`}>
                <Text className={`text-xs ${
                  item.status === 'published' ? 'text-green-400' : 
                  item.status === 'draft' ? 'text-yellow-400' : 
                  'text-gray-400'
                }`}>
                  {item.status === 'published' ? 'Publié' : item.status === 'draft' ? 'Brouillon' : 'Terminé'}
                </Text>
              </View>
            </View>
            
            {/* Date et lieu */}
            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar" size={14} color="#68f2f4" />
              <Text className="text-teal-400 ml-2 text-xs">{item.date} • {item.time}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={14} color="#68f2f4" />
              <Text className="text-teal-400 ml-2 text-xs">{item.location}</Text>
            </View>
            
            {/* Barre de progression */}
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
                  className={`h-2 rounded-full ${
                    progress > 70 ? 'bg-green-500' : 
                    progress > 30 ? 'bg-yellow-500' : 'bg-teal-400'
                  }`} 
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
            
            {/* Revenus */}
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-white font-bold text-sm">{totalRevenue.toLocaleString()} MRO</Text>
              <Text className="text-teal-400 text-xs">Revenus générés</Text>
            </View>
          </View>
        </View>
        
        {/* Actions */}
        <View className="flex-row justify-between mt-4 border-t border-white/10 pt-3">
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => router.push("/EditEvent/[id]")}
          >
            <Ionicons name="create" size={20} color="#68f2f4" />
            <Text className="text-teal-400 ml-1 text-xs">Modifier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => router.push("/EventStatistics/[id]")}
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

  return (
    <BackgroundWrapper>
      <View className="flex-1 px-4 pt-16">
        {/* En-tête avec titre et bouton de création */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-2xl font-bold">Événements</Text>
          <TouchableOpacity 
            className="bg-teal-400 flex-row items-center py-2 px-4 rounded-full"
            onPress={()=>router.push("/screens/CreateEvent")}
          >
            <Ionicons name="add" size={20} color="#001215" />
            <Text className="text-gray-900 font-bold ml-2">Créer</Text>
          </TouchableOpacity>
        </View>
        
        {/* Barre de recherche et filtres */}
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
        
        {/* Onglets de navigation */}
        <View className="flex-row justify-between bg-teal-400/10 rounded-xl p-1 mb-4">
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-xl ${activeTab === 'events' ? 'bg-teal-400' : ''}`}
            onPress={() => setActiveTab('events')}
          >
            <Text className={`text-center text-xs font-medium ${activeTab === 'events' ? 'text-gray-900' : 'text-teal-400'}`}>
              Événements
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-xl ${activeTab === 'tickets' ? 'bg-teal-400' : ''}`}
            onPress={() => setActiveTab('tickets')}
          >
            <Text className={`text-center text-xs font-medium ${activeTab === 'tickets' ? 'text-gray-900' : 'text-teal-400'}`}>
              Billets
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-xl ${activeTab === 'analytics' ? 'bg-teal-400' : ''}`}
            onPress={() => setActiveTab('analytics')}
          >
            <Text className={`text-center text-xs font-medium ${activeTab === 'analytics' ? 'text-gray-900' : 'text-teal-400'}`}>
              Statistiques
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Liste des événements */}
        {activeTab === 'events' ? (
          <FlatList
            data={filteredEvents}
            renderItem={renderEventItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
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
        ) : activeTab === 'tickets' ? (
          <View className="bg-white/5 rounded-xl p-4 mb-4">
            <Text className="text-white font-bold text-lg mb-3">Gestion des billets</Text>
            <Text className="text-teal-400 mb-4">
              Consultez et gérez tous les billets vendus pour vos événements
            </Text>
            <TouchableOpacity 
              className="bg-teal-400 py-3 rounded-full flex-row items-center justify-center"
              onPress={() => router.push('/organizer/tickets')}
            >
              <Ionicons name="ticket" size={20} color="#001215" />
              <Text className="text-gray-900 font-bold ml-2">Voir les billets</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-white/5 rounded-xl p-4 mb-4">
            <Text className="text-white font-bold text-lg mb-3">Statistiques</Text>
            <Text className="text-teal-400 mb-4">
              Analysez les performances de vos événements
            </Text>
            <TouchableOpacity 
              className="bg-teal-400 py-3 rounded-full flex-row items-center justify-center"
              onPress={() => router.push('/organizer/analytics')}
            >
              <Ionicons name="analytics" size={20} color="#001215" />
              <Text className="text-gray-900 font-bold ml-2">Voir les statistiques</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Modal des filtres */}
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
            
            {/* Filtre par statut */}
            <Text className="text-teal-400 font-medium mb-2">Statut</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row">
                {statusOptions.map(status => (
                  <TouchableOpacity
                    key={status.id}
                    className={`p-3 rounded-xl mr-3 ${
                      selectedStatus === status.id ? 'bg-teal-400' : 'bg-white/10'
                    }`}
                    onPress={() => setSelectedStatus(status.id as any)}
                  >
                    <View className="items-center">
                      <Ionicons 
                        name={status.icon as any} 
                        size={24} 
                        color={selectedStatus === status.id ? '#001215' : '#68f2f4'} 
                      />
                      <Text className={`mt-1 text-center ${selectedStatus === status.id ? 'text-gray-900 font-bold' : 'text-white'}`}>
                        {status.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            {/* Filtre par catégorie */}
            <Text className="text-teal-400 font-medium mb-2">Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              <View className="flex-row">
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    className={`p-3 rounded-xl mr-3 ${
                      selectedCategory === category.id ? 'bg-teal-400' : 'bg-white/10'
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
            
            {/* Boutons d'action */}
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

const styles = StyleSheet.create({
  eventCard: {
    shadowColor: '#68f2f4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  filterCard: {
    shadowColor: '#68f2f4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  }
});

export default OrganizerEvents;
