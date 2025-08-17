import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, FlatList, Modal, Image, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';

type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  city: string;
  price: string;
  category: string;
  type: 'online' | 'in-person';
  image: string;
};

type Filter = {
  location: string;
  date: string;
  price: string;
  category: string;
  eventType: string;
};

const eventsData: Event[] = [
  { 
    id: '1', 
    title: 'Festival des Dattes', 
    date: '15 Sept 2023', 
    location: 'Stade Olympique', 
    city: 'Nouakchott',
    price: '1500 MRO', 
    category: 'culture', 
    type: 'in-person',
    image: 'https://images.unsplash.com/photo-1593179241550-4b1c1dc0a608?auto=format&fit=crop&w=800&q=80',

  },
  { 
    id: '2', 
    title: 'Match de Football', 
    date: '20 Sept 2023', 
    location: 'Stade de Nouadhibou', 
    city: 'Nouadhibou',
    price: '2000 MRO', 
    category: 'sport',
    type: 'in-person',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',

  },
  { 
    id: '3', 
    title: 'Conférence Tech', 
    date: '25 Sept 2023', 
    location: 'Centre des Congrès', 
    city: 'Atar',
    price: '500 MRO', 
    category: 'business',
    type: 'in-person',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80',
    latitude: 20.5178,
    longitude: -13.0493
  },
  { 
    id: '4', 
    title: 'Concert Traditionnel', 
    date: '30 Sept 2023', 
    location: 'Place du Marché', 
    city: 'Kaédi',
    price: '2500 MRO', 
    category: 'concerts', 
    type: 'in-person',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  },
  { 
    id: '6', 
    title: 'Atelier Cuisine Traditionnelle', 
    date: '10 Oct 2023', 
    location: 'En ligne', 
    city: 'Online',
    price: '800 MRO', 
    category: 'culture',
    type: 'online',
    image: 'https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: '7', 
    title: 'Tournoi de Lutte Traditionnelle', 
    date: '15 Oct 2023', 
    location: 'Arena Sportive', 
    city: 'Rosso',
    price: '1200 MRO', 
    category: 'sport',
    type: 'in-person',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',

  },
  { 
    id: '8', 
    title: 'Forum des Entrepreneurs', 
    date: '20 Oct 2023', 
    location: 'Hôtel Salam', 
    city: 'Nouakchott',
    price: 'Gratuit', 
    category: 'business',
    type: 'in-person',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
  },
];



const cities = [ 'Tout', 'Nouakchott', 'Nouadhibou', 'Atar', 'Kaédi', 'Kiffa', 'Rosso', 'Aleg', 'Zouerate' ];
const categories = [
  { id: 'all', name: 'Toutes', icon: 'apps' },
  { id: 'concerts', name: 'Concerts', icon: 'musical-notes' },
  { id: 'sport', name: 'Sport', icon: 'football' },
  { id: 'culture', name: 'Culture', icon: 'color-palette' },
  { id: 'business', name: 'Business', icon: 'briefcase' },
];
const dateFilters = [
  { id: 'any', name: 'Toutes dates' },
  { id: 'today', name: "Aujourd'hui" },
  { id: 'weekend', name: 'Ce week-end' },
  { id: 'next-week', name: 'La semaine prochaine' },
  { id: 'next-month', name: 'Le mois prochain' },
];

const priceFilters = [
  { id: 'any', name: 'Tous prix' },
  { id: 'free', name: 'Gratuit' },
  { id: '0-1000', name: 'Moins de 1000 MRO' },
  { id: '1000-2000', name: '1000 - 2000 MRO' },
  { id: '2000+', name: 'Plus de 2000 MRO' },
];

