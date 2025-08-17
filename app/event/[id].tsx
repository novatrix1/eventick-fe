import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, Share, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// 🟩 TYPES
type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string; // ville
  venue: string; // nom salle ou lieu précis
  address: string;
  price: string;
  category: string;
  promo?: boolean;
  image: string;
  description: string;
  organizer: string;
  contact: string;
  website: string;
  mapCoords: {
    latitude: number;
    longitude: number;
  };
};

type Organizer = {
  name: string;
  rating: number;
  eventsCount: number;
};

type TicketType = {
  id: string;
  name: string;
  price: number;
  features: string[];
};

// 🟩 DONNÉES TEMPORAIRES
const eventDetails: Event = {
  id: '1',
  title: 'Festival des Dattes',
  date: '15 Septembre 2023',
  time: '18:00 - 23:00',
  location: 'Nouakchott',
  venue: 'Stade Olympique',
  address: 'Stade Olympique, Avenue du Stade',
  price: '1500 MRO',
  category: 'culture',
  promo: true,
  image: 'https://cdn.pixabay.com/photo/2020/01/15/17/38/fireworks-4768501_1280.jpg',
  description: `Le Festival des Dattes est une célébration annuelle de la culture mauritanienne et de ses traditions ancestrales. Cet événement met à l'honneur les producteurs locaux et présente :
  
  • Démonstrations de récolte traditionnelle
  • Concours du meilleur produit
  • Ateliers culinaires avec chefs renommés
  • Spectacles de musique folklorique
  • Exposition d'artisanat local
  
  Venez découvrir l'importance de la datte dans notre patrimoine culturel et gastronomique.`,
  organizer: 'Association Culturelle Mauritanienne',
  contact: '+222 36 12 34 56',
  website: 'www.festivaldattes.mr',
  mapCoords: {
    latitude: 18.0841,
    longitude: -15.9785,
  },
};

const organizerInfo: Organizer = {
  name: 'Association Culturelle Mauritanienne',
  rating: 4.7,
  eventsCount: 42,
};

const ticketTypes: TicketType[] = [
  {
    id: 'standard',
    name: 'Pass Standard',
    price: 1500,
    features: [
      'Accès à toutes les zones publiques',
      'Dégustation gratuite',
      'Guide du festival',
    ],
  },
  {
    id: 'vip',
    name: 'Pass VIP',
    price: 5000,
    features: [
      'Accès zone VIP',
      'Rencontre avec les artistes',
      'Cadeau de bienvenue',
      'Parking privé',
    ],
  },
  {
    id: 'family',
    name: 'Pack Famille',
    price: 4000,
    features: [
      '4 pass standard',
      'Espace enfants',
      'Ateliers gratuits',
    ],
  },
];

