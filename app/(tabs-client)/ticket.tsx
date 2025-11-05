import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/BackgroundWrapper';

import { useTickets } from '@/hooks/useTickets';
import { useCalendar } from '@/hooks/useCalendar';
import { PRIMARY_COLOR } from '@/constants/tickets';

import EventGroup from '@/components/EventGroup';
import QRModal from '@/components/QRModal';
import FilterModal from '@/components/FilterModalTickets';
import EmptyState from '@/components/EmptyStateTickets';
import LoadingState from '@/components/LoadingState';

const TicketsScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedEvents, setExpandedEvents] = useState<{ [eventId: string]: boolean }>({});

  const { activeTickets, expiredTickets, loading, refreshing, handleRefresh } = useTickets();
  const { addToCalendar } = useCalendar();

  const isOrganizer = false;

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const handleTicketPress = (ticket: any) => {
    console.log('Ticket pressed:', ticket); // Debug log
    
    if (ticket.paymentStatus !== 'approved') {
      // Extraire le prix numérique du string
      const priceMatch = ticket.price.match(/(\d+)/);
      const numericPrice = priceMatch ? priceMatch[1] : '0';
      
      // Navigation vers l'écran de paiement en attente
      router.push({
        pathname: '/screens/PaymentPendingScreen',
        params: {
          bookingRef: ticket.bookingRef || 'unknown',
          eventTitle: ticket.title || 'Événement inconnu',
          totalPrice: numericPrice,
          totalTickets: '1'
        }
      });
      return;
    }
    setSelectedTicket(ticket);
    setQrModalVisible(true);
  };

  const handleRetryPayment = (bookingRef: string) => {
    console.log('Retry payment for:', bookingRef); // Debug log
    
    if (!bookingRef) {
      console.error('BookingRef is undefined in handleRetryPayment');
      Alert.alert('Erreur', 'Référence de réservation manquante');
      return;
    }

    // Trouver la réservation correspondante
    const allBookings = { ...activeTickets, ...expiredTickets };
    const bookingEntry = Object.entries(allBookings).find(([_, eventData]) => 
      eventData.bookingRef === bookingRef
    );
    
    if (bookingEntry) {
      const [_, eventData] = bookingEntry;
      router.push({
        pathname: '/screens/PaymentPendingScreen',
        params: {
          bookingRef: bookingRef,
          eventTitle: eventData.event.title,
          totalPrice: eventData.totalPrice.toString(),
          totalTickets: eventData.totalTickets.toString()
        }
      });
    } else {
      Alert.alert('Erreur', 'Réservation non trouvée');
    }
  };

  const closeModal = () => {
    setQrModalVisible(false);
    setSelectedTicket(null);
  };

  const scanTicket = () => {
    Alert.alert('Scanner', 'Fonction de scan activée. Prêt à scanner un billet!');
  };

  const activeEvents = Object.entries(activeTickets);
  const expiredEvents = Object.entries(expiredTickets);

  // Fonction pour générer une clé unique pour chaque EventGroup
  const getEventGroupKey = ([eventId, eventData]: [string, any]) => {
    return `${eventId}-${eventData.bookingRef || 'no-booking-ref'}`;
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <LoadingState />
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <View className="flex-1 px-4 pt-16">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-3xl font-bold">Mes billets</Text>
          <TouchableOpacity
            className="p-2 rounded-full bg-white/10"
            onPress={() => setShowFilterModal(true)}
            accessibilityRole="button"
          >
            <Ionicons name="filter" size={20} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>
        <Text className="text-slate-400 mb-4 text-sm">Gérez vos billets et accès aux événements</Text>

        {isOrganizer && (
          <TouchableOpacity
            className="flex-row bg-[#ec673b] py-2.5 rounded-xl justify-center items-center mb-4"
            onPress={scanTicket}
            activeOpacity={0.8}
          >
            <MaterialIcons name="qr-code-scanner" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">Scanner un billet</Text>
          </TouchableOpacity>
        )}

        <View className="flex-row bg-white/10 rounded-xl overflow-hidden mb-4">
          <TouchableOpacity
            className={`flex-1 py-2.5 items-center ${activeTab === 'active' ? 'bg-[#ec673b]' : ''}`}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.7}
          >
            <Text className={`font-semibold text-sm ${activeTab === 'active' ? 'text-white' : 'text-slate-300'}`}>
              Actifs ({activeEvents.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2.5 items-center ${activeTab === 'expired' ? 'bg-[#ec673b]' : ''}`}
            onPress={() => setActiveTab('expired')}
            activeOpacity={0.7}
          >
            <Text className={`font-semibold text-sm ${activeTab === 'expired' ? 'text-white' : 'text-slate-300'}`}>
              Historique ({expiredEvents.length})
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={activeTab === 'active' ? activeEvents : expiredEvents}
          keyExtractor={getEventGroupKey}
          renderItem={({ item }) => {
            const [eventId, eventData] = item;
            console.log('Rendering EventGroup:', eventId, eventData.bookingRef); // Debug log
            
            return (
              <EventGroup
                key={getEventGroupKey(item)}
                eventId={eventId}
                eventData={eventData}
                isActive={activeTab === 'active'}
                isExpanded={!!expandedEvents[eventId]}
                onToggleExpand={toggleEventExpansion}
                onTicketPress={handleTicketPress}
                onRetryPayment={handleRetryPayment}
              />
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={PRIMARY_COLOR}
            />
          }
          ListEmptyComponent={<EmptyState activeTab={activeTab} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <QRModal
          visible={qrModalVisible}
          ticket={selectedTicket}
          onClose={closeModal}
          onAddToCalendar={addToCalendar}
        />

        <FilterModal
          visible={showFilterModal}
          selectedFilter={selectedFilter}
          onFilterSelect={setSelectedFilter}
          onClose={() => setShowFilterModal(false)}
        />
      </View>
    </BackgroundWrapper>
  );
};

export default TicketsScreen;