const eventTypes = [
  { id: 'any', name: 'Tous types' },
  { id: 'online', name: 'En ligne' },
  { id: 'in-person', name: 'En personne' },
];

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filter>({
    location: 'Tout',
    date: 'any',
    price: 'any',
    category: 'all',
    eventType: 'any'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(eventsData);
  const [categoryEvents, setCategoryEvents] = useState<Record<string, Event[]>>({});

  // Couleur principale
  const primaryColor = '#ec673b';

  // Filtrer les événements selon les critères
  const applyFilters = () => {
    let results = [...eventsData];
    const query = searchQuery.toLowerCase();

    if (searchQuery) {
      results = results.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.city.toLowerCase().includes(query)
      );
    }

    if (filters.location !== 'Tout') {
      results = results.filter(event => event.city === filters.location);
    }

    if (filters.category !== 'all') {
      results = results.filter(event => event.category === filters.category);
    }

    if (filters.eventType !== 'any') {
      results = results.filter(event => event.type === filters.eventType);
    }

    if (filters.price !== 'any') {
      switch (filters.price) {
        case 'free':
          results = results.filter(event => event.price === 'Gratuit');
          break;
        case '0-1000':
          results = results.filter(event => {
            const price = parseInt(event.price);
            return price > 0 && price <= 1000;
          });
          break;
        case '1000-2000':
          results = results.filter(event => {
            const price = parseInt(event.price);
            return price > 1000 && price <= 2000;
          });
          break;
        case '2000+':
          results = results.filter(event => {
            const price = parseInt(event.price);
            return price > 2000;
          });
          break;
      }
    }
    setFilteredEvents(results);
  };

  useEffect(() => {
    // Group events by category for the horizontal lists
    const eventsByCategory: Record<string, Event[]> = {};
    categories.forEach(category => {
      if (category.id !== 'all') {
        eventsByCategory[category.id] = eventsData.filter(e => e.category === category.id).slice(0, 3);
      }
    });
    setCategoryEvents(eventsByCategory);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery]);


  const handleFilterChange = (filterType: keyof Filter, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const resetFilters = () => {
    setFilters({
      location: 'Tout',
      date: 'any',
      price: 'any',
      category: 'all',
      eventType: 'any'
    });
    setSearchQuery('');
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      className="bg-white/10 rounded-2xl mb-5 p-4 flex-row" 
      activeOpacity={0.8}
      style={{ borderLeftWidth: 4, borderLeftColor: primaryColor }}
    >
      <Image
        source={{ uri: item.image }}
        className="w-28 h-28 rounded-xl"
        resizeMode="cover"
        accessibilityLabel={`Image de l'événement ${item.title}`}
      />
      <View className="flex-1 p-3">
        <Text className="text-white font-bold text-lg mb-2" numberOfLines={1}>{item.title}</Text>
        <View className="flex-row items-center mb-2">
          <Ionicons name="location" size={16} color={primaryColor} />
          <Text className="text-gray-400 text-sm ml-2">{item.location}, {item.city}</Text>
        </View>
        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar" size={16} color={primaryColor} />
          <Text className="text-gray-400 text-sm ml-2">{item.date}</Text>
        </View>
        <View className="flex-row justify-between items-center mt-3">
          <View className={`px-3 py-1 rounded-xl ${item.type === 'online' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}>
            <Text className={`text-sm font-medium ${item.type === 'online' ? 'text-blue-400' : 'text-green-400'}`}>
              {item.type === 'online' ? 'En ligne' : 'En personne'}
            </Text>
          </View>
          <Text className="text-white font-bold text-lg">{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      className="w-48 mr-4 bg-white/10 rounded-xl overflow-hidden" 
      activeOpacity={0.8}
      style={{ borderLeftWidth: 3, borderLeftColor: primaryColor }}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-32"
        resizeMode="cover"
        accessibilityLabel={`Image de l'événement ${item.title}`}
      />
      <View className="p-3">
        <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>{item.title}</Text>
        <Text className="text-gray-400 text-xs">{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategorySections = () => {
    return Object.entries(categoryEvents).map(([categoryId, events]) => {
      const category = categories.find(c => c.id === categoryId);
      if (!category || events.length === 0) return null;

      return (
        <View key={categoryId} className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Ionicons 
                name={category.icon as any} 
                size={24} 
                color={primaryColor} 
                className="mr-2"
              />
              <Text className="text-white text-xl font-bold">
                À venir en {category.name}
              </Text>
            </View>
            <TouchableOpacity accessibilityRole="button" activeOpacity={0.7}>
              <Text style={{ color: primaryColor }} className="text-sm">Voir tout</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={events}
            renderItem={renderCategoryEvent}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      );
    });
  };

  const renderFilterOptions = (filterType: keyof Filter, options: any[]) => {
    return (
      <View className="mb-6">
        <Text className="text-white font-bold text-lg mb-4 capitalize">
          {filterType === 'location' ? 'Lieu' : filterType}
        </Text>
        <View className="flex-row flex-wrap">
          {options.map((option: any) => {
            const id = option.id || option;
            const name = option.name || option;
            const isSelected = filters[filterType] === id;

            return (
              <TouchableOpacity
                key={id}
                className={`px-4 py-3 rounded-xl mr-3 mb-3 ${isSelected ? 'bg-[#ec673b]' : 'bg-white/10'}`}
                onPress={() => handleFilterChange(filterType, id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text className={isSelected ? 'text-gray-900 font-bold' : 'text-white'}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <BackgroundWrapper>
      <ScrollView className="flex-1 px-5 pt-16 " showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header avec barre de recherche */}
        <View className="mb-7">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-3xl font-bold">Explorer</Text>
            <TouchableOpacity 
              className="p-2 rounded-full bg-white/10"
              onPress={() => setShowFilters(true)}
              accessibilityRole="button"
            >
              <Ionicons name="filter" size={24} color={primaryColor} />
            </TouchableOpacity>
          </View>

          <View className="relative">
            <TextInput
              className="bg-white/20 text-white text-base rounded-xl pl-16 pr-4 py-4 shadow-lg"
              placeholder="Rechercher événements, artistes..."
              placeholderTextColor="#AAAAAA"
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Recherche événements"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            <Ionicons
              name="search"
              size={24}
              color={primaryColor}
              style={{ position: 'absolute', left: 20, top: 16 }}
            />
          </View>
        </View>

        {/* Catégories rapides */}
        <View className="mb-8">
          <Text className="text-white text-xl font-bold mb-4">Catégories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="pb-2"
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                className={`px-5 py-3 rounded-2xl mr-3 ${
                  filters.category === category.id 
                    ? 'bg-[#ec673b]' 
                    : 'bg-white/10'
                }`}
                onPress={() => handleFilterChange('category', category.id)}
                accessibilityRole="button"
              >
                <Text className={filters.category === category.id ? 'text-gray-900 font-bold' : 'text-white'}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Résultats */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-xl font-bold">
              {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''} trouvé{filteredEvents.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity 
              onPress={resetFilters} 
              accessibilityRole="button"
              accessibilityLabel="Réinitialiser filtres"
            >
              <Text style={{ color: primaryColor }} className="text-sm font-medium">Réinitialiser</Text>
            </TouchableOpacity>
          </View>

          {filteredEvents.length > 0 ? (
            <FlatList
              data={filteredEvents}
              renderItem={renderEventItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              nestedScrollEnabled
            />
          ) : (
            <View className="bg-white/10 rounded-xl p-8 items-center">
              <MaterialIcons name="search-off" size={48} color={primaryColor} />
              <Text className="text-white font-bold mt-5 text-lg">Aucun événement trouvé</Text>
              <Text className="text-gray-400 text-center mt-3 text-base">
                Essayez de modifier vos filtres ou votre recherche
              </Text>
              <TouchableOpacity
                className="py-3 px-8 mt-5 rounded-xl"
                style={{ backgroundColor: primaryColor }}
                onPress={resetFilters}
                accessibilityRole="button"
              >
                <Text className="text-gray-900 font-bold text-base">Réinitialiser les filtres</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {renderCategorySections()}
      </ScrollView>

      {/* Modal Filtres */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-gray-900 rounded-t-3xl p-6 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-bold">Filtres avancés</Text>
              <TouchableOpacity 
                onPress={() => setShowFilters(false)} 
                accessibilityRole="button" 
                accessibilityLabel="Fermer filtres"
              >
                <Ionicons name="close" size={28} color={primaryColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
              {renderFilterOptions('location', cities)}
              {renderFilterOptions('date', dateFilters)}
              {renderFilterOptions('price', priceFilters)}
              {renderFilterOptions('category', categories)}
              {renderFilterOptions('eventType', eventTypes)}
            </ScrollView>

            <View className="flex-row justify-between mt-5">
              <TouchableOpacity
                className="py-4 px-6 rounded-xl bg-white/10 flex-1 mr-3 items-center"
                onPress={resetFilters}
                accessibilityRole="button"
              >
                <Text className="text-white font-bold text-base">Réinitialiser</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-4 px-6 rounded-xl flex-1 ml-3 items-center"
                style={{ backgroundColor: primaryColor }}
                onPress={() => setShowFilters(false)}
                accessibilityRole="button"
              >
                <Text className="text-gray-900 font-bold text-base">Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </BackgroundWrapper>
  );
};

export default ExploreScreen;