const EventDetailScreen = ({ route, navigation }) => {
  const [selectedTicket, setSelectedTicket] = useState<string>('standard');
  const [ticketCount, setTicketCount] = useState(1);
  const router = useRouter();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Rejoignez-moi au ${eventDetails.title} le ${eventDetails.date} ! ${eventDetails.website}`,
        url: eventDetails.image,
        title: eventDetails.title,
      });
    } catch (error) {
      console.error('Erreur de partage :', error);
    }
  };

  const handleReservation = () => {
    router.push(
      `/reservation/${eventDetails.id}?ticketTypeId=${selectedTicket}&quantity=${ticketCount}`
    );
  };

  const incrementTickets = () => setTicketCount(prev => prev + 1);
  const decrementTickets = () => setTicketCount(prev => Math.max(1, prev - 1));

  return (
    <BackgroundWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <StatusBar style="light" />
        {/* Header */}
        <View className="h-80 relative">
          <Image
            source={{ uri: eventDetails.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
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
        </View>

        {/* Profil organisateur */}
        <TouchableOpacity
          onPress={() => router.push(`/organizer/${organizerInfo.name}`)}
          className="flex-row items-center bg-white/5 rounded-xl p-5 m-4 shadow-md"
        >
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }}
            className="w-16 h-16 rounded-full"
          />
          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-lg">
                {organizerInfo.name}
                <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
              </Text>
            </View>

            <View className="flex-row items-center mt-2">
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text className="text-white ml-2 text-sm">
                {organizerInfo.rating} ({organizerInfo.eventsCount} événements)
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Détails événement */}
        <View className="px-4 pt-2">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              <Text className="text-white text-3xl font-extrabold mr-3 flex-shrink">
                {eventDetails.title}
              </Text>
              {eventDetails.promo && (
                <View className="bg-yellow-400 px-2 py-1 rounded-full shadow">
                  <Text className="text-black font-bold text-sm">Promo</Text>
                </View>
              )}
            </View>
            <View className="bg-red-600 py-1 px-4 rounded-full shadow">
              <Text className="text-white font-extrabold text-lg">{eventDetails.price}</Text>
            </View>
          </View>

          {/* Infos */}
          <View className="flex-row flex-wrap my-5 px-4">
            {[
              { icon: 'calendar-outline', label: eventDetails.date },
              { icon: 'time-outline', label: eventDetails.time },
              {
                icon: 'location-outline',
                label: (
                  <View>
                    <Text className="text-white font-semibold">{eventDetails.venue}</Text>
                    <Text className="text-white/80 text-sm">{eventDetails.location}</Text>
                  </View>
                ),
              },
              { icon: 'pricetag-outline', label: eventDetails.category },
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

          {/* Description */}
          <Text className="text-white text-base mb-8 px-4 leading-7">
            {eventDetails.description}
          </Text>

          {/* Actions */}
          <View className="flex-row mb-8 px-4 space-x-4" style={{ gap: 8 }}>
            <TouchableOpacity
              className="flex-1 bg-[#ec673b] rounded-xl py-4 items-center shadow-lg"
              onPress={() => Linking.openURL(`tel:${eventDetails.contact}`)}
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold text-lg">Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-[#ec673b] rounded-xl py-4 items-center shadow-lg"
              onPress={() => Linking.openURL(`https://${eventDetails.website}`)}
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold text-lg">Site Web</Text>
            </TouchableOpacity>
          </View>

          {/* Billets */}
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 12, paddingHorizontal: 16 }}>
            Billets
          </Text>

          <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
            {ticketTypes.map(ticket => {
              const isSelected = selectedTicket === ticket.id;
              return (
                <TouchableOpacity
                  key={ticket.id}
                  style={[
                    styles.ticketContainer,
                    isSelected ? styles.ticketSelected : styles.ticketUnselected,
                  ]}
                  onPress={() => setSelectedTicket(ticket.id)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={isSelected ? styles.ticketNameSelected : styles.ticketNameUnselected}>
                      {ticket.name}
                    </Text>
                    <Text style={isSelected ? styles.ticketPriceSelected : styles.ticketPriceUnselected}>
                      {ticket.price} MRO
                    </Text>
                  </View>

                  <View style={{ marginTop: 12 }}>
                    {ticket.features.map((feature, index) => (
                      <View key={index} style={styles.featureContainer}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={isSelected ? '#fff' : '#ec673b'}
                        />
                        <Text style={isSelected ? styles.featureTextSelected : styles.featureTextUnselected}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quantité */}
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
        </View>
      </ScrollView>

      {/* Bouton réservation */}
      <View className="absolute bottom-12 left-0 right-0 px-6">
        <TouchableOpacity
          className="bg-[#ec673b] py-5 rounded-xl items-center shadow-xl"
          onPress={handleReservation}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-xl">
            Réserver maintenant -{' '}
            {(
              ticketTypes.find(t => t.id === selectedTicket)?.price * ticketCount || 0
            ).toLocaleString()}{' '}
            MRO
          </Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#ec673b', // teal-400
    borderWidth: 2,
    borderColor: '#ffff', // teal-600
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  ticketUnselected: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ticketNameSelected: {
    fontWeight: '800',
    fontSize: 18,
    color: '#ffff', // gray-900
  },
  ticketNameUnselected: {
    fontWeight: '800',
    fontSize: 18,
    color: '#fff',
  },
  ticketPriceSelected: {
    fontWeight: '800',
    fontSize: 18,
    color: '#fff',
  },
  ticketPriceUnselected: {
    fontWeight: '800',
    fontSize: 18,
    color: '#fff', // teal-400
  },
  featureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTextSelected: {
    marginLeft: 12,
    color: '#fff',
  },
  featureTextUnselected: {
    marginLeft: 12,
    color: '#d1d5db',
  },
});


export default EventDetailScreen;
