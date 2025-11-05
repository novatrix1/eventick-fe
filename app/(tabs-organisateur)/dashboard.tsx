import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Platform, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import BackgroundWrapper from '@/components/BackgroundWrapper'
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { LineChart, PieChart } from 'react-native-chart-kit'
import * as Haptics from 'expo-haptics'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  isActive: boolean;
  totalTickets: number;
  availableTickets: number;
  tickets: TicketType[];
  totalRevenue: number;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
}


const Dashboard = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming')
  const screenWidth = Dimensions.get('window').width
  const scrollRef = useRef<ScrollView>(null)
  const [activeTimeFilter, setActiveTimeFilter] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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
        let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
        const eventDate = new Date(event.date);
        const now = new Date();
        
        if (event.isActive) {
          status = eventDate > now ? 'upcoming' : 'completed';
        } else {
          status = 'completed';
        }

        const timeDiff = eventDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        if (status === 'upcoming' && hoursDiff <= 5 && hoursDiff >= 0) {
          status = 'ongoing';
        }

        const tickets: TicketType[] = event.tickets ? event.tickets.map((ticket: any) => ({
          id: ticket._id || ticket.id,
          name: ticket.type || ticket.name,
          price: ticket.price || 0,
          quantity: ticket.totalTickets || ticket.quantity,
          sold: (ticket.totalTickets - ticket.availableTickets) || ticket.sold,
        })) : [];

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

  const statsData = {
    totalSales: 1245,
    ticketsLeft: 320,
    revenue: 1245000,
    notifications: [
      { id: '1', type: 'warning', title: 'Stock faible', message: 'Tournoi de Football: bientôt en rupture de billets', time: 'Il y a 2 heures' },
      { id: '2', type: 'info', title: 'Vente rapide', message: 'Festival du Désert: 245 billets vendus aujourd\'hui', time: 'Il y a 5 heures' },
      { id: '3', type: 'success', title: 'Paiement reçu', message: 'Conférence Tech: Nouveau paiement Bankily', time: 'Aujourd\'hui' },
    ],
    paymentMethods: [
      { name: "Bankily", value: 45, color: "#4CAF50", legendFontColor: "#fff", legendFontSize: 12 },
      { name: "Masrvi", value: 30, color: "#2196F3", legendFontColor: "#fff", legendFontSize: 12 },
      { name: "Carte bancaire", value: 25, color: "#FFC107", legendFontColor: "#fff", legendFontSize: 12 },
    ],
    popularCategories: [
      { name: "Concerts", value: 35, color: "#E91E63" },
      { name: "Sports", value: 25, color: "#3F51B5" },
      { name: "Conférences", value: 20, color: "#009688" },
      { name: "Festivals", value: 15, color: "#FF9800" },
      { name: "Religieux", value: 5, color: "#795548" },
    ]
  }

  const chartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept'],
    datasets: [
      {
        data: [20000, 45000, 28000, 80000, 99000, 124500, 155000, 142000, 180000],
        color: (opacity = 1) => `rgba(104, 242, 244, ${opacity})`,
        strokeWidth: 3
      }
    ],
  }

  const chartConfig = {
    backgroundColor: '#001215',
    backgroundGradientFrom: '#001215',
    backgroundGradientTo: '#00252a',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(104, 242, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#001215"
    },
    propsForLabels: {
      fontSize: 10
    },
    style: {
      borderRadius: 16
    },
    propsForVerticalLabels: {
      dx: -5
    },
    propsForHorizontalLabels: {
      dy: 5
    }
  }

  const filteredEvents = events.filter(event => event.status === activeTab)

  const handleTabPress = (tab: 'upcoming' | 'ongoing' | 'completed') => {
    setActiveTab(tab)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    scrollRef.current?.scrollTo({ y: 0, animated: true })
  }

  const handleTimeFilter = (filter: 'day' | 'week' | 'month' | 'year') => {
    setActiveTimeFilter(filter)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const getTimeFilterStats = () => {
    switch (activeTimeFilter) {
      case 'day':
        return { sales: 142, revenue: 425000 }
      case 'week':
        return { sales: 745, revenue: 2235000 }
      case 'month':
        return { sales: 1245, revenue: 3735000 }
      case 'year':
        return { sales: 8420, revenue: 25260000 }
      default:
        return { sales: 1245, revenue: 3735000 }
    }
  }

  const timeStats = getTimeFilterStats()

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#68f2f4" />
          <Text className="text-white mt-4">Chargement des événements...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 pt-16 pb-32"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#68f2f4"
            colors={['#68f2f4']}
          />
        }
      >
        <Animated.View
          entering={FadeIn.duration(500)}
          className="flex-row justify-between items-center mb-6"
        >
          <View>
            <Text className="text-white text-2xl font-bold">Tableau de bord</Text>
            <Text className="text-teal-400 mt-1">Vue d'ensemble de vos événements</Text>
          </View>
          <TouchableOpacity
            className="bg-teal-400/10 p-2 rounded-full"
          >
            <Ionicons name="notifications" size={24} color="#68f2f4" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(50)}
          className="mb-4"
        >
          <View className="flex-row justify-between bg-teal-400/10 rounded-xl p-1">
            {['day', 'week', 'month', 'year'].map((filter) => (
              <TouchableOpacity
                key={filter}
                className={`flex-1 py-2 rounded-xl ${activeTimeFilter === filter ? 'bg-teal-400' : ''}`}
                onPress={() => handleTimeFilter(filter as any)}
              >
                <Text className={`text-center text-xs font-medium ${activeTimeFilter === filter ? 'text-gray-900' : 'text-teal-400'}`}>
                  {filter === 'day' ? 'Aujourd\'hui' :
                    filter === 'week' ? 'Cette semaine' :
                      filter === 'month' ? 'Ce mois' : 'Cette année'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          className="mb-8"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Statistiques</Text>
            <Text className="text-teal-400 text-sm">
              {activeTimeFilter === 'day' ? 'Aujourd\'hui' :
                activeTimeFilter === 'week' ? '7 derniers jours' :
                  activeTimeFilter === 'month' ? '30 derniers jours' : '12 derniers mois'}
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            <View className="bg-teal-400/10 p-4 rounded-xl w-[48%] mb-3" style={styles.statCard}>
              <View className="flex-row items-center">
                <Ionicons name="ticket" size={20} color="#68f2f4" />
                <Text className="text-white font-bold ml-2">{timeStats.sales}</Text>
              </View>
              <Text className="text-teal-400 text-sm mt-2">Billets vendus</Text>
            </View>

            <View className="bg-teal-400/10 p-4 rounded-xl w-[48%] mb-3" style={styles.statCard}>
              <View className="flex-row items-center">
                <MaterialIcons name="attach-money" size={20} color="#68f2f4" />
                <Text className="text-white font-bold ml-2">{timeStats.revenue.toLocaleString()} MRO</Text>
              </View>
              <Text className="text-teal-400 text-sm mt-2">Revenus</Text>
            </View>

            <View className="bg-teal-400/10 p-4 rounded-xl w-[48%] mb-3" style={styles.statCard}>
              <View className="flex-row items-center">
                <Ionicons name="people" size={20} color="#68f2f4" />
                <Text className="text-white font-bold ml-2">78%</Text>
              </View>
              <Text className="text-teal-400 text-sm mt-2">Taux de remplissage</Text>
            </View>

            <View className="bg-teal-400/10 p-4 rounded-xl w-[48%] mb-3" style={styles.statCard}>
              <View className="flex-row items-center">
                <FontAwesome5 name="user-check" size={16} color="#68f2f4" />
                <Text className="text-white font-bold ml-2">92%</Text>
              </View>
              <Text className="text-teal-400 text-sm mt-2">Taux de présence</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          className="mb-8"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Évolution des ventes</Text>
            <TouchableOpacity>
              <Text className="text-teal-400 text-sm">Voir détails</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-teal-400/10 rounded-xl p-4">
            <LineChart
              data={chartData}
              width={screenWidth - 48}
              height={250}
              yAxisLabel="MRU "
              yAxisSuffix=""
              chartConfig={chartConfig}
              bezier
              style={{
                borderRadius: 16,
                paddingRight: 85,
                marginLeft: -10,
              }}
              withVerticalLines={false}
              withShadow={true}
              segments={5}
              fromZero={true}
              yLabelsOffset={15}
              xLabelsOffset={-5}
            />
          </View>

          <View className="flex-row items-center mt-3 ml-2">
            <View className="w-3 h-3 bg-teal-400 rounded-full mr-2" />
            <Text className="text-teal-400 text-sm">Revenus mensuels (MRO)</Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(250)}
          className="mb-8"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Moyens de paiement</Text>
            <TouchableOpacity>
              <Text className="text-teal-400 text-sm">Voir détails</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-teal-400/10 rounded-xl p-4">
            <PieChart
              data={statsData.paymentMethods}
              width={screenWidth - 48}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor={"value"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[0, 0]}
              absolute
              hasLegend
            />
          </View>

          <View className="mt-4 flex-row justify-center flex-wrap">
            {statsData.paymentMethods.map((method, index) => (
              <View key={index} className="flex-row items-center mr-4 mb-2">
                <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: method.color }} />
                <Text className="text-white text-xs">{method.name}: {method.value}%</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(350)}
          className="mb-6"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Vos événements</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color="#68f2f4" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between bg-teal-400/10 rounded-xl p-1 mb-4">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-xl ${activeTab === 'upcoming' ? 'bg-teal-400' : ''}`}
              onPress={() => handleTabPress('upcoming')}
            >
              <Text className={`text-center font-medium ${activeTab === 'upcoming' ? 'text-gray-900' : 'text-teal-400'}`} style={styles.tabText}>
                À venir
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2 rounded-xl ${activeTab === 'ongoing' ? 'bg-teal-400' : ''}`}
              onPress={() => handleTabPress('ongoing')}
            >
              <Text className={`text-center font-medium ${activeTab === 'ongoing' ? 'text-gray-900' : 'text-teal-400'}`} style={styles.tabText}>
                En cours
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2 rounded-xl ${activeTab === 'completed' ? 'bg-teal-400' : ''}`}
              onPress={() => handleTabPress('completed')}
            >
              <Text className={`text-center font-medium ${activeTab === 'completed' ? 'text-gray-900' : 'text-teal-400'}`} style={styles.tabText}>
                Terminés
              </Text>
            </TouchableOpacity>
          </View>

          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <Animated.View
                key={event.id}
                entering={FadeInDown.duration(500).delay(100 * index)}
              >
                <TouchableOpacity
                  className="bg-white/5 rounded-xl p-4 mb-3"
                  style={styles.eventCard}
                  onPress={() => router.push(`/EditEvent/[id]`)}
                >
                  <View className="flex-row">
                    <Image
                      source={{ uri: event.image || 'https://res.cloudinary.com/daxa8aqwd/image/upload/v1755673452/qiwssa9y370si1agfrzp.jpg' }}
                      className="w-16 h-16 rounded-lg mr-4"
                    />
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text className="text-white font-bold text-base mb-1">{event.title}</Text>
                          <Text className="text-teal-400 text-xs">{event.category}</Text>
                          <Text className="text-teal-400 text-xs mt-1">{event.date} • {event.time}</Text>
                          <Text className="text-gray-400 text-xs mt-1">{event.location}</Text>
                        </View>

                        <View className="items-end">
                          <Text className="text-white font-bold">{event.tickets.reduce((acc, ticket) => acc + ticket.sold, 0)}/{event.totalTickets}</Text>
                          <Text className="text-teal-400 text-xs mt-1">billets vendus</Text>
                        </View>
                      </View>

                      <View className="mt-3">
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-teal-400 text-xs">
                            {Math.round((event.tickets.reduce((acc, ticket) => acc + ticket.sold, 0) / event.totalTickets) * 100)}% vendus
                          </Text>
                          <Text className="text-gray-400 text-xs">
                            {event.tickets.reduce((acc, ticket) => acc + ticket.sold, 0)}/{event.totalTickets} billets
                          </Text>
                        </View>
                        <View className="w-full bg-gray-700 rounded-full h-2.5">
                          <View
                            className="bg-teal-400 h-2.5 rounded-full"
                            style={{ width: `${(event.tickets.reduce((acc, ticket) => acc + ticket.sold, 0) / event.totalTickets) * 100}%` }}
                          />
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center mt-3">
                        <Text className="text-white font-bold text-sm">{event.totalRevenue.toLocaleString()} MRO</Text>
                        <Text className="text-teal-400 text-xs">Revenus générés</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <Animated.View
              entering={FadeInDown.duration(500)}
              className="bg-white/5 rounded-xl p-8 items-center justify-center"
            >
              <Ionicons name="calendar" size={48} color="#68f2f4" />
              <Text className="text-white text-center mt-4 text-lg">
                Aucun événement {activeTab === 'upcoming' ? 'à venir' : activeTab === 'ongoing' ? 'en cours' : 'terminé'}
              </Text>
              <TouchableOpacity
                className="mt-4 bg-teal-400 py-2 px-6 rounded-full"
                onPress={() => router.push('/organizer/create-event')}
              >
                <Text className="text-gray-900 font-bold">Créer un événement</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(400)}
          className="mb-40"
        >
          <Text className="text-white text-xl font-bold mb-4">Actions rapides</Text>
          <View className="flex-row flex-wrap justify-between">
            {[
              {
                icon: 'add',
                label: 'Créer événement',
                action: () => router.push('/screens/CreateEvent')
              },
              {
                icon: 'qr-code',
                label: 'Scanner QR',
                action: () => router.push('/organizer/scanner')
              },
              {
                icon: 'cash',
                label: 'Paiements',
                action: () => router.push('/organizer/payments')
              },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                className="bg-teal-400/10 p-4 rounded-xl w-[48%] mb-3 items-center"
                onPress={item.action}
                style={{ minHeight: 100 }}
              >
                <View className="bg-teal-400 p-3 rounded-full mb-2">
                  <Ionicons name={item.icon} size={20} color="#001215" />
                </View>
                <Text className="text-white font-medium text-center text-sm">{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </BackgroundWrapper>
  )
}

const styles = StyleSheet.create({
  statCard: {
    shadowColor: '#68f2f4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  chartContainer: {
    paddingRight: 15,
    marginLeft: -5,
  },
  tabText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    fontWeight: '500',
    fontSize: 12
  },
  eventCard: {
    shadowColor: '#68f2f4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  }
})

export default Dashboard