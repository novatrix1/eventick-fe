import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Platform, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import BackgroundWrapper from '@/components/BackgroundWrapper'
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { LineChart, PieChart } from 'react-native-chart-kit'
import * as Haptics from 'expo-haptics'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
  revenueByType: Array<{
    type: string;
    amount: number;
  }>;
  salesTimeline: Array<{
    date: string;
    ticketsSold: number;
    revenue: number;
  }>;
  paymentMethodsStats: Array<{
    name: string;
    transactions: number;
    amount: number;
  }>;
}

interface DashboardStats {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  upcomingEvents: number;
  activeEvents: number;
  completedEvents: number;
  averageRevenuePerEvent: number;
  paymentMethodsDistribution: Array<{
    name: string;
    value: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
  revenueTimeline: Array<{
    date: string;
    revenue: number;
  }>;
}

const Dashboard = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed'>('upcoming')
  const screenWidth = Dimensions.get('window').width
  const scrollRef = useRef<ScrollView>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
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
      
      // Calculate dashboard stats from events data
      calculateStats(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      Alert.alert("Erreur", "Impossible de charger les événements");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (eventsData: Event[]) => {
    const now = new Date();
    
    const totalEvents = eventsData.length;
    const totalRevenue = eventsData.reduce((sum, event) => sum + (event.revenue || 0), 0);
    const totalTicketsSold = eventsData.reduce((sum, event) => sum + (event.ticketsSold || 0), 0);
    
    const upcomingEvents = eventsData.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate > now && event.isActive;
    }).length;
    
    const activeEvents = eventsData.filter(event => event.isActive).length;
    const completedEvents = eventsData.filter(event => !event.isActive).length;
    
    const averageRevenuePerEvent = totalEvents > 0 ? totalRevenue / totalEvents : 0;

    // Calculate payment methods distribution
    const paymentMethodsData: { [key: string]: number } = {};
    eventsData.forEach(event => {
      event.paymentMethodsStats?.forEach(payment => {
        if (paymentMethodsData[payment.name]) {
          paymentMethodsData[payment.name] += payment.amount;
        } else {
          paymentMethodsData[payment.name] = payment.amount;
        }
      });
    });

    const totalPaymentAmount = Object.values(paymentMethodsData).reduce((sum, amount) => sum + amount, 0);
    
    const paymentMethodsDistribution = Object.entries(paymentMethodsData).map(([name, amount], index) => {
      const colors = ['#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0', '#FF5722'];
      return {
        name,
        value: totalPaymentAmount > 0 ? Math.round((amount / totalPaymentAmount) * 100) : 0,
        color: colors[index % colors.length],
        legendFontColor: "#fff",
        legendFontSize: 12
      };
    });

    // Calculate revenue timeline from salesTimeline
    const revenueTimeline = eventsData.flatMap(event => 
      event.salesTimeline?.map(sale => ({
        date: new Date(sale.date).toLocaleDateString('fr-FR', { month: 'short' }),
        revenue: sale.revenue
      })) || []
    );

    const dashboardStats: DashboardStats = {
      totalEvents,
      totalRevenue,
      totalTicketsSold,
      upcomingEvents,
      activeEvents,
      completedEvents,
      averageRevenuePerEvent,
      paymentMethodsDistribution,
      revenueTimeline
    };

    setStats(dashboardStats);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventStatus = (event: Event): 'upcoming' | 'active' | 'completed' => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (!event.isActive) {
      return 'completed';
    }
    
    if (eventDate > now) {
      return 'upcoming';
    }
    
    // If event date is today or in the past but still active, consider it active
    const timeDiff = eventDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    if (hoursDiff <= 24 && hoursDiff >= -24) { // Within 24 hours before and after event time
      return 'active';
    }
    
