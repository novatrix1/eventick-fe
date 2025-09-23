import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FormattedTicket } from '../types';
import { formatEventDate } from '../utils/dateFormatter';
import { PRIMARY_COLOR } from '../constants/tickets';

interface EventGroupProps {
    eventId: string;
    eventData: {
        event: any;
        tickets: FormattedTicket[];
        totalTickets: number;
        totalPrice: number;
        paymentStatus: string;
    };
    isActive: boolean;
    isExpanded: boolean;
    onToggleExpand: (eventId: string) => void;
    onTicketPress: (ticket: FormattedTicket) => void;
}

const EventGroup: React.FC<EventGroupProps> = ({
    eventId,
    eventData,
    isActive,
    isExpanded,
    onToggleExpand,
    onTicketPress
}) => {
    const formattedDate = formatEventDate(eventData.event.date);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return { bg: 'bg-green-500/20', text: 'text-green-400' };
            case 'pending': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
            case 'failed': return { bg: 'bg-red-500/20', text: 'text-red-400' };
            default: return { bg: 'bg-gray-500/20', text: 'text-gray-400' };
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Confirmé';
            case 'pending': return 'En attente';
            case 'failed': return 'Échoué';
            default: return status;
        }
    };

    const statusColors = getStatusColor(eventData.paymentStatus);
    const statusText = getStatusText(eventData.paymentStatus);

    return (
        <View className="mb-4 rounded-2xl overflow-hidden">
            <LinearGradient
                colors={['#1a202c', '#2d3748']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl overflow-hidden"
            >
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
                            <View className={`rounded-full px-2 py-1 mb-1 ${statusColors.bg}`}>
                                <Text className={`text-xs font-semibold ${statusColors.text}`}>
                                    {statusText}
                                </Text>
                            </View>

                            <View className="flex-row items-center">
                                <Ionicons name="ticket-outline" size={12} color={PRIMARY_COLOR} />
                                <Text className="text-slate-300 text-xs ml-1">
                                    {eventData.totalTickets} billet{eventData.totalTickets > 1 ? 's' : ''}
                                </Text>
                            </View>

                            <Ionicons
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                size={16}
                                color={PRIMARY_COLOR}
                                className="mt-1"
                            />
                        </View>
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View className="bg-[#1a202c] p-4 border-t border-white/10">
                        <Text className="text-white font-semibold mb-3 text-sm">VOS BILLETS</Text>

                        {eventData.tickets.map((ticket, index) => (
                            <View
                                key={`${ticket.id}-${index}`}
                                className={`bg-white/5 rounded-lg p-3 mb-2 ${index === eventData.tickets.length - 1 ? 'mb-0' : ''}`}
                            >
                                <View className="flex-row justify-between items-center">
                                    <View>
                                        <Text className="text-white font-medium text-sm">
                                            {ticket.ticketType} #{ticket.ticketNumber}
                                        </Text>
                                        <Text className="text-slate-400 text-xs mt-1">{ticket.price}</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => onTicketPress(ticket)}
                                        disabled={ticket.paymentStatus !== 'confirmed'}
                                        className={`px-3 py-1.5 rounded-md ${ticket.paymentStatus === 'confirmed' ? 'bg-[#ec673b]' : 'bg-gray-600'
                                            }`}
                                    >
                                        <Text className={`text-xs font-semibold ${ticket.paymentStatus === 'confirmed' ? 'text-white' : 'text-gray-400'
                                            }`}>
                                            QR Code
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </LinearGradient>
        </View>
    );
};

export default EventGroup;