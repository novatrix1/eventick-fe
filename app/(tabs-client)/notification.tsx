import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, FlatList, Modal, SafeAreaView } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';

// Couleur principale
const primaryColor = '#ec673b';

// 🔔 Types de notifications
type Notification = {
    id: string;
    type: 'event' | 'promotion' | 'reminder' | 'payment';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    category?: string;
    eventId?: string;
    amount?: string;
};

// ⚙️ Paramètres de notification
type NotificationSettings = {
    pushEnabled: boolean;
    categories: {
        concerts: boolean;
        religion: boolean;
        sport: boolean;
        culture: boolean;
        business: boolean;
    };
};

// 🔔 Données de démonstration
const notificationsData: Notification[] = [
    {
        id: '1',
        type: 'event',
        title: 'Nouveau concert traditionnel',
        message: 'Un concert exclusif avec les meilleurs artistes mauritaniens vient d\'être ajouté',
        timestamp: 'Il y a 2 heures',
        read: false,
        category: 'concerts',
        eventId: 'concert-traditionnel'
    },
    {
        id: '2',
        type: 'promotion',
        title: 'Réduction spéciale - Festival du Chameau',
        message: 'Profitez de 20% de réduction sur les billets pour le Festival du Chameau',
        timestamp: 'Il y a 1 jour',
        read: false,
        eventId: 'festival-chameau'
    },
    {
        id: '3',
        type: 'reminder',
        title: 'Votre événement approche',
        message: 'Le Festival des Dattes commence dans 3 jours! Préparez-vous',
        timestamp: 'Il y a 1 jour',
        read: true,
        eventId: 'festival-dattes'
    },
    {
        id: '4',
        type: 'payment',
        title: 'Paiement confirmé',
        message: 'Votre paiement de 2500 MRO pour le Concert Traditionnel a été accepté',
        timestamp: 'Il y a 2 jours',
        read: true,
        amount: '2500 MRO',
        eventId: 'concert-traditionnel'
    },
    {
        id: '5',
        type: 'event',
        title: 'Conférence sur l\'entrepreneuriat',
        message: 'Découvrez les opportunités d\'affaires en Mauritanie avec des experts locaux',
        timestamp: 'Il y a 3 jours',
        read: true,
        category: 'business',
        eventId: 'conference-entrepreneuriat'
    },
    {
        id: '6',
        type: 'reminder',
        title: 'Événement à proximité',
        message: 'Un festival culturel se déroule près de vous à Nouakchott',
        timestamp: 'Il y a 5 jours',
        read: true,
        eventId: 'festival-culturel'
    }
];

