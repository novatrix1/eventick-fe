import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Alert, Animated, SafeAreaView, ScrollView, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

// Types
type Event = {
    id: string;
    title: string;
    date: string;
    location: string;
    price: string;
    image: string;
};

type TicketType = {
    id: string;
    name: string;
    price: number;
};

type PaymentMethod = 'bankily' | 'masrvi' | 'sedad' | 'bimbank';

type PaymentDetails = {
    firstName: string;
    lastName: string;
    transactionRef: string;
    screenshot: string | null;
};

// Données des méthodes de paiement
const paymentMethodsData = [
    {
        id: 'bankily',
        name: 'Bankily',
        icon: require('@/assets/payment/bankily.png'),
        requirements: "Effectuez le paiement via l'application Bankily et entrez les détails ci-dessous"
    },
    {
        id: 'masrvi',
        name: 'Masrvi',
        icon: require('@/assets/payment/masrvi.png'),
        requirements: "Effectuez le paiement via l'application Masrvi et entrez les détails ci-dessous"
    },
    {
        id: 'Click',
        name: 'click',
        icon: require('@/assets/payment/click.png'),
        requirements: "Effectuez le paiement via l'application Sedad et entrez les détails ci-dessous"
    },
    {
        id: 'bimbank',
        name: 'BimBank',
        icon: require('@/assets/payment/bimbank.png'),
        requirements: "Effectuez le paiement via l'application BimBank et entrez les détails ci-dessous"
    }
];

