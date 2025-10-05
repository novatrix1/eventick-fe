import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedEvents, setExpandedEvents] = useState<{ [eventId: string]: boolean }>({});

  const { activeTickets, expiredTickets, loading, refreshing, handleRefresh } = useTickets();
  const { addToCalendar } = useCalendar();

  const isOrganizer = true;

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const openModal = (ticket: any) => {
    if (ticket.paymentStatus !== 'confirmed') {
      Alert.alert(
        'Paiement en attente',
        'Votre billet sera activé après confirmation manuelle du paiement par notre équipe.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedTicket(ticket);
    setQrModalVisible(true);
  };

  const closeModal = () => {
    setQrModalVisible(false);
    setSelectedTicket(null);
  };

  const scanTicket = () => {
    Alert.alert('Scanner', 'Fonction de scan activée. Prêt à scanner un billet!');
  };

  const downloadPDF = (ticket: any) => {
    if (ticket.paymentStatus !== 'confirmed') {
      Alert.alert(
        'Action non disponible',
        'Le téléchargement est disponible uniquement pour les billets confirmés.',
        [{ text: 'OK' }]
      );
      return;
    }
    Alert.alert('Téléchargement', `Téléchargement du billet pour ${ticket.title} en cours...`);
  };

  const activeEvents = Object.entries(activeTickets);
  const expiredEvents = Object.entries(expiredTickets);

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
            className={`flex-1 py-2.5 items-center ${activeTab === 'active' ? 'bg-[#ec673b]' : ''
              }`}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.7}
          >
            <Text className={`font-semibold text-sm ${activeTab === 'active' ? 'text-white' : 'text-slate-300'}`}>
              Actifs ({activeEvents.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2.5 items-center ${activeTab === 'expired' ? 'bg-[#ec673b]' : ''
              }`}
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
          keyExtractor={([eventId]) => eventId} 
          renderItem={({ item: [eventId, eventData] }) => (
            <EventGroup
              key={eventId} 
              eventId={eventId}
              eventData={eventData}
              isActive={activeTab === 'active'}
              isExpanded={!!expandedEvents[eventId]}
              onToggleExpand={toggleEventExpansion}
              onTicketPress={openModal}

            />
          )}
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