    return eventDate > now ? 'upcoming' : 'completed';
  };

  const filteredEvents = events.filter(event => getEventStatus(event) === activeTab);

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
  };

  const handleTabPress = (tab: 'upcoming' | 'active' | 'completed') => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

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
            onPress={() => router.push('/organizer/notifications')}
          >
            <Ionicons name="notifications" size={24} color="#68f2f4" />
          </TouchableOpacity>
        </Animated.View>

        {/* Statistiques Globales */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          className="mb-8"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Statistiques Globales</Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            <View className="bg-teal-400/10 p-4 rounded-xl w-[48%] mb-3" style={styles.statCard}>
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#68f2f4" />
                <Text className="text-white font-bold ml-2">{stats?.totalEvents || 0}</Text>
              </View>
              <Text className="text-teal-400 text-sm mt-2">Événements totaux</Text>
            </View>

            <View className="bg-teal-400/10 p-4 rounded-xl w-[48%] mb-3" style={styles.statCard}>
              <View className="flex-row items-center">
                <MaterialIcons name="attach-money" size={20} color="#68f2f4" />
                <Text className="text-white font-bold ml-2">{stats?.totalRevenue?.toLocaleString() || 0} MRO</Text>
              </View>
              <Text className="text-teal-400 text-sm mt-2">Revenus totaux</Text>
            </View>

            <View className="bg-teal-400/10 p-4 rounded-xl w-[48%] mb-3" style={styles.statCard}>
              <View className="flex-row items-center">
                <Ionicons name="ticket" size={20} color="#68f2f4" />
                <Text className="text-white font-bold ml-2">{stats?.totalTicketsSold || 0}</Text>
              </View>
              <Text className="text-teal-400 text-sm mt-2">Billets vendus</Text>
            </View>

            <View className="bg-teal-400/10 p-4 rounded-xl w-[48%] mb-3" style={styles.statCard}>
              <View className="flex-row items-center">
                <FontAwesome5 name="chart-line" size={16} color="#68f2f4" />
                <Text className="text-white font-bold ml-2">{stats?.averageRevenuePerEvent?.toLocaleString() || 0} MRO</Text>
              </View>
              <Text className="text-teal-400 text-sm mt-2">Revenu moyen/événement</Text>
            </View>
          </View>
        </Animated.View>

        {/* Graphique des revenus */}
        {stats?.revenueTimeline && stats.revenueTimeline.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            className="mb-8"
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">Évolution des revenus</Text>
            </View>

            <View className="bg-teal-400/10 rounded-xl p-4">
              <LineChart
                data={{
                  labels: stats.revenueTimeline.map(item => item.date),
                  datasets: [{
                    data: stats.revenueTimeline.map(item => item.revenue),
                    color: (opacity = 1) => `rgba(104, 242, 244, ${opacity})`,
                    strokeWidth: 3
                  }]
                }}
                width={screenWidth - 48}
                height={220}
                yAxisLabel="MRU "
                yAxisSuffix=""
                chartConfig={chartConfig}
                bezier
                style={{
                  borderRadius: 16,
                  paddingRight: 45,
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
          </Animated.View>
        )}

        {/* Moyens de paiement */}
        {stats?.paymentMethodsDistribution && stats.paymentMethodsDistribution.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(500).delay(250)}
            className="mb-8"
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">Moyens de paiement</Text>
            </View>

            <View className="bg-teal-400/10 rounded-xl p-4">
              <PieChart
                data={stats.paymentMethodsDistribution}
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
              {stats.paymentMethodsDistribution.map((method, index) => (
                <View key={index} className="flex-row items-center mr-4 mb-2">
                  <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: method.color }} />
                  <Text className="text-white text-xs">{method.name}: {method.value}%</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Liste des événements */}
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
                À venir ({stats?.upcomingEvents || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2 rounded-xl ${activeTab === 'active' ? 'bg-teal-400' : ''}`}
              onPress={() => handleTabPress('active')}
            >
              <Text className={`text-center font-medium ${activeTab === 'active' ? 'text-gray-900' : 'text-teal-400'}`} style={styles.tabText}>
                Actifs ({stats?.activeEvents || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2 rounded-xl ${activeTab === 'completed' ? 'bg-teal-400' : ''}`}
              onPress={() => handleTabPress('completed')}
            >
              <Text className={`text-center font-medium ${activeTab === 'completed' ? 'text-gray-900' : 'text-teal-400'}`} style={styles.tabText}>
                Terminés ({stats?.completedEvents || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <Animated.View
                key={event._id}
                entering={FadeInDown.duration(500).delay(100 * index)}
              >
                <TouchableOpacity
                  className="bg-white/5 rounded-xl p-4 mb-3"
                  style={styles.eventCard}
                  onPress={() => router.push(`/EditEvent/${event._id}`)}
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
                          <Text className="text-teal-400 text-xs mt-1">
                            {new Date(event.date).toLocaleDateString('fr-FR')} • {event.time}
                          </Text>
                          <Text className="text-gray-400 text-xs mt-1">{event.location}</Text>
                        </View>

                        <View className="items-end">
                          <Text className="text-white font-bold">{event.ticketsSold || 0}/{event.totalTickets}</Text>
                          <Text className="text-teal-400 text-xs mt-1">billets vendus</Text>
                        </View>
                      </View>

                      <View className="mt-3">
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-teal-400 text-xs">
                            {Math.round(((event.ticketsSold || 0) / event.totalTickets) * 100)}% vendus
                          </Text>
                          <Text className="text-gray-400 text-xs">
                            {event.ticketsSold || 0}/{event.totalTickets} billets
                          </Text>
                        </View>
                        <View className="w-full bg-gray-700 rounded-full h-2.5">
                          <View
                            className="bg-teal-400 h-2.5 rounded-full"
                            style={{ width: `${((event.ticketsSold || 0) / event.totalTickets) * 100}%` }}
                          />
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center mt-3">
                        <Text className="text-white font-bold text-sm">{event.revenue?.toLocaleString() || 0} MRO</Text>
                        <Text className="text-teal-400 text-xs">Revenus générés</Text>
                      </View>

                      {event.tickets && event.tickets.length > 0 && (
                        <View className="mt-2">
                          <Text className="text-teal-400 text-xs mb-1">Types de billets:</Text>
                          <View className="flex-row flex-wrap">
                            {event.tickets.map((ticket, ticketIndex) => (
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
                Aucun événement {activeTab === 'upcoming' ? 'à venir' : activeTab === 'active' ? 'actif' : 'terminé'}
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

        {/* Actions rapides */}
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
                action: () => router.push('/(tabs-organisateur)/scan')
              },
            
              {
                icon: 'settings',
                label: 'Paramètres',
                action: () => router.push('/(tabs-organisateur)/profile')
              },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                className="bg-teal-400/10 p-4 rounded-xl w-[48%] mb-3 items-center"
                onPress={item.action}
                style={{ minHeight: 100 }}
              >
                <View className="bg-teal-400 p-3 rounded-full mb-2">
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color="#001215" />
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