const ReservationScreen = () => {
    
    // Données fictives
    const event: Event = {
        id: '1',
        title: 'Concert de musique',
        date: '01 Septembre 2025',
        location: 'Salle des fêtes',
        price: '1000',
        image: 'https://cdn.pixabay.com/photo/2020/01/15/17/38/fireworks-4768501_1280.jpg',
    };

    const ticketType: TicketType = {
        id: 'standard',
        name: 'Billet Standard',
        price: 1000,
    };

    const quantity = 2;

    // États
    const [currentStep, setCurrentStep] = useState(1);
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        notes: '',
    });
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bankily');
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
        firstName: '',
        lastName: '',
        transactionRef: '',
        screenshot: null
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const scrollViewRef = useRef<ScrollView>(null);
    const confirmationNumber = 873953957;

    const totalPrice = (ticketType.price * quantity).toLocaleString();

    // Navigation entre les étapes
    const nextStep = () => {
        if (currentStep < 4) {
            if (!validateStep(currentStep)) return;
            setCurrentStep(currentStep + 1);
            scrollToTop();
        } else if (currentStep === 4) {
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

    // Sélection d'image
    const pickImage = async () => {
        Keyboard.dismiss();
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
            Alert.alert('Permission requise', 'Vous devez autoriser l\'accès à votre galerie pour ajouter une capture');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPaymentDetails(prev => ({
                ...prev,
                screenshot: result.assets[0].uri
            }));
        }
    };

    // Validation des étapes
    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return true;
                
            case 2:
                if (!userInfo.fullName.trim()) {
                    Alert.alert('Erreur', 'Veuillez entrer votre nom complet');
                    return false;
                }
                if (!userInfo.email.trim() || !/\S+@\S+\.\S+/.test(userInfo.email)) {
                    Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
                    return false;
                }
                if (!userInfo.phone.trim() || userInfo.phone.length < 8) {
                    Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
                    return false;
                }
                return true;
                
            case 3:
                if (!acceptedTerms) {
                    Alert.alert('Erreur', 'Veuillez accepter les conditions générales');
                    return false;
                }
                return true;
                
            case 4:
                if (!paymentDetails.firstName.trim() || !paymentDetails.lastName.trim()) {
                    Alert.alert('Erreur', 'Veuillez entrer votre nom complet');
                    return false;
                }
                if (!paymentDetails.transactionRef.trim()) {
                    Alert.alert('Erreur', 'Veuillez entrer la référence de transaction');
                    return false;
                }
                if (!paymentDetails.screenshot) {
                    Alert.alert('Erreur', 'Veuillez ajouter une capture de la transaction');
                    return false;
                }
                return true;
                
            default:
                return false;
        }
    };

    // Gestion du paiement
    const handlePayment = () => {
        if (!validateStep(4)) return;
        
        setIsProcessing(true);
        
        // Simuler la soumission du paiement
        setTimeout(() => {
            setIsProcessing(false);
            setIsPending(true);
     
        }, 2000);
    };

    // Affichage de l'écran d'attente
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
                                Votre paiement pour "{event.title}" est en cours de vérification.
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
                            
                            {/* BOUTON AJOUTÉ ICI */}
                            <TouchableOpacity
                                className="mt-8 bg-[#ec673b] py-4 px-8 rounded-full"
                                onPress={() => router.replace('/ticket')}
                            >
                                <Text className="text-white font-bold text-lg">Voir mes tickets</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </BackgroundWrapper>
        );
    }

    // Affichage de la confirmation finale
    if (isConfirmed) {
        return (
            <BackgroundWrapper>
                <SafeAreaView className="flex-1" edges={['top']}>
                    <StatusBar style="light" />
                    <ScrollView
                        className="flex-1 px-4 pt-8 pb-32"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    >
                        <View className="flex-1 items-center justify-center px-6">
                            <Animated.View
                                className="items-center"
                                style={{ opacity: fadeAnim }}
                            >
                                <View className="bg-teal-400 rounded-full p-6 mb-8">
                                    <Ionicons name="checkmark" size={72} color="#001215" />
                                </View>
                                <Text className="text-white text-3xl font-bold text-center mb-4">
                                    Réservation confirmée !
                                </Text>
                                <Text className="text-teal-400 text-xl text-center mb-8">
                                    Votre réservation pour "{event.title}" a été validée.
                                </Text>
                                <View className="bg-white/10 rounded-xl p-6 w-full mb-8">
                                    <Text className="text-white font-bold text-center mb-3 text-lg">
                                        Numéro de confirmation
                                    </Text>
                                    <Text className="text-teal-400 text-center text-2xl font-bold">
                                        #{confirmationNumber}
                                    </Text>
                                </View>
                                
                                <View className="w-full bg-white/10 rounded-xl p-5 mb-8">
                                    <Text className="text-white font-bold text-center mb-4 text-lg">Détails de la réservation</Text>
                                    <View className="flex-row justify-between mb-3 py-2 border-b border-white/10">
                                        <Text className="text-gray-400 text-base">Événement</Text>
                                        <Text className="text-white text-base font-medium">{event.title}</Text>
                                    </View>
                                    <View className="flex-row justify-between mb-3 py-2 border-b border-white/10">
                                        <Text className="text-gray-400 text-base">Date</Text>
                                        <Text className="text-white text-base font-medium">{event.date}</Text>
                                    </View>
                                    <View className="flex-row justify-between mb-3 py-2 border-b border-white/10">
                                        <Text className="text-gray-400 text-base">Lieu</Text>
                                        <Text className="text-white text-base font-medium">{event.location}</Text>
                                    </View>
                                    <View className="flex-row justify-between mb-3 py-2 border-b border-white/10">
                                        <Text className="text-gray-400 text-base">Type de billet</Text>
                                        <Text className="text-white text-base font-medium">{ticketType.name} x {quantity}</Text>
                                    </View>
                                    <View className="flex-row justify-between mt-4 pt-4 border-t border-white/20">
                                        <Text className="text-gray-400 font-bold text-base">Total payé</Text>
                                        <Text className="text-teal-400 font-bold text-xl">{totalPrice} MRO</Text>
                                    </View>
                                </View>
                                
                                <Text className="text-gray-400 text-center text-base">
                                    Vos billets ont été envoyés à {userInfo.email}. Consultez votre boîte mail.
                                </Text>
                            </Animated.View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </BackgroundWrapper>
        );
    }

    return (
        <BackgroundWrapper>
            <SafeAreaView className="flex-1">
                {/* Navigation des étapes */}
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
                        Étape {currentStep}/4
                    </Text>
                    
                    <View className="w-12" />
                </View>
                
                <ScrollView 
                    ref={scrollViewRef}
                    className="flex-1 px-6 pt-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 30 }}
                >
                    {/* Étape 1: Récapitulatif */}
                    {currentStep === 1 && (
                        <>
                            <Text className="text-white text-2xl font-bold mb-8 text-center">Récapitulatif</Text>
                            
                            <View className="bg-white/10 rounded-2xl p-6 mb-8">
                                <Text className="text-white font-bold text-xl mb-4">Événement</Text>
                                <View className="flex-row items-center mb-6">
                                    <Image
                                        source={{ uri: event.image }}
                                        className="w-20 h-20 rounded-xl"
                                        resizeMode="cover"
                                    />
                                    <View className="ml-5 flex-1">
                                        <Text className="text-white font-bold text-lg" numberOfLines={2}>{event.title}</Text>
                                        <Text className="text-gray-400 text-base mt-2">{event.date}</Text>
                                        <Text className="text-gray-400 text-base">{event.location}</Text>
                                    </View>
                                </View>

                                <View className="border-t border-white/10 pt-5">
                                    <View className="flex-row justify-between mb-4 py-2 border-b border-white/10">
                                        <Text className="text-gray-400 text-base">Type de billet</Text>
                                        <Text className="text-white text-base font-medium">{ticketType.name}</Text>
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
                                        <Text className="text-teal-400 font-bold text-xl">{totalPrice} MRO</Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}

                    {/* Étape 2: Informations personnelles */}
                    {currentStep === 2 && (
                        <>
                            <Text className="text-white text-2xl font-bold mb-8 text-center">Informations personnelles</Text>
                            
                            <View className="bg-white/10 rounded-2xl p-6 mb-8">
                                <TextInput
                                    className="bg-white/15 rounded-xl px-5 py-4 text-white mb-5 text-base"
                                    placeholder="Nom complet"
                                    placeholderTextColor="#A0AEC0"
                                    value={userInfo.fullName}
                                    onChangeText={(text) => setUserInfo(prev => ({ ...prev, fullName: text }))}
                                />
                                <TextInput
                                    className="bg-white/15 rounded-xl px-5 py-4 text-white mb-5 text-base"
                                    placeholder="Email"
                                    placeholderTextColor="#A0AEC0"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={userInfo.email}
                                    onChangeText={(text) => setUserInfo(prev => ({ ...prev, email: text }))}
                                />
                                <TextInput
                                    className="bg-white/15 rounded-xl px-5 py-4 text-white mb-5 text-base"
                                    placeholder="Téléphone"
                                    placeholderTextColor="#A0AEC0"
                                    keyboardType="phone-pad"
                                    value={userInfo.phone}
                                    onChangeText={(text) => setUserInfo(prev => ({ ...prev, phone: text }))}
                                />
                                
                            </View>
                        </>
                    )}

                    {/* Étape 3: Méthode de paiement */}
                    {currentStep === 3 && (
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
                                            source={method.icon} 
                                            className="w-10 h-10" 
                                        />
                                        <Text
                                            className={`ml-4 font-bold text-lg ${
                                                paymentMethod === method.id 
                                                    ? 'text-gray-900' 
                                                    : 'text-white'
                                            }`}
                                        >
                                            {method.name}
                                        </Text>
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

                    {/* Étape 4: Détails du paiement */}
                    {currentStep === 4 && (
                        <>
                            <Text className="text-white text-2xl font-bold mb-8 text-center">Détails du paiement</Text>
                            
                            <View className="items-center mb-8">
                                <Image 
                                    source={paymentMethodsData.find(m => m.id === paymentMethod)?.icon} 
                                    className="w-24 h-24 mb-5" 
                                />
                                <Text className="text-white font-bold text-xl mb-2">
                                    {paymentMethodsData.find(m => m.id === paymentMethod)?.name}
                                </Text>
                                <Text className="text-gray-400 text-center text-base px-4">
                                    {paymentMethodsData.find(m => m.id === paymentMethod)?.requirements}
                                </Text>
                            </View>
                            
                            <View className="bg-white/10 rounded-2xl p-6 mb-8">
                                <View className="flex-row mb-5">
                                    <TextInput
                                        className="flex-1 bg-white/15 rounded-xl px-5 py-4 text-white mr-3 text-base"
                                        placeholder="Prénom"
                                        placeholderTextColor="#A0AEC0"
                                        value={paymentDetails.firstName}
                                        onChangeText={(text) => setPaymentDetails(prev => ({ ...prev, firstName: text }))}
                                    />
                                    <TextInput
                                        className="flex-1 bg-white/15 rounded-xl px-5 py-4 text-white ml-3 text-base"
                                        placeholder="Nom"
                                        placeholderTextColor="#A0AEC0"
                                        value={paymentDetails.lastName}
                                        onChangeText={(text) => setPaymentDetails(prev => ({ ...prev, lastName: text }))}
                                    />
                                </View>
                                
                                <TextInput
                                    className="bg-white/15 rounded-xl px-5 py-4 text-white mb-5 text-base"
                                    placeholder="Référence de transaction"
                                    placeholderTextColor="#A0AEC0"
                                    value={paymentDetails.transactionRef}
                                    onChangeText={(text) => setPaymentDetails(prev => ({ ...prev, transactionRef: text }))}
                                />
                                
                                <TouchableOpacity
                                    className="bg-white/15 rounded-xl p-6 items-center border border-dashed border-white/30"
                                    onPress={pickImage}
                                >
                                    {paymentDetails.screenshot ? (
                                        <>
                                            <Image
                                                source={{ uri: paymentDetails.screenshot }}
                                                className="w-full h-48 rounded-lg mb-4"
                                                resizeMode="contain"
                                            />
                                            <Text className="text-teal-400 text-base font-medium">Modifier la capture</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="camera" size={40} color="#68f2f4" />
                                            <Text className="text-teal-400 mt-3 text-base font-medium">Ajouter une capture de transaction</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>

                {/* Boutons de navigation */}
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
                            <Text className="text-white font-bold text-base">Traitement en cours...</Text>
                        ) : (
                            <Text className="text-white font-bold text-base">
                                {currentStep === 4 ? 'Confirmer le paiement' : 'Continuer'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </BackgroundWrapper>
    );
};

export default ReservationScreen;
