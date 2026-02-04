import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };

interface EventStatistics {
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

const EventStatistics = () => {
  const { id } = useLocalSearchParams();
  const [eventData, setEventData] = useState<EventStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEventStatistics = async () => {
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
      const event = data.find((event: EventStatistics) => event._id === id);
      
      if (event) {
        console.log("📊 Event statistics data:", event);
        setEventData(event);
      } else {
        Alert.alert("Erreur", "Événement non trouvé");
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      Alert.alert("Erreur", "Impossible de charger les statistiques de l'événement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventStatistics();
    }
  }, [id]);

  if (loading) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#68f2f4" />
          <Text className="text-white mt-4 text-lg">Chargement des statistiques...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  if (!eventData) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center">
          <Ionicons name="alert-circle" size={64} color="#ff6b6b" />
          <Text className="text-white text-lg mt-4">Événement non trouvé</Text>
          <TouchableOpacity
            className="mt-4 bg-teal-400 py-2 px-6 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-gray-900 font-bold">Retour</Text>
          </TouchableOpacity>
        </View>
      </BackgroundWrapper>
    );
  }

  // Calculate statistics
  const occupancyRate = Math.round((eventData.ticketsSold / eventData.totalTickets) * 100);
  const revenuePerTicket = eventData.ticketsSold > 0 ? Math.round(eventData.revenue / eventData.ticketsSold) : 0;

  // Prepare ticket type data for pie chart
  const ticketTypeData = eventData.tickets.map((ticket, index) => {
    const colors = ['#FFC107', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0'];
    return {
      name: ticket.type,
      population: ticket.sold,
      color: colors[index % colors.length],
      legendFontColor: "#FFF",
      legendFontSize: 12
    };
  });

  // Prepare payment methods data for pie chart
  const paymentMethodsData = eventData.paymentMethodsStats?.map((method, index) => {
    const colors = ['#4A90E2', '#50E3C2', '#E35050', '#FF9500', '#5856D6'];
    return {
      name: method.name,
      population: method.transactions,
      amount: method.amount,
      color: colors[index % colors.length],
      legendFontColor: "#FFF",
      legendFontSize: 12
    };
  }) || [];

  // Prepare sales timeline data for bar chart
  const salesTimelineData = {
    labels: eventData.salesTimeline?.map(item => 
      new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    ) || [],
    datasets: [{
      data: eventData.salesTimeline?.map(item => item.ticketsSold) || []
    }]
  };

  const chartConfig = {
    backgroundGradientFrom: "#1e293b",
    backgroundGradientTo: "#0f172a",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(104, 242, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#68f2f4"
    }
  };

  return (
    <BackgroundWrapper>
      <ScrollView className="flex-1 px-4 pt-16 pb-36">
        {/* Header */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#68f2f4" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold text-center flex-1">
              Statistiques d'événement
            </Text>
            <View style={{ width: 28 }} />
          </View>
          <Text className="text-teal-400 text-xl font-semibold text-center">
            {eventData.title}
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-1">
            {new Date(eventData.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })} • {eventData.location}
          </Text>
        </View>

        {/* Statistics Cards */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <StatCard
            icon="ticket"
            title="Tickets vendus"
            value={`${eventData.ticketsSold}/${eventData.totalTickets}`}
          />
          <StatCard
            icon="podium"
            title="Taux de remplissage"
            value={`${occupancyRate}%`}
          />
          <StatCard
            icon="cash"
            title="Revenu total"
            value={`${(eventData.revenue / 1000).toFixed(0)}k MRO`}
          />
          <StatCard
            icon="analytics"
            title="Moyenne/ticket"
            value={`${revenuePerTicket} MRO`}
          />
        </View>

        {/* Ticket Types Distribution */}
        {ticketTypeData.length > 0 && (
          <View className="bg-white/10 rounded-2xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Répartition des tickets
            </Text>
            <PieChart
              data={ticketTypeData}
              width={Dimensions.get('window').width - 48}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            
            {/* Ticket type details */}
            <View className="mt-4">
              {eventData.tickets.map((ticket, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center py-3 border-b border-white/20"
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: ticketTypeData[index]?.color || '#68f2f4' }}
                    />
                    <Text className="text-white">{ticket.type}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-teal-400 font-medium">
                      {ticket.sold} vendus
                    </Text>
                    <Text className="text-amber-400 text-sm mt-1">
                      {ticket.revenue?.toLocaleString() || 0} MRO
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Payment Methods Distribution */}
        {paymentMethodsData.length > 0 && (
          <View className="bg-white/10 rounded-2xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Répartition des paiements
            </Text>

            <PieChart
              data={paymentMethodsData}
              width={Dimensions.get('window').width - 48}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />

            <View className="mt-4">
              {eventData.paymentMethodsStats?.map((method, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center py-3 border-b border-white/20"
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: paymentMethodsData[index]?.color || '#68f2f4' }}
                    />
                    <Ionicons name="card" size={18} color="#68f2f4" />
                    <Text className="text-white ml-2">{method.name}</Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-teal-400 font-medium">
                      {method.transactions} transactions
                    </Text>
                    <Text className="text-amber-400 text-sm mt-1">
                      {(method.amount / 1000).toFixed(0)}k MRO
                    </Text>
                  </View>
                </View>
              ))}

              <View className="flex-row justify-between items-center pt-3">
                <Text className="text-white font-bold">Total</Text>
                <View className="items-end">
                  <Text className="text-teal-400 font-bold">
                    {eventData.paymentMethodsStats?.reduce((sum, method) => sum + method.transactions, 0)} transactions
                  </Text>
                  <Text className="text-amber-400 font-bold text-base">
                    {(eventData.paymentMethodsStats?.reduce((sum, method) => sum + method.amount, 0) / 1000).toFixed(0)}k MRO
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Sales Timeline */}
        {salesTimelineData.labels.length > 0 && (
          <View className="bg-white/10 rounded-2xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Évolution des ventes
            </Text>
            <BarChart
              data={salesTimelineData}
              width={Dimensions.get('window').width - 48}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              fromZero={true}
              showBarTops={false}
              withInnerLines={false}
               yAxisLabel=""        
  yAxisSuffix=""    
            />
          </View>
        )}

        {/* Revenue by Ticket Type */}
        {eventData.revenueByType && eventData.revenueByType.length > 0 && (
          <View className="bg-white/10 rounded-2xl p-4">
            <Text className="text-white text-lg font-bold mb-4">
              Revenus par type de ticket
            </Text>
            {eventData.revenueByType.map((revenueItem, index) => (
              <View
                key={index}
                className="flex-row justify-between items-center py-3 border-b border-white/20"
              >
                <View className="flex-row items-center">
                  <View
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: ticketTypeData[index]?.color || '#68f2f4' }}
                  />
                  <Text className="text-white">{revenueItem.type}</Text>
                </View>
                <Text className="text-teal-400 font-medium">
                  {revenueItem.amount.toLocaleString()} MRO
                </Text>
              </View>
            ))}
            <View className="flex-row justify-between items-center pt-3">
              <Text className="text-white font-bold">Total revenus</Text>
              <Text className="text-amber-400 font-bold text-base">
                {eventData.revenue.toLocaleString()} MRO
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </BackgroundWrapper>
  );
};

const StatCard = ({ icon, title, value }: { icon: string, title: string, value: string }) => (
  <View className="bg-white/10 rounded-2xl p-4 mb-4 w-[48%]">
    <View className="flex-row items-center mb-2">
      <Ionicons name={icon as any} size={20} color="#68f2f4" />
      <Text className="text-teal-400 ml-2 text-sm">{title}</Text>
    </View>
    <Text className="text-white text-xl font-bold">{value}</Text>
  </View>
);

export default EventStatistics;