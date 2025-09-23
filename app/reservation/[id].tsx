import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Alert, Animated, SafeAreaView, ScrollView, Keyboard, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "https://eventick.onrender.com";

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  city: string;
  image: string | null;
}

interface TicketType {
  _id: string;
  type: string;
  price: number;
  description: string;
}

type PaymentMethod = 'bankily' | 'masrvi' | 'sedad' | 'bimbank';

const paymentMethodsData = [
  {
    id: 'bankily',
    name: 'Bankily',
    icon: 'phone-portrait-outline',
    requirements: "Paiement via l'application Bankily",
    image: require('@/assets/payment/bankily.png')
  },
  {
    id: 'masrvi',
    name: 'Masrvi',
    icon: 'phone-portrait-outline',
    requirements: "Paiement via l'application Masrvi",
    image: require('@/assets/payment/masrvi.png')
  },
  {
    id: 'bimbank',
    name: 'BimBank',
    icon: 'phone-portrait-outline',
    requirements: "Paiement via l'application BimBank",
    image: require('@/assets/payment/bimbank.png')
  }
];

const ReservationScreen = () => {
  const { id: eventId, ticketTypeId, quantity, price, eventTitle, eventDate } = useLocalSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bankily');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketType, setTicketType] = useState<TicketType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/events/${eventId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        setEvent(response.data);
        
        if (response.data.ticket && response.data.ticket.length > 0) {
          const selectedTicket = response.data.ticket.find((t: any) => t._id === ticketTypeId);
          if (selectedTicket) {
            setTicketType(selectedTicket);
          }
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        Alert.alert('Erreur', 'Impossible de charger les détails de l\'événement');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, ticketTypeId]);

  const totalPrice = ticketType ? (ticketType.price * Number(quantity)) : 0;

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      scrollToTop();
    } else if (currentStep === 2) {
      handlePayment();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handlePayment = async () => {
    if (!acceptedTerms) {
      Alert.alert('Erreur', 'Veuillez accepter les conditions générales');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté pour réserver');
        setIsProcessing(false);
        return;
      }

      const bookingData = {
        eventId,
        ticketTypeId,
        quantity: Number(quantity),
        paymentMethod,
      };

      const response = await axios.post(`${API_URL}/api/tickets/book`, bookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setConfirmationNumber(response.data.bookingRef || Date.now().toString());
        setIsProcessing(false);
        setIsPending(true);
      } else {
        throw new Error(response.data.message || 'Erreur lors de la réservation');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert(
        'Erreur de réservation', 
        error.response?.data?.message || error.message || 'Une erreur est survenue lors de la réservation'
      );
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ec673b" />
          <Text className="text-white mt-4">Chargement des détails...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  if (isPending) {
    return (
      <BackgroundWrapper>
        <SafeAreaView className="flex-1" edges={['top']}>
          <StatusBar style="light" />
          <View className="flex-1 items-center justify-center px-8">
            <View className="items-center">
              <View className="bg-white/10 rounded-full p-6 mb-8">
                <Ionicons name="time" size={64} color="#fff" />
              </View>
              <Text className="text-white text-3xl font-bold text-center mb-4">
                Paiement en attente
              </Text>
              <Text className="text-teal-400 text-xl text-center mb-8">
                Votre paiement pour "{event?.title}" est en cours de vérification.
              </Text>
              
              <View className="bg-white/10 rounded-xl p-6 w-full mb-8">
                <Text className="text-white font-bold text-center mb-3 text-lg">
                  Numéro de confirmation
                </Text>
                <Text className="text-teal-400 text-center text-2xl font-bold">
                  #{confirmationNumber}
                </Text>
              </View>
              
              <Text className="text-gray-400 text-center text-base mt-6">
                Merci pour votre patience. Votre réservation sera validée après vérification de votre paiement.
              </Text>
              
              <TouchableOpacity
                className="mt-8 bg-[#ec673b] py-4 px-8 rounded-full"
                onPress={() => router.replace('/tickets')}
              >
                <Text className="text-white font-bold text-lg">Voir mes billets</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1">
        <View className="flex-row justify-between items-center px-6 pt-6">
          <TouchableOpacity 
            onPress={prevStep}
            disabled={currentStep === 1}
            className={`p-3 rounded-full ${currentStep === 1 ? 'opacity-30' : 'bg-white/10'}`}
          >
            <Ionicons 
              name="arrow-back" 
              size={28} 
              color={currentStep === 1 ? "#9CA3AF" : "#68f2f4"} 
            />
          </TouchableOpacity>
          
          <Text className="text-white font-bold text-lg">
            Étape {currentStep}/2
          </Text>
          
          <View className="w-12" />
        </View>
        
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {currentStep === 1 && event && ticketType && (
            <>
              <Text className="text-white text-2xl font-bold mb-8 text-center">Récapitulatif</Text>
              
              <View className="bg-white/10 rounded-2xl p-6 mb-8">
                <Text className="text-white font-bold text-xl mb-4">Événement</Text>
                <View className="flex-row items-center mb-6">
                  {event.image ? (
                    <Image
                      source={{ uri: event.image }}
                      className="w-20 h-20 rounded-xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-20 h-20 rounded-xl bg-teal-400/20 items-center justify-center">
                      <Ionicons name="image-outline" size={30} color="#68f2f4" />
                    </View>
                  )}
                  <View className="ml-5 flex-1">
                    <Text className="text-white font-bold text-lg" numberOfLines={2}>{event.title}</Text>
                    <Text className="text-gray-400 text-base mt-2">{new Date(event.date).toLocaleDateString('fr-FR')}</Text>
                    <Text className="text-gray-400 text-base">{event.location}, {event.city}</Text>
                  </View>
                </View>

                <View className="border-t border-white/10 pt-5">
                  <View className="flex-row justify-between mb-4 py-2 border-b border-white/10">
                    <Text className="text-gray-400 text-base">Type de billet</Text>
                    <Text className="text-white text-base font-medium">{ticketType.type}</Text>
                  </View>
                  <View className="flex-row justify-between mb-4 py-2 border-b border-white/10">
                    <Text className="text-gray-400 text-base">Quantité</Text>
                    <Text className="text-white text-base font-medium">{quantity}</Text>
                  </View>
                  <View className="flex-row justify-between mb-4 py-2 border-b border-white/10">
                    <Text className="text-gray-400 text-base">Prix unitaire</Text>
                    <Text className="text-white text-base font-medium">{ticketType.price.toLocaleString()} MRO</Text>
                  </View>
                  <View className="flex-row justify-between mt-5 pt-5 border-t border-white/20">
                    <Text className="text-gray-400 font-bold text-lg">Total</Text>
                    <Text className="text-teal-400 font-bold text-xl">{totalPrice.toLocaleString()} MRO</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Text className="text-white text-2xl font-bold mb-8 text-center">Méthode de paiement</Text>
              
              <View className="mb-8">
                {paymentMethodsData.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    className={`p-5 rounded-2xl mb-4 flex-row items-center ${
                      paymentMethod === method.id 
                        ? 'bg-teal-400 border-2 border-teal-400' 
                        : 'bg-white/10 border border-white/10'
                    }`}
                    onPress={() => setPaymentMethod(method.id as PaymentMethod)}
                  >
                    <Image 
                      source={method.image} 
                      className="w-10 h-10" 
                    />
                    <View className="ml-4 flex-1">
                      <Text
                        className={`font-bold text-lg ${
                          paymentMethod === method.id 
                            ? 'text-gray-900' 
                            : 'text-white'
                        }`}
                      >
                        {method.name}
                      </Text>
                      <Text
                        className={`text-sm ${
                          paymentMethod === method.id 
                            ? 'text-gray-700' 
                            : 'text-gray-400'
                        }`}
                      >
                        {method.requirements}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View className="flex-row items-start mb-8">
                <TouchableOpacity 
                  className={`rounded-xl w-7 h-7 items-center justify-center mr-4 mt-1 ${
                    acceptedTerms ? 'bg-teal-400' : 'bg-white/10'
                  }`}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                >
                  {acceptedTerms && (
                    <Ionicons name="checkmark" size={20} color="#001215" />
                  )}
                </TouchableOpacity>
                <Text className="text-gray-400 flex-1 text-base">
                  J'accepte les conditions générales de vente et confirme que j'ai pris connaissance de la politique d'annulation et de remboursement.
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        <View className="p-6 bg-black/50 flex-row">
          {currentStep > 1 && (
            <TouchableOpacity
              className="py-5 rounded-xl items-center flex-1 mr-3 bg-white/10"
              onPress={prevStep}
            >
              <Text className="text-white font-bold text-base">Précédent</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            className={`py-5 rounded-xl items-center ${
              currentStep === 1 ? 'flex-1' : 'flex-1 ml-3'
            } ${isProcessing ? 'bg-gray-500' : 'bg-[#ec673b]'}`}
            onPress={nextStep}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                {currentStep === 2 ? 'Confirmer le paiement' : 'Continuer'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default ReservationScreen;