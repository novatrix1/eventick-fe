import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FormattedTicket } from '../types';
import { formatEventDate } from '../utils/dateFormatter';
import { PRIMARY_COLOR, SUCCESS_COLOR, WARNING_COLOR, ERROR_COLOR } from '../constants/tickets';

interface EventGroupProps {
    eventId: string;
    eventData: {
        event: any;
        tickets: FormattedTicket[];
        totalTickets: number;
        totalPrice: number;
        paymentStatus: string;
        bookingRef: string;
    };
    isActive: boolean;
    isExpanded: boolean;
    onToggleExpand: (eventId: string) => void;
    onTicketPress: (ticket: FormattedTicket) => void;
    onRetryPayment?: (bookingRef: string) => void;
}

const EventGroup: React.FC<EventGroupProps> = ({
    eventId,
    eventData,
    isActive,
    isExpanded,
    onToggleExpand,
    onTicketPress,
    onRetryPayment
}) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const formattedDate = formatEventDate(eventData.event.date);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    bg: 'bg-green-500/20',
                    text: 'text-green-400',
                    icon: 'checkmark-circle',
                    label: 'Confirmé',
                    description: 'Paiement confirmé'
                };
            case 'pending':
                return {
                    bg: 'bg-yellow-500/20',
                    text: 'text-yellow-400',
                    icon: 'time-outline',
                    label: 'En attente de paiement',
                    description: 'En attente de confirmation'
                };
            case 'rejected':
                return {
                    bg: 'bg-red-500/20',
                    text: 'text-red-400',
                    icon: 'close-circle',
                    label: 'Paiement échoué',
                    description: 'Veuillez réessayer'
                };
            default:
                return {
                    bg: 'bg-gray-500/20',
                    text: 'text-gray-400',
                    icon: 'help-circle',
                    label: status,
                    description: 'Statut inconnu'
                };
        }
    };

    const statusConfig = getStatusConfig(eventData.paymentStatus);
    const confirmedTickets = eventData.tickets.filter(ticket => ticket.paymentStatus === 'approved');
    const pendingTickets = eventData.tickets.filter(ticket => ticket.paymentStatus === 'pending');

    // Fonction pour générer une clé unique pour chaque ticket
    const getTicketKey = (ticket: FormattedTicket) => {
        return `${ticket.id}-${ticket.ticketRef}-${ticket.ticketNumber}`;
    };

    const handleRetryPaymentPress = () => {
        console.log('Retry payment pressed with bookingRef:', eventData.bookingRef); // Debug log
        if (onRetryPayment && eventData.bookingRef) {
            onRetryPayment(eventData.bookingRef);
        } else {
            console.error('Cannot retry payment: bookingRef is undefined or onRetryPayment is not provided');
        }
    };

    return (
        <Animated.View style={{ opacity: fadeAnim }} className="mb-4 rounded-2xl overflow-hidden">
            <LinearGradient
                colors={['#1a202c', '#2d3748']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl overflow-hidden"
            >
                {/* En-tête de l'événement */}
                <TouchableOpacity
                    onPress={() => onToggleExpand(eventId)}
                    activeOpacity={0.9}
                    className="p-4"
                >
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 mr-2">
                            <Text className="text-white text-lg font-bold mb-1">{eventData.event.title}</Text>
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="location-outline" size={14} color={PRIMARY_COLOR} />
                                <Text className="text-slate-300 text-xs ml-1">{eventData.event.location}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="calendar-outline" size={14} color={PRIMARY_COLOR} />
                                <Text className="text-slate-300 text-xs ml-1">{formattedDate} • {eventData.event.time}</Text>
                            </View>
                        </View>

                        <View className="items-end">
                            <View className={`rounded-full px-3 py-1.5 mb-2 flex-row items-center ${statusConfig.bg}`}>
                                <Ionicons 
                                    name={statusConfig.icon as any} 
                                    size={14} 
                                    color={statusConfig.text.includes('green') ? SUCCESS_COLOR : statusConfig.text.includes('yellow') ? WARNING_COLOR : ERROR_COLOR} 
                                />
                                <Text className={`text-xs font-semibold ml-1 ${statusConfig.text}`}>
                                    {statusConfig.label}
                                </Text>
                            </View>

                            <View className="flex-row items-center mb-1">
                                <Ionicons name="ticket-outline" size={12} color={PRIMARY_COLOR} />
                                <Text className="text-slate-300 text-xs ml-1">
                                    {eventData.totalTickets} billet{eventData.totalTickets > 1 ? 's' : ''}
                                </Text>
                            </View>

                            <Ionicons
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                size={16}
                                color={PRIMARY_COLOR}
                            />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Section développée */}
                {isExpanded && (
                    <View className="bg-[#1a202c] p-4 border-t border-white/10">
                        {/* Résumé du statut */}
                        <View className="bg-black/20 rounded-xl p-3 mb-4">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-white font-semibold text-sm">Résumé de la commande</Text>
                                <Text className="text-white font-bold">{eventData.totalPrice} MRO</Text>
                            </View>
                            <Text className="text-slate-400 text-xs mb-3">{statusConfig.description}</Text>
                            
                            {eventData.paymentStatus === 'pending' && onRetryPayment && (
                                <TouchableOpacity
                                    onPress={handleRetryPaymentPress}
                                    className="bg-yellow-500 rounded-lg py-2 px-4 flex-row justify-center items-center"
                                >
                                    <Ionicons name="refresh" size={16} color="white" />
                                    <Text className="text-white font-semibold text-sm ml-2">Compléter le paiement</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Billets confirmés */}
                        {confirmedTickets.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-white font-semibold mb-3 text-sm flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={16} color={SUCCESS_COLOR} />
                                    <Text className="ml-1">BILLETS CONFIRMÉS ({confirmedTickets.length})</Text>
                                </Text>
                                {confirmedTickets.map((ticket, index) => (
                                    <TicketCard 
                                        key={getTicketKey(ticket)}
                                        ticket={ticket}
                                        onPress={onTicketPress}
                                        isLast={index === confirmedTickets.length - 1}
                                        isConfirmed={true}
                                    />
                                ))}
                            </View>
                        )}

                        {/* Billets en attente */}
                        {pendingTickets.length > 0 && (
                            <View>
                                <Text className="text-white font-semibold mb-3 text-sm flex-row items-center">
                                    <Ionicons name="time-outline" size={16} color={WARNING_COLOR} />
                                    <Text className="ml-1">EN ATTENTE DE PAIEMENT ({pendingTickets.length})</Text>
                                </Text>
                                {pendingTickets.map((ticket, index) => (
                                    <TicketCard 
                                        key={getTicketKey(ticket)}
                                        ticket={ticket}
                                        onPress={onTicketPress}
                                        isLast={index === pendingTickets.length - 1}
                                        isConfirmed={false}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </LinearGradient>
        </Animated.View>
    );
};

const TicketCard: React.FC<{
    ticket: FormattedTicket;
    onPress: (ticket: FormattedTicket) => void;
    isLast: boolean;
    isConfirmed: boolean;
}> = ({ ticket, onPress, isLast, isConfirmed }) => (
    <View className={`${isConfirmed ? 'bg-green-500/10 border-l-4 border-green-500' : 'bg-yellow-500/10 border-l-4 border-yellow-500'} rounded-lg p-3 mb-2 ${isLast ? 'mb-0' : ''}`}>
        <View className="flex-row justify-between items-center">
            <View className="flex-1">
                <View className="flex-row items-center flex-wrap">
                    <Text className="text-white font-medium text-sm">
                        {ticket.ticketType} #{ticket.ticketNumber}
                    </Text>
                    <View className={`rounded-full px-2 py-1 ml-2 ${isConfirmed ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                        <Text className={`text-xs font-semibold ${isConfirmed ? 'text-green-400' : 'text-yellow-400'}`}>
                            {isConfirmed ? 'Prêt à scanner' : 'En attente'}
                        </Text>
                    </View>
                </View>
                <Text className="text-slate-400 text-xs mt-1">{ticket.price}</Text>
            </View>

            <TouchableOpacity
                onPress={() => onPress(ticket)}
                disabled={!isConfirmed}
                className={`px-4 py-2 rounded-md ${isConfirmed ? 'bg-[#ec673b]' : 'bg-gray-600'}`}
            >
                <Text className={`text-xs font-semibold ${isConfirmed ? 'text-white' : 'text-gray-400'}`}>
                    {isConfirmed ? 'QR Code' : 'Indisponible'}
                </Text>
            </TouchableOpacity>
        </View>
    </View>
);

export default EventGroup;