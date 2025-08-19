import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Image,
    Platform,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "https://eventick.onrender.com";

const bankLogos = {
    bankily: require('@/assets/payment/bankily.png'),
    masrvi: require('@/assets/payment/masrvi.png'),
    click: require('@/assets/payment/click.png'),
    bimbank: require('@/assets/payment/bimbank.png'),
};

const OrganizerRegistrationScreen = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [userType, setUserType] = useState('');
    const [organizerStatus, setOrganizerStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showBankSelection, setShowBankSelection] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        organizerType: 'entreprise',
        address: '',
        rib: '',
        bank: '',
        socialMedia: [{ platform: 'facebook', url: '' }],
        description: '',
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (!token) return;

                const userRes = await axios.get(`${API_URL}/api/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUserType(userRes.data.user.role);

                try {
                    const orgRes = await axios.get(`${API_URL}/api/organizers/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setOrganizerStatus(orgRes.data.organizer.isVerified);
                } catch (error) {
                    setOrganizerStatus(false);
                }

            } catch (error) {
                console.error("Erreur de chargement:", error);
            }
        };
        fetchUserInfo();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleBankSelect = (bank: string) => {
        setFormData({ ...formData, bank });
        setShowBankSelection(false);
    };

    const handleSocialMediaChange = (index: number, value: string) => {
        const newSocialMedia = [...formData.socialMedia];
        newSocialMedia[index].url = value;
        setFormData({ ...formData, socialMedia: newSocialMedia });
    };

    const addSocialMediaField = () => {
        setFormData({
            ...formData,
            socialMedia: [...formData.socialMedia, { platform: 'website', url: '' }]
        });
    };

    const removeSocialMediaField = (index: number) => {
        if (formData.socialMedia.length > 1) {
            const newSocialMedia = formData.socialMedia.filter((_, i) => i !== index);
            setFormData({ ...formData, socialMedia: newSocialMedia });
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) throw new Error("Token non trouvé");

            const userRes = await axios.get(`${API_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const socialMediaArray = formData.socialMedia
                .filter(item => item.url.trim() !== '')
                .map(item => `${item.platform}:${item.url}`);

            await axios.post(
                `${API_URL}/api/organizers/register`,
                {
                    companyName: formData.companyName,
                    address: formData.address,
                    phone: userRes.data.user.phone,
                    type: formData.organizerType,
                    socialMedia: "facebook",
                    description: formData.description,
                    contactEmail: userRes.data.user.email,
                    categories: [],
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert("Succès", "Demande d'organisateur soumise avec succès!");
            router.replace('/');
            
        } catch (err: any) {
            Alert.alert("Erreur", err.response?.data?.message || "Échec de la création");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => currentStep < 4 && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return formData.companyName.trim() !== '' && formData.address.trim() !== '';
            case 2: return formData.rib.trim() !== '' && formData.bank.trim() !== '';
            case 3: return formData.description.trim() !== '';
            case 4: return true;
            default: return false;
        }
    };

    const renderStepIndicator = () => (
        <View className="flex-row justify-center mb-6">
            {[1, 2, 3, 4].map((step) => (
                <View
                    key={step}
                    className={`mx-1 w-8 h-8 rounded-full items-center justify-center ${currentStep === step ? 'bg-[#ec673b]' : 'bg-white/20'}`}
                >
                    <Text className="text-white font-bold text-lg">{step}</Text>
                </View>
            ))}
        </View>
    );

    if (userType === 'organizer') {
        return (
            <BackgroundWrapper>
                <SafeAreaView className="flex-1" edges={['top']}>
                    <View className="flex-1 items-center justify-center px-8">
                        <View className="bg-white/10 rounded-2xl p-8 items-center w-full max-w-md">
                            {organizerStatus ? (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={72} color="#4ade80" />
                                    <Text className="text-white text-2xl font-bold mt-6 text-center">
                                        Compte vérifié
                                    </Text>
                                    <Text className="text-gray-400 text-lg text-center mt-4">
                                        Vous êtes déjà un organisateur vérifié.
                                    </Text>
                                    <TouchableOpacity
                                        className="mt-8 w-full py-4 bg-[#ec673b] rounded-xl items-center"
                                        onPress={() => router.replace("/(tabs-organisateur)/dashboard")}
                                    >
                                        <Text className="text-white font-bold text-lg">Tableau de bord</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="time-outline" size={72} color="#ec673b" />
                                    <Text className="text-white text-2xl font-bold mt-6 text-center">
                                        En attente de vérification
                                    </Text>
                                    <Text className="text-gray-400 text-lg text-center mt-4">
                                        Votre demande est en cours de traitement.
                                    </Text>
                                    <TouchableOpacity
                                        className="mt-8 w-full py-4 bg-[#ec673b] rounded-xl items-center"
                                        onPress={() => router.back()}
                                    >
                                        <Text className="text-white font-bold text-lg">Retour</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                        <Text className="mt-8 text-gray-500 text-center">
                            Contact: contact@eventick.mr
                        </Text>
                    </View>
                </SafeAreaView>
            </BackgroundWrapper>
        );
    }

    return (
        <BackgroundWrapper>
            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView
                    className="flex-1 px-5 pt-6"
                    contentContainerStyle={{ paddingBottom: 30 }}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity onPress={() => router.back()} className="mb-6">
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>

                    <Text className="text-white text-3xl font-bold mb-2 text-center">
                        Informations professionnelles
                    </Text>
                    <Text className="text-gray-400 text-lg text-center mb-4">
                        Étape {currentStep} sur 4
                    </Text>

                    {renderStepIndicator()}

                    {/* Étape 1 */}
                    {currentStep === 1 && (
                        <View>
                            <View className="mb-5">
                                <Text className="text-gray-400 text-lg mb-2">Nom de l'entreprise</Text>
                                <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-4">
                                    <Ionicons name="business" size={24} color="#ec673b" className="mr-3" />
                                    <TextInput
                                        className="flex-1 text-white text-lg"
                                        placeholder="Nom officiel"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.companyName}
                                        onChangeText={text => handleInputChange('companyName', text)}
                                    />
                                </View>
                            </View>

                            <View className="mb-5">
                                <Text className="text-gray-400 text-lg mb-2">Type d'organisateur</Text>
                                <View className="flex-row justify-between mb-3">
                                    {['entreprise', 'association', 'particulier'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            className={`py-4 px-4 rounded-xl flex-1 mx-1 ${formData.organizerType === type ? 'bg-[#ec673b]' : 'bg-white/10'}`}
                                            onPress={() => handleInputChange('organizerType', type)}
                                        >
                                            <Text className={`text-center ${formData.organizerType === type ? 'text-white font-bold' : 'text-white'}`}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="mb-5">
                                <Text className="text-gray-400 text-lg mb-2">Adresse complète</Text>
                                <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-4">
                                    <Ionicons name="location" size={24} color="#ec673b" className="mr-3" />
                                    <TextInput
                                        className="flex-1 text-white text-lg"
                                        placeholder="Quartier, ville"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.address}
                                        onChangeText={text => handleInputChange('address', text)}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Étape 2 */}
                    {currentStep === 2 && (
                        <View>
                            <View className="mb-5">
                                <Text className="text-gray-400 text-lg mb-2">Banque</Text>
                                <TouchableOpacity
                                    className="flex-row items-center bg-white/10 rounded-xl px-4 py-4 mb-3"
                                    onPress={() => setShowBankSelection(!showBankSelection)}
                                >
                                    {formData.bank ? (
                                        <>
                                            <Image
                                                source={bankLogos[formData.bank as keyof typeof bankLogos]}
                                                className="w-8 h-8 mr-3"
                                            />
                                            <Text className="text-white text-lg capitalize">{formData.bank}</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="card" size={24} color="#ec673b" className="mr-3" />
                                            <Text className="text-gray-400 text-lg">Sélectionner une banque</Text>
                                        </>
                                    )}
                                    <Ionicons
                                        name={showBankSelection ? "chevron-up" : "chevron-down"}
                                        size={24}
                                        color="#ec673b"
                                        className="ml-auto"
                                    />
                                </TouchableOpacity>

                                {showBankSelection && (
                                    <View className="bg-gray-800 rounded-xl p-4 mb-4">
                                        <Text className="text-gray-400 text-lg mb-3">Banques disponibles</Text>
                                        <View className="flex-row flex-wrap justify-between">
                                            {Object.keys(bankLogos).map((bank) => (
                                                <TouchableOpacity
                                                    key={bank}
                                                    className="items-center w-1/2 mb-4 px-2"
                                                    onPress={() => handleBankSelect(bank)}
                                                >
                                                    <Image
                                                        source={bankLogos[bank as keyof typeof bankLogos]}
                                                        className="w-16 h-16 mb-2"
                                                    />
                                                    <Text className="text-white text-base capitalize">{bank}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                <Text className="text-gray-400 text-lg mb-2 mt-4">RIB/Compte</Text>
                                <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-4">
                                    {formData.bank ? (
                                        <Image
                                            source={bankLogos[formData.bank as keyof typeof bankLogos]}
                                            className="w-8 h-8 mr-3"
                                        />
                                    ) : (
                                        <Ionicons name="card" size={24} color="#ec673b" className="mr-3" />
                                    )}
                                    <TextInput
                                        className="flex-1 text-white text-lg"
                                        placeholder="Numéro de compte"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.rib}
                                        onChangeText={text => handleInputChange('rib', text)}
                                        keyboardType="number-pad"
                                    />
                                </View>
                            </View>

                            <View className="mb-5">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-gray-400 text-lg">Réseaux sociaux</Text>
                                    <TouchableOpacity
                                        className="bg-[#ec673b] rounded-full p-2"
                                        onPress={addSocialMediaField}
                                    >
                                        <Ionicons name="add" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>

                                {formData.socialMedia.map((item, index) => (
                                    <View key={index} className="flex-row items-center mb-3">
                                        <View className="flex-row items-center flex-1 bg-white/10 rounded-xl px-4 py-4">
                                            <Ionicons name="link" size={24} color="#ec673b" className="mr-3" />
                                            <TextInput
                                                className="flex-1 text-white text-lg"
                                                placeholder={`Lien ${item.platform}`}
                                                placeholderTextColor="#9CA3AF"
                                                value={item.url}
                                                onChangeText={text => handleSocialMediaChange(index, text)}
                                            />
                                        </View>
                                        {formData.socialMedia.length > 1 && (
                                            <TouchableOpacity
                                                className="ml-2 bg-red-500 rounded-full p-2"
                                                onPress={() => removeSocialMediaField(index)}
                                            >
                                                <Ionicons name="trash" size={20} color="white" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Étape 3 */}
                    {currentStep === 3 && (
                        <View>
                            <View className="mb-5">
                                <Text className="text-gray-400 text-lg mb-2">Description</Text>
                                <View className="bg-white/10 rounded-xl px-4 py-4 h-48">
                                    <TextInput
                                        className="flex-1 text-white text-lg"
                                        placeholder="Décrivez votre activité..."
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        value={formData.description}
                                        onChangeText={text => handleInputChange('description', text)}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Étape 4 */}
                    {currentStep === 4 && (
                        <View className="mb-4">
                            <Text className="text-gray-400 text-lg mb-3">Documents légaux</Text>
                            <Text className="text-gray-500 text-base mb-6">
                                Notre équipe vous contactera pour recueillir les documents nécessaires
                            </Text>
                            
                            {formData.organizerType === 'particulier' ? (
                                <View className="mb-4">
                                    <Text className="text-gray-500 text-lg mb-3">Pièce d'identité</Text>
                                    <TouchableOpacity className="bg-white/10 rounded-xl p-6 items-center">
                                        <Ionicons name="cloud-upload" size={48} color="#ec673b" />
                                        <Text className="text-white mt-3 text-lg">Télécharger</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <View className="mb-4">
                                        <Text className="text-gray-500 text-lg mb-3">Registre de commerce</Text>
                                        <TouchableOpacity className="bg-white/10 rounded-xl p-6 items-center">
                                            <Ionicons name="cloud-upload" size={48} color="#ec673b" />
                                            <Text className="text-white mt-3 text-lg">Télécharger</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View>
                                        <Text className="text-gray-500 text-lg mb-3">Pièce d'identité</Text>
                                        <TouchableOpacity className="bg-white/10 rounded-xl p-6 items-center">
                                            <Ionicons name="cloud-upload" size={48} color="#ec673b" />
                                            <Text className="text-white mt-3 text-lg">Télécharger</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    )}

                    {/* Navigation */}
                    <View className="flex-row justify-between mt-4 mb-8">
                        {currentStep > 1 && (
                            <TouchableOpacity
                                className="py-4 px-6 rounded-xl bg-gray-600 items-center justify-center"
                                onPress={prevStep}
                            >
                                <Text className="text-white font-bold text-lg">Retour</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            className={`py-4 px-6 rounded-xl flex-1 ml-4 items-center justify-center ${!isStepValid() || loading ? 'bg-gray-500' : 'bg-[#ec673b]'}`}
                            onPress={currentStep === 4 ? handleSubmit : nextStep}
                            disabled={!isStepValid() || loading}
                        >
                            <Text className="text-white font-bold text-lg">
                                {currentStep === 4 
                                    ? (loading ? "Traitement..." : "Soumettre") 
                                    : "Continuer"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </BackgroundWrapper>
    );
};

export default OrganizerRegistrationScreen;