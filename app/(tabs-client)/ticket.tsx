import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as Calendar from 'expo-calendar';
import { captureRef } from 'react-native-view-shot';

// Couleur principale
const primaryColor = '#ec673b';

type Ticket = {
  id: string;
  eventId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  section: string;
  seat: string;
  price: string;
  status: 'active' | 'used' | 'expired';
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  qrCode: string;
  image: string;
  daysLeft: number;
  timeZone: string; 
};

const activeTickets: Ticket[] = [
  {
    id: '1',
    eventId: 'festival-chameau',
    title: 'Festival du Chameau',
    date: '2023-10-15T18:00:00',
    time: '18:00 - 22:00',
    location: 'Place de la Grande Mosquée, Nouakchott',
    section: 'Zone A',
    seat: 'Rang 12, Place 8',
    price: '2500 MRO',
    status: 'active',
    paymentStatus: 'confirmed',
    qrCode: 'FEST-CHAM-2023-12345',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    daysLeft: 3,
    timeZone: 'Africa/Nouakchott', // Ajout
  },
  {
    id: '2',
    eventId: 'concert-traditionnel',
    title: 'Concert Traditionnel',
    date: '2023-11-05T20:00:00',
    time: '20:00 - 23:00',
    location: 'Centre Culturel, Nouadhibou',
    section: 'VIP',
    seat: 'Rang 1, Place 4',
    price: '3500 MRO',
    status: 'active',
    paymentStatus: 'pending',
    qrCode: 'CONC-TRAD-2023-67890',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    daysLeft: 7,
    timeZone: 'Africa/Nouakchott', // Ajout
  },
  {
    id: '3',
    eventId: 'conference-tech',
    title: 'Conférence Tech',
    date: '2023-10-22T14:00:00',
    time: '14:00 - 17:00',
    location: 'Hôtel Salam, Nouakchott',
    section: 'Salle Principale',
    seat: 'Rang 3, Place 10',
    price: '1000 MRO',
    status: 'active',
    paymentStatus: 'pending',
    qrCode: 'CONF-TECH-2023-98765',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80',
    daysLeft: 1,
    timeZone: 'Africa/Nouakchott', // Ajout
  },
];

const expiredTickets: Ticket[] = [
  {
    id: '4',
    eventId: 'conference-tech',
    title: 'Conférence Tech',
    date: '2023-09-10T09:00:00',
    time: '09:00 - 12:00',
    location: 'Hôtel Salam, Nouakchott',
    section: 'Salle Principale',
    seat: 'Rang 3, Place 10',
    price: '1000 MRO',
    status: 'used',
    paymentStatus: 'confirmed',
    qrCode: 'CONF-TECH-2023-98765',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80',
    daysLeft: 0,
    timeZone: 'Africa/Nouakchott', // Ajout
  },
  {
    id: '5',
    eventId: 'match-foot',
    title: 'Match de Football',
    date: '2023-08-20T16:00:00',
    time: '16:00 - 18:00',
    location: 'Stade Olympique, Nouakchott',
    section: 'Tribune Nord',
    seat: 'Rang 5, Place 22',
    price: '2000 MRO',
    status: 'expired',
    paymentStatus: 'failed',
    qrCode: 'MATCH-FOOT-2023-45678',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    daysLeft: 0,
    timeZone: 'Africa/Nouakchott', // Ajout
  },
];

// Options de filtrage
const filterOptions = [
  { id: 'all', name: 'Tous les billets' },
  { id: 'pending', name: 'En attente' },
  { id: 'confirmed', name: 'Confirmés' },
  { id: 'failed', name: 'Échoués' },
];

