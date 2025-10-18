import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, Share, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Dimensions } from 'react-native';

const API_URL = "https://eventick.onrender.com";

interface Organizer {
  _id: string;
  companyName: string;
  phone: string;
  type: string;
  contactEmail: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface Ticket {
  _id: string;
  type: string;
  price: number;
  totalTickets: number;
  availableTickets: number;
  description: string;
  available: boolean;
}

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
  organizer: Organizer;
  isActive: boolean;
  paymentMethods: string[];
  ticket: Ticket[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

type TicketType = {
  id: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
  totalTickets: number;
  availableTickets: number;
};

const EventDetailScreen = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  const [ticketCount, setTicketCount] = useState(1);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/events/${id}`);
      setEvent(response.data);

      if (response.data.ticket && response.data.ticket.length > 0) {
        const availableTicket = response.data.ticket.find((t: Ticket) => t.available);
        if (availableTicket) {
          setSelectedTicket(availableTicket._id);
        }
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;

    try {
      await Share.share({
        message: `Rejoignez-moi au ${event.title} le ${formatDate(event.date)} !`,
        title: event.title,
      });
    } catch (error) {
      console.error('Erreur de partage :', error);
    }
  };

  const handleReservation = () => {
    if (!event || !selectedTicket) return;

    const selectedTicketData = event.ticket.find(t => t._id === selectedTicket);
    if (!selectedTicketData) return;

    router.push({
      pathname: `/reservation/${event._id}`,
      params: {
        ticketTypeId: selectedTicket,
        quantity: ticketCount,
        price: selectedTicketData.price,
        eventTitle: event.title,
        eventDate: event.date
      }
    });
  };

  const incrementTickets = () => setTicketCount(prev => prev + 1);
  const decrementTickets = () => setTicketCount(prev => Math.max(1, prev - 1));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';

    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return timeString;
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const [isImageModalVisible, setImageModalVisible] = useState(false);

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ec673b" />
          <Text className="text-white mt-4">Chargement de l'événement...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  if (!event) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center">
          <Ionicons name="alert-circle-outline" size={50} color="#ec673b" />
          <Text className="text-white mt-4 text-center">
            Événement non trouvé
          </Text>
          <TouchableOpacity
            className="bg-[#ec673b] rounded-lg py-3 px-6 mt-6"
            onPress={() => router.back()}
          >
            <Text className="text-white font-bold">Retour</Text>
          </TouchableOpacity>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <StatusBar style="light" />
        <View className="h-80 relative">
          {event.image ? (
            <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.9}>
              <Image
                source={{ uri: event.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <View className="w-full h-full bg-teal-400/20 items-center justify-center">
              <Ionicons name="image-outline" size={50} color="#68f2f4" />
            </View>
          )}

          <LinearGradient
            colors={['rgba(0,0,0,0.9)', 'transparent']}
            className="absolute top-0 left-0 right-0"
            style={{ height: 200 }}
          />
          <TouchableOpacity
            className="absolute top-14 left-4 bg-black/30 p-3 rounded-full shadow-lg"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className="absolute top-14 right-4 bg-black/30 p-3 rounded-full shadow-lg"
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={24} color="white" />
          </TouchableOpacity>

          <Modal visible={isImageModalVisible} transparent={true} animationType="fade">
            <View className="flex-1 bg-black items-center justify-center">
              <TouchableOpacity
                className="absolute top-12 right-6 bg-black/50 p-3 rounded-full z-50"
                onPress={() => setImageModalVisible(false)}
              >
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
              <Image
                source={{ uri: event.image }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
          </Modal>
        </View>

        <TouchableOpacity
          className="flex-row items-center bg-white/5 rounded-xl p-5 m-4 shadow-md"
        >
          <View className="w-16 h-16 rounded-full bg-teal-400/20 items-center justify-center">
            <Ionicons name="business" size={30} color="#68f2f4" />
          </View>
          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-lg">
                {event.organizer.companyName}
              </Text>
            </View>

            <View className="flex-row items-center mt-2">
              <Ionicons name="mail" size={14} color="#ec673b" />
              <Text className="text-white ml-2 text-sm">
                {event.organizer.contactEmail}
              </Text>
            </View>
            <View className="flex-row items-center mt-1">
              <Ionicons name="call" size={14} color="#ec673b" />
              <Text className="text-white ml-2 text-sm">
                {event.organizer.phone}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View className="px-4 pt-2">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              <Text className="text-white text-3xl font-extrabold mr-3 flex-shrink">
                {event.title}
              </Text>
            </View>
            <View className="bg-red-600 py-1 px-4 rounded-full shadow">
              <Text className="text-white font-extrabold text-lg">
                {event.ticket && event.ticket.length > 0
                  ? `${Math.min(...event.ticket.map(t => t.price))} MRO`
                  : 'Gratuit'}
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap my-5 px-4">
            {[
              { icon: 'calendar-outline', label: formatDate(event.date) },
              { icon: 'time-outline', label: formatTime(event.time) },
              {
                icon: 'location-outline',
                label: (
                  <View>
                    <Text className="text-white font-semibold">{event.location}</Text>
                    <Text className="text-white/80 text-sm">{event.city}</Text>
                  </View>
                ),
              },
              { icon: 'pricetag-outline', label: event.category },
            ].map((info, i) => (
              <View
                key={i}
                className="flex-row items-center bg-teal-500/25 py-2 px-4 rounded-2xl mr-3 mb-3 shadow"
              >
                <Ionicons name={info.icon} size={20} color="#ffff" />
                <View className="ml-3">{typeof info.label === 'string' ? (
                  <Text className="text-white font-semibold">{info.label}</Text>
                ) : (
                  info.label
                )}</View>
              </View>
            ))}
          </View>

          <Text className="text-white text-base mb-8 px-4 leading-7">
            {event.description}
          </Text>

          <View className="flex-row mb-8 px-4 space-x-4" style={{ gap: 8 }}>
            <TouchableOpacity
              className="flex-1 bg-[#ec673b] rounded-xl py-4 items-center shadow-lg"
              onPress={() => Linking.openURL(`tel:${event.organizer.phone}`)}
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold text-lg">Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-[#ec673b] rounded-xl py-4 items-center shadow-lg"
              onPress={() => Linking.openURL(`mailto:${event.organizer.contactEmail}`)}
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold text-lg">Email</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 12, paddingHorizontal: 16 }}>
            Billets
          </Text>

          <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
            {event.ticket && event.ticket.map(ticket => {
              const isSelected = selectedTicket === ticket._id;
              return (
                <TouchableOpacity
                  key={ticket._id}
                  style={[
                    styles.ticketContainer,
                    isSelected ? styles.ticketSelected : styles.ticketUnselected,
                    !ticket.available && styles.ticketUnavailable
                  ]}
                  onPress={() => ticket.available && setSelectedTicket(ticket._id)}
                  activeOpacity={ticket.available ? 0.8 : 1}
                  disabled={!ticket.available}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={isSelected ? styles.ticketNameSelected :
                      ticket.available ? styles.ticketNameUnselected : styles.ticketNameUnavailable}>
                      {ticket.type}
                    </Text>
                    <Text style={isSelected ? styles.ticketPriceSelected :
                      ticket.available ? styles.ticketPriceUnselected : styles.ticketPriceUnavailable}>
                      {ticket.price > 0 ? `${ticket.price} MRO` : 'Gratuit'}
                    </Text>
                  </View>

                  <Text style={isSelected ? styles.ticketDescSelected :
                    ticket.available ? styles.ticketDescUnselected : styles.ticketDescUnavailable}>
                    {ticket.description}
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={isSelected ? styles.ticketAvailabilitySelected :
                      ticket.available ? styles.ticketAvailabilityUnselected : styles.ticketAvailabilityUnavailable}>
                      {ticket.availableTickets} / {ticket.totalTickets} disponibles
                    </Text>
                    {!ticket.available && (
                      <Text style={styles.soldOutText}>ÉPUISÉ</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedTicket && (
            <>
              <Text className="text-white text-xl font-bold mb-3 px-4">Quantité</Text>
              <View className="flex-row items-center justify-center bg-white/10 rounded-xl p-5 mb-40 mx-4 shadow-inner">
                <TouchableOpacity onPress={decrementTickets} className="mx-6">
                  <Ionicons name="remove-circle" size={36} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white text-3xl font-bold mx-8">{ticketCount}</Text>
                <TouchableOpacity onPress={incrementTickets} className="mx-6">
                  <Ionicons name="add-circle" size={36} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {selectedTicket && (
        <View className="absolute bottom-12 left-0 right-0 px-6">
          <TouchableOpacity
            className="bg-[#ec673b] py-5 rounded-xl items-center shadow-xl"
            onPress={handleReservation}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-xl">
              Réserver maintenant -{' '}
              {(
                (event.ticket.find(t => t._id === selectedTicket)?.price || 0) * ticketCount
              ).toLocaleString()}{' '}
              MRO
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  ticketContainer: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  ticketSelected: {
    backgroundColor: '#ec673b',
    borderWidth: 2,
    borderColor: '#ffff',
  },
  ticketUnselected: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ticketUnavailable: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.2)',
    opacity: 0.7,
  },
  ticketNameSelected: {
    fontWeight: '800',
    fontSize: 18,
    color: '#ffff',
  },
  ticketNameUnselected: {
    fontWeight: '800',
    fontSize: 18,
    color: '#fff',
  },
  ticketNameUnavailable: {
    fontWeight: '800',
    fontSize: 18,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  ticketPriceSelected: {
    fontWeight: '800',
    fontSize: 18,
    color: '#fff',
  },
  ticketPriceUnselected: {
    fontWeight: '800',
    fontSize: 18,
    color: '#fff',
  },
  ticketPriceUnavailable: {
    fontWeight: '800',
    fontSize: 18,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  ticketDescSelected: {
    marginTop: 8,
    color: '#fff',
  },
  ticketDescUnselected: {
    marginTop: 8,
    color: '#d1d5db',
  },
  ticketDescUnavailable: {
    marginTop: 8,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  ticketAvailabilitySelected: {
    color: '#fff',
    fontSize: 12,
  },
  ticketAvailabilityUnselected: {
    color: '#d1d5db',
    fontSize: 12,
  },
  ticketAvailabilityUnavailable: {
    color: '#888',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  soldOutText: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default EventDetailScreen;