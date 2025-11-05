import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const PaymentPendingScreen: React.FC = () => {
    const params = useLocalSearchParams();

    const {
        bookingRef = '',
        eventTitle = 'Événement',
        totalPrice = '0',
        totalTickets = '0'
    } = params;

    console.log("les données récupérées du paiement : ", bookingRef, eventTitle, totalPrice, totalTickets);

    useEffect(() => {
        // Debug: Afficher tous les paramètres reçus
        console.log("Tous les paramètres reçus:", params);
    }, [params]);

    const handleRetryPayment = () => {
        // Logique pour retenter le paiement
        console.log('Retry payment for:', bookingRef);
        // Ici vous pouvez intégrer votre logique de paiement
        // Pour l'exemple, nous simulons une navigation vers l'écran de paiement

    };

    const handleGoHome = () => {
        router.back();
    };

    const handleContactSupport = () => {
        console.log('Contact support');
    };

    const numericPrice = parseInt(totalPrice as string) || 0;
    const numericTickets = parseInt(totalTickets as string) || 0;

    return (
        <View className="flex-1 bg-[#0f172a]">
            <StatusBar style="light" />

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <View className="items-center py-11">
                    <View className="bg-yellow-500/20 rounded-full p-6 mb-4">
                        <Ionicons name="time-outline" size={56} color="#eab308" />
                    </View>
                    <Text className="text-white text-2xl font-bold mb-2 text-center">
                        Paiement en attente
                    </Text>
                    <Text className="text-slate-400 text-center text-base px-4">
                        Votre commande est en cours de traitement
                    </Text>
                </View>

                {/* Détails de la commande */}
                <View className="bg-blue-500/10 rounded-xl p-4 mb-6 border border-blue-500/20">

                    <Text className="text-white font-bold text-lg mb-4">Détails de la commande</Text>

                    <View className="space-y-4">
                        <View className="flex-row justify-between">
                            <Text className="text-slate-400">Événement</Text>
                            <Text className="text-white font-medium text-right flex-1 ml-4">
                                {eventTitle as string}
                            </Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className="text-slate-400">Référence</Text>
                            <Text className="text-white font-medium">{bookingRef as string}</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className="text-slate-400">Nombre de billets</Text>
                            <Text className="text-white font-medium">{numericTickets}</Text>
                        </View>

                        <View className="h-px bg-slate-600 my-2" />

                        <View className="flex-row justify-between">
                            <Text className="text-slate-400 text-lg">Montant total</Text>
                            <Text className="text-white font-bold text-xl">
                                {numericPrice.toLocaleString()} FCFA
                            </Text>
                        </View>
                    </View>
                </View>
                {/* Instructions */}
                <View className="bg-blue-500/10 rounded-xl p-4 mb-6 border border-blue-500/20">
                    <View className="flex-row items-start mb-3">
                        <Ionicons name="information-circle" size={20} color="#3b82f6" />
                        <Text className="text-blue-400 font-semibold text-sm ml-2 flex-1">
                            Prochaines étapes
                        </Text>
                    </View>
                    <View className="space-y-2">
                        <Text className="text-slate-300 text-sm leading-5">
                            • Votre paiement est en cours de vérification
                        </Text>
                        <Text className="text-slate-300 text-sm leading-5">
                            • Les billets seront activés sous 24 heures
                        </Text>
                        <Text className="text-slate-300 text-sm leading-5">
                            • Vous recevrez une notification de confirmation
                        </Text>
                        <Text className="text-slate-300 text-sm leading-5">
                            • En cas de problème, contactez le support
                        </Text>
                    </View>
                </View>

                {/* Statut de traitement */}
                <View className="bg-slate-800 rounded-xl p-5 mb-6">
                    <Text className="text-white font-semibold mb-4 text-lg">Statut du traitement</Text>
                    <View className="space-y-5">
                        <View className="flex-row items-center">
                            <View className="bg-green-500 rounded-full p-2 mr-4">
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white text-base font-medium">Commande créée</Text>
                                <Text className="text-slate-400 text-sm">Votre réservation a été enregistrée</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <View className="bg-yellow-500 rounded-full p-2 mr-4">
                                <Ionicons name="time" size={16} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white text-base font-medium">Vérification du paiement</Text>
                                <Text className="text-slate-400 text-sm">En attente de confirmation</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <View className="bg-slate-600 rounded-full p-2 mr-4">
                                <Ionicons name="ticket-outline" size={16} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-400 text-base">Billets délivrés</Text>
                                <Text className="text-slate-500 text-sm">Billets disponibles après confirmation</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Support */}
                <TouchableOpacity
                    onPress={handleContactSupport}
                    className="bg-slate-800 rounded-xl p-4 mb-8 flex-row items-center"
                >
                    <Ionicons name="headset-outline" size={24} color="#3b82f6" />
                    <View className="ml-3 flex-1">
                        <Text className="text-white font-medium">Besoin d'aide ?</Text>
                        <Text className="text-slate-400 text-sm">Contactez notre support client</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#64748b" />
                </TouchableOpacity>
            </ScrollView>

            {/* Actions fixes en bas */}
            <View className="p-5 border-t border-slate-700 bg-[#0f172a]">
                <TouchableOpacity
                    onPress={handleRetryPayment}
                    className="bg-yellow-500 rounded-xl py-4 mb-3 flex-row justify-center items-center"
                    activeOpacity={0.8}
                >
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Vérifier le statut</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleGoHome}
                    className="bg-slate-700 rounded-xl py-4 flex-row justify-center items-center"
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-semibold text-lg">Retour aux billets</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PaymentPendingScreen;