export default function TicketsScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [isOrganizer] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const qrCodeRef = useRef<View>(null);

  // Filtrer les billets selon le statut de paiement
  const filterTickets = (tickets: Ticket[]) => {
    if (selectedFilter === 'all') return tickets;
    return tickets.filter(ticket => ticket.paymentStatus === selectedFilter);
  };

  const openModal = (ticket: Ticket) => {
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

  // Fonction améliorée pour ajouter à l'agenda
  const addToCalendar = async (ticket: Ticket) => {
    if (ticket.paymentStatus !== 'confirmed') {
      Alert.alert(
        'Action non disponible',
        'Cette fonctionnalité est disponible uniquement pour les billets confirmés.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Demander la permission
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status === 'granted') {
        // Récupérer les calendriers
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];

        if (defaultCalendar) {
          // Convertir la date du billet en objet Date
          const startDate = new Date(ticket.date);
          
          // Calculer la date de fin (4 heures par défaut)
          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + 4);
          
          // Créer l'événement
          await Calendar.createEventAsync(defaultCalendar.id, {
            title: ticket.title,
            startDate: startDate,
            endDate: endDate,
            timeZone: ticket.timeZone, // Utiliser le fuseau horaire du billet
            location: ticket.location,
            notes: `Billet: ${ticket.section}, ${ticket.seat}\n\nQR Code: ${ticket.qrCode}`,
          });
          
          Alert.alert('Agenda', 'Événement ajouté à votre agenda avec succès!');
        }
      } else {
        Alert.alert('Permission refusée', 'Veuillez autoriser l\'accès au calendrier dans les paramètres');
      }
    } catch (error) {
      console.error('Erreur d\'ajout à l\'agenda:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter à l\'agenda. Veuillez vérifier vos paramètres de calendrier.');
    }
  };

  const shareQRCode = async () => {
    if (!selectedTicket || !qrCodeRef.current || selectedTicket.paymentStatus !== 'confirmed') return;
    try {
      const uri = await captureRef(qrCodeRef.current, {
        format: 'png',
        quality: 1,
      });
      await Sharing.shareAsync(uri, {
        dialogTitle: `Partager le billet: ${selectedTicket.title}`,
        mimeType: 'image/png',
      });
    } catch {
      Alert.alert('Erreur', 'Impossible de partager le billet');
    }
  };

  const downloadPDF = (ticket: Ticket) => {
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

  const scanTicket = () => {
    Alert.alert('Scanner', 'Fonction de scan activée. Prêt à scanner un billet!');
  };

  const renderTicket = ({ item: ticket }: { item: Ticket }) => {
    const statusColors = {
      active: ['bg-[#ec673b]/20', 'text-[#ec673b]'],
      used: ['bg-blue-100/20', 'text-blue-400'],
      expired: ['bg-gray-300/20', 'text-gray-400'],
    };

    const paymentStatusColors = {
      pending: ['bg-yellow-500/20', 'text-yellow-500'],
      confirmed: ['bg-green-500/20', 'text-green-500'],
      failed: ['bg-red-500/20', 'text-red-500'],
    };

    return (
      <View className="bg-white/5 rounded-2xl mb-5 shadow-md shadow-black/50 overflow-hidden border-l-4 border-[#ec673b]">
        {/* Bandeau de statut de paiement */}
        {ticket.paymentStatus === 'pending' && (
          <View className="bg-yellow-500/20 py-2 px-4 flex-row items-center">
            <Ionicons name="time" size={16} color="#fbbf24" />
            <Text className="text-yellow-500 font-bold ml-2 text-sm">
              Paiement en attente de confirmation
            </Text>
          </View>
        )}
        
        <View className="flex-row p-4 border-b border-white/10">
          <Image source={{ uri: ticket.image }} className="w-16 h-16 rounded-xl" />
          <View className="flex-1 ml-4 justify-center">
            <Text className="text-white text-lg font-bold truncate">{ticket.title}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location" size={14} color={primaryColor} />
              <Text className="text-slate-300 text-xs ml-2 flex-shrink">{ticket.location}</Text>
            </View>
            <View className="flex-row items-center mt-1">
              <Ionicons name="calendar" size={14} color={primaryColor} />
              <Text className="text-slate-300 text-xs ml-2">{ticket.date.split('T')[0]} • {ticket.time}</Text>
            </View>
          </View>
          <View className="flex justify-center items-end">
            {ticket.status === 'active' && ticket.daysLeft > 0 && ticket.paymentStatus === 'confirmed' && (
              <View className="bg-[#ec673b]/20 rounded-full px-3 py-1 mb-2">
                <Text className="text-[#ec673b] font-semibold text-xs">
                  {ticket.daysLeft} jour{ticket.daysLeft > 1 ? 's' : ''}
                </Text>
              </View>
            )}
            <View className={`${statusColors[ticket.status][0]} rounded-full px-3 py-1 mb-1`}>
              <Text className={`${statusColors[ticket.status][1]} font-semibold text-xs`}>
                {ticket.status === 'active' ? 'Valide' : ticket.status === 'used' ? 'Utilisé' : 'Expiré'}
              </Text>
            </View>
            <View className={`${paymentStatusColors[ticket.paymentStatus][0]} rounded-full px-3 py-1`}>
              <Text className={`${paymentStatusColors[ticket.paymentStatus][1]} font-semibold text-xs`}>
                {ticket.paymentStatus === 'pending' ? 'En attente' : 
                 ticket.paymentStatus === 'confirmed' ? 'Confirmé' : 'Échoué'}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-around bg-white/5 py-4 px-6">
          <View className="items-center">
            <Text className="text-slate-400 uppercase text-[10px]">Section</Text>
            <Text className="text-white font-bold text-sm">{ticket.section}</Text>
          </View>
          <View className="items-center">
            <Text className="text-slate-400 uppercase text-[10px]">Place</Text>
            <Text className="text-white font-bold text-sm">{ticket.seat}</Text>
          </View>
          <View className="items-center">
            <Text className="text-slate-400 uppercase text-[10px]">Prix</Text>
            <Text className="text-white font-bold text-sm">{ticket.price}</Text>
          </View>
        </View>

        <View className="flex-row justify-around py-4 space-x-2">
          <TouchableOpacity
            className={`flex-1 items-center ${ticket.paymentStatus === 'confirmed' ? 'bg-[#ec673b]' : 'bg-gray-600'} rounded-xl py-3`}
            onPress={() => openModal(ticket)}
            activeOpacity={0.8}
            disabled={ticket.paymentStatus !== 'confirmed'}
          >
            <Ionicons 
              name="qr-code" 
              size={18} 
              color={ticket.paymentStatus === 'confirmed' ? "white" : "#9ca3af"} 
            />
            <Text className={`${ticket.paymentStatus === 'confirmed' ? 'text-white' : 'text-gray-400'} text-xs font-semibold mt-1`}>
              QR Code
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 items-center ${ticket.paymentStatus === 'confirmed' ? 'bg-[#ec673b]' : 'bg-gray-600'} rounded-xl py-3`}
            onPress={() => addToCalendar(ticket)}
            activeOpacity={0.8}
            disabled={ticket.paymentStatus !== 'confirmed'}
          >
            <Ionicons 
              name="calendar" 
              size={18} 
              color={ticket.paymentStatus === 'confirmed' ? "white" : "#9ca3af"} 
            />
            <Text className={`${ticket.paymentStatus === 'confirmed' ? 'text-white' : 'text-gray-400'} text-xs font-semibold mt-1`}>
              Agenda
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 items-center ${ticket.paymentStatus === 'confirmed' ? 'bg-[#ec673b]' : 'bg-gray-600'} rounded-xl py-3`}
            onPress={() => downloadPDF(ticket)}
            activeOpacity={0.8}
            disabled={ticket.paymentStatus !== 'confirmed'}
          >
            <Ionicons 
              name="download" 
              size={18} 
              color={ticket.paymentStatus === 'confirmed' ? "white" : "#9ca3af"} 
            />
            <Text className={`${ticket.paymentStatus === 'confirmed' ? 'text-white' : 'text-gray-400'} text-xs font-semibold mt-1`}>
              PDF
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <BackgroundWrapper>
      <View className="flex-1 px-4 pt-16">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-3xl font-bold">Mes billets</Text>
          <TouchableOpacity 
            className="p-2 rounded-full bg-white/10"
            onPress={() => setShowFilterModal(true)}
            accessibilityRole="button"
          >
            <Ionicons name="filter" size={24} color={primaryColor} />
          </TouchableOpacity>
        </View>
        <Text className="text-slate-400 mb-6">Gérez vos billets et accès aux événements</Text>

        {isOrganizer && (
          <TouchableOpacity
            className="flex-row bg-[#ec673b] py-3 rounded-xl justify-center items-center mb-6"
            onPress={scanTicket}
            activeOpacity={0.8}
          >
            <MaterialIcons name="qr-code-scanner" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-3">Scanner un billet</Text>
          </TouchableOpacity>
        )}

        <View className="flex-row bg-white/10 rounded-xl overflow-hidden mb-8">
          <TouchableOpacity
            className={`flex-1 py-3 items-center ${
              activeTab === 'active' ? 'bg-[#ec673b]' : ''
            }`}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.7}
          >
            <Text className={`font-semibold ${activeTab === 'active' ? 'text-white' : 'text-slate-300'}`}>
              Actifs ({filterTickets(activeTickets).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 items-center ${
              activeTab === 'expired' ? 'bg-[#ec673b]' : ''
            }`}
            onPress={() => setActiveTab('expired')}
            activeOpacity={0.7}
          >
            <Text className={`font-semibold ${activeTab === 'expired' ? 'text-white' : 'text-slate-300'}`}>
              Historique ({filterTickets(expiredTickets).length})
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={activeTab === 'active' ? filterTickets(activeTickets) : filterTickets(expiredTickets)}
          keyExtractor={(item) => item.id}
          renderItem={renderTicket}
          ListEmptyComponent={
            <View className="mt-20 items-center px-8">
              <Ionicons
                name={activeTab === 'active' ? 'ticket' : 'time'}
                size={48}
                color={primaryColor}
              />
              <Text className="text-white text-xl font-bold mt-5">
                {activeTab === 'active' ? 'Aucun billet actif' : 'Historique vide'}
              </Text>
              <Text className="text-slate-400 mt-3 text-center text-sm leading-5">
                {selectedFilter !== 'all'
                  ? `Aucun billet ${filterOptions.find(f => f.id === selectedFilter)?.name?.toLowerCase()}`
                  : activeTab === 'active'
                  ? "Vous n'avez pas de billets à venir. Parcourez les événements et réservez vos places!"
                  : "Vous n'avez encore assisté à aucun événement. Vos futurs billets apparaîtront ici après utilisation."}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />

        {/* Modal QR Code */}
        <Modal
          visible={qrModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View className="flex-1 bg-black bg-opacity-80 justify-center items-center px-5">
            <View className="bg-[#0f172a] rounded-3xl p-6 w-full max-w-md shadow-lg border-t-4 border-[#ec673b]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white font-bold text-xl flex-shrink">{selectedTicket?.title}</Text>
                <TouchableOpacity onPress={closeModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={28} color={primaryColor} />
                </TouchableOpacity>
              </View>

              <View ref={qrCodeRef} className="bg-[#001215] rounded-2xl self-center p-4 mb-8">
                {selectedTicket && (
                  <QRCode
                    value={selectedTicket.qrCode}
                    size={250}
                    backgroundColor="transparent"
                    color="#FFFFFF"
                  />
                )}
              </View>

              <View className="mb-8 space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 font-semibold">Section:</Text>
                  <Text className="text-white font-bold">{selectedTicket?.section}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 font-semibold">Place:</Text>
                  <Text className="text-white font-bold">{selectedTicket?.seat}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 font-semibold">Date:</Text>
                  <Text className="text-white font-bold">
                    {selectedTicket?.date.split('T')[0]} • {selectedTicket?.time}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between space-x-4">
                <TouchableOpacity
                  className="flex-row items-center border border-[#ec673b] rounded-xl px-6 py-3"
                  onPress={shareQRCode}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="share" size={20} color={primaryColor} />
                  <Text className="text-[#ec673b] font-bold text-base ml-3">Partager</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center bg-[#ec673b] rounded-xl px-6 py-3"
                  onPress={() => selectedTicket && addToCalendar(selectedTicket)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-3">Agenda</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal Filtres */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-end">
            <View className="bg-[#0f172a] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-2xl font-bold">Filtrer les billets</Text>
                <TouchableOpacity 
                  onPress={() => setShowFilterModal(false)} 
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={28} color={primaryColor} />
                </TouchableOpacity>
              </View>

              <View className="mb-6">
                <Text className="text-white font-bold text-lg mb-4">Statut de paiement</Text>
                <View className="flex-row flex-wrap">
                  {filterOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      className={`px-4 py-3 rounded-xl mr-3 mb-3 ${
                        selectedFilter === option.id ? 'bg-[#ec673b]' : 'bg-white/10'
                      }`}
                      onPress={() => setSelectedFilter(option.id)}
                    >
                      <Text className={selectedFilter === option.id ? 'text-gray-900 font-bold' : 'text-white'}>
                        {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                className="py-4 rounded-xl bg-[#ec673b] items-center"
                onPress={() => setShowFilterModal(false)}
              >
                <Text className="text-white font-bold text-lg">Appliquer les filtres</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </BackgroundWrapper>
  );
}