// 🏷️ Catégories pour les paramètres
const notificationCategories = [
    { id: 'concerts', name: 'Concerts', icon: 'musical-notes' },
    { id: 'religion', name: 'Religion', icon: 'star' },
    { id: 'sport', name: 'Sport', icon: 'football' },
    { id: 'culture', name: 'Culture', icon: 'color-palette' },
    { id: 'business', name: 'Business', icon: 'briefcase' },
];

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
    const [settings, setSettings] = useState<NotificationSettings>({
        pushEnabled: true,
        categories: {
            concerts: true,
            religion: true,
            sport: true,
            culture: true,
            business: true
        }
    });
    const [showSettings, setShowSettings] = useState(false);

    // Marquer une notification comme lue
    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    // Marquer toutes comme lues
    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    // Gérer le changement des paramètres
    const handleCategoryToggle = (category: keyof NotificationSettings['categories']) => {
        setSettings(prev => ({
            ...prev,
            categories: {
                ...prev.categories,
                [category]: !prev.categories[category]
            }
        }));
    };

    // Rendu d'une notification
    const renderNotification = ({ item }: { item: Notification }) => {
        // Icônes selon le type de notification
        let iconName = 'notifications';
        let iconColor = primaryColor;

        switch (item.type) {
            case 'promotion':
                iconName = 'pricetag';
                iconColor = '#FFD700'; // Or
                break;
            case 'reminder':
                iconName = 'alarm';
                iconColor = '#FF6347'; // Rouge corail
                break;
            case 'payment':
                iconName = 'checkmark-circle';
                iconColor = '#32CD32'; // Vert lime
                break;
        }

        return (
            <TouchableOpacity
                className={`p-4 border-b border-white/10 ${!item.read ? 'bg-[#ec673b]/10' : ''}`}
                onPress={() => markAsRead(item.id)}
            >
                <View className="flex-row">
                    {/* Icône de notification */}
                    <View className="mr-3">
                        <Ionicons name={iconName} size={24} color={iconColor} />
                        {!item.read && (
                            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                        )}
                    </View>

                    {/* Contenu de la notification */}
                    <View className="flex-1">
                        <Text className={`font-bold text-lg ${!item.read ? 'text-white' : 'text-gray-400'}`}>
                            {item.title}
                        </Text>
                        <Text className={`mt-1 ${!item.read ? 'text-gray-300' : 'text-gray-500'}`}>
                            {item.message}
                        </Text>

                        {/* Informations supplémentaires */}
                        {item.type === 'payment' && (
                            <View className="flex-row items-center mt-2">
                                <Ionicons name="cash" size={14} color={primaryColor} />
                                <Text className="text-gray-500 text-xs ml-1">
                                    Montant: {item.amount}
                                </Text>
                            </View>
                        )}

                        <Text className="text-gray-500 text-xs mt-2">
                            {item.timestamp}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <BackgroundWrapper>
            <SafeAreaView className="flex-1" edges={['top']}>
                <StatusBar style="light" />
                <ScrollView
                    className="flex-1 px-4 pt-4 pb-32"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80 }}
                >
                    {/* En-tête */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-white text-3xl font-bold">Notifications</Text>
                            <Text className="text-slate-400">Restez informé de vos activités</Text>
                        </View>
                        <View className="flex-row">
                            <TouchableOpacity
                                className="p-2 bg-white/10 rounded-full mr-2"
                                onPress={markAllAsRead}
                            >
                                <MaterialIcons name="mark-email-read" size={20} color={primaryColor} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="p-2 bg-white/10 rounded-full"
                                onPress={() => setShowSettings(true)}
                            >
                                <Ionicons name="settings" size={20} color={primaryColor} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Liste des notifications */}
                    {notifications.length > 0 ? (
                        <View className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                            <FlatList
                                data={notifications}
                                renderItem={renderNotification}
                                keyExtractor={item => item.id}
                                scrollEnabled={false}
                            />
                        </View>
                    ) : (
                        <View className="bg-white/10 rounded-2xl p-8 items-center border border-white/10">
                            <Ionicons name="notifications-off" size={48} color={primaryColor} />
                            <Text className="text-white font-bold text-xl mt-4">
                                Aucune notification
                            </Text>
                            <Text className="text-gray-400 text-center mt-2">
                                Vous n'avez pas de nouvelles notifications pour le moment
                            </Text>
                        </View>
                    )}

                    {/* Section d'information */}
                    <View className="bg-[#ec673b]/10 rounded-xl p-4 mt-6 border border-[#ec673b]/20">
                        <View className="flex-row items-start">
                            <Ionicons name="information-circle" size={24} color={primaryColor} />
                            <Text className="text-gray-300 ml-2 flex-1">
                                Les notifications vous informent en temps réel des nouveaux événements, 
                                promotions et rappels importants. Vous pouvez personnaliser les préférences ci-dessous.
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Modal Paramètres des notifications */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showSettings}
                    onRequestClose={() => setShowSettings(false)}
                >
                    <View className="flex-1 bg-black/70 justify-end">
                        <View className="bg-[#0f172a] rounded-t-3xl p-6 max-h-[85%] border-t-4 border-[#ec673b]">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-white text-xl font-bold">Paramètres des notifications</Text>
                                <TouchableOpacity onPress={() => setShowSettings(false)}>
                                    <Ionicons name="close" size={24} color={primaryColor} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="pb-4">
                                {/* Activation des notifications push */}
                                <View className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                                    <View className="flex-row justify-between items-center">
                                        <View>
                                            <Text className="text-white font-bold text-lg">Notifications Push</Text>
                                            <Text className="text-gray-400 text-sm mt-1">
                                                Recevez des notifications sur votre téléphone
                                            </Text>
                                        </View>
                                        <Switch
                                            value={settings.pushEnabled}
                                            onValueChange={() => setSettings(prev => ({
                                                ...prev,
                                                pushEnabled: !prev.pushEnabled
                                            }))}
                                            trackColor={{ false: '#767577', true: primaryColor }}
                                            thumbColor={settings.pushEnabled ? '#001215' : '#f4f3f4'}
                                        />
                                    </View>

                                    {/* Catégories */}
                                    {settings.pushEnabled && (
                                        <View className="mt-4">
                                            <Text className="text-white font-bold mb-3 text-lg">Catégories à suivre</Text>
                                            <View>
                                                {notificationCategories.map(category => (
                                                    <View
                                                        key={category.id}
                                                        className="flex-row justify-between items-center py-3 border-b border-white/10"
                                                    >
                                                        <View className="flex-row items-center">
                                                            <Ionicons
                                                                name={category.icon as any}
                                                                size={20}
                                                                color={primaryColor}
                                                                className="mr-3"
                                                            />
                                                            <Text className="text-white">{category.name}</Text>
                                                        </View>
                                                        <Switch
                                                            value={settings.categories[category.id as keyof NotificationSettings['categories']]}
                                                            onValueChange={() => handleCategoryToggle(category.id as keyof NotificationSettings['categories'])}
                                                            trackColor={{ false: '#767577', true: primaryColor }}
                                                            thumbColor={settings.categories[category.id as keyof NotificationSettings['categories']] ? '#001215' : '#f4f3f4'}
                                                        />
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* Types de notifications */}
                                <View className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <Text className="text-white font-bold mb-3 text-lg">Types de notifications</Text>

                                    <View className="flex-row items-center py-3 border-b border-white/10">
                                        <MaterialIcons name="event" size={24} color={primaryColor} className="mr-3" />
                                        <Text className="text-white flex-1">Nouveaux événements</Text>
                                        <Ionicons name="checkmark" size={24} color={primaryColor} />
                                    </View>

                                    <View className="flex-row items-center py-3 border-b border-white/10">
                                        <MaterialIcons name="local-offer" size={24} color="#FFD700" className="mr-3" />
                                        <Text className="text-white flex-1">Promotions spéciales</Text>
                                        <Ionicons name="checkmark" size={24} color={primaryColor} />
                                    </View>

                                    <View className="flex-row items-center py-3 border-b border-white/10">
                                        <MaterialIcons name="notifications-active" size={24} color="#FF6347" className="mr-3" />
                                        <Text className="text-white flex-1">Rappels d'événements</Text>
                                        <Ionicons name="checkmark" size={24} color={primaryColor} />
                                    </View>

                                    <View className="flex-row items-center py-3">
                                        <MaterialCommunityIcons name="cash" size={24} color="#32CD32" className="mr-3" />
                                        <Text className="text-white flex-1">Confirmations de paiement</Text>
                                        <Ionicons name="checkmark" size={24} color={primaryColor} />
                                    </View>
                                </View>
                            </ScrollView>

                            <TouchableOpacity
                                className="py-3 px-6 rounded-xl mt-6 items-center"
                                style={{ backgroundColor: primaryColor }}
                                onPress={() => setShowSettings(false)}
                            >
                                <Text className="text-white font-bold text-lg">Enregistrer les paramètres</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </BackgroundWrapper>
    );
};

export default NotificationsScreen;