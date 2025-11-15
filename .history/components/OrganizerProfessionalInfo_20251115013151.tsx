import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { RegisterFormData } from '@/types';

const bankLogos = {
    bankily: require('@/assets/payment/bankily.png'),
    masrvi: require('@/assets/payment/masrvi.png'),
    click: require('@/assets/payment/click.png'),
    bimbank: require('@/assets/payment/bimbank.png'),
};

const socialMediaTypes = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'];

interface OrganizerProfessionalInfoProps {
    formData: RegisterFormData;
    onInputChange: (field: keyof RegisterFormData, value: any) => void;
    onSubmit: () => void;
    loading: boolean;
}

const OrganizerProfessionalInfo: React.FC<OrganizerProfessionalInfoProps> = ({
    formData,
    onInputChange,
    onSubmit,
    loading
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [showBankSelection, setShowBankSelection] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const getCurrentLocation = async () => {
        try {
            setLocationLoading(true);

            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission refusée',
                    'La permission de localisation est nécessaire pour remplir automatiquement votre adresse.'
                );
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
               // timeout: 15000,
            });

            let addressList = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (addressList.length > 0) {
                const address = addressList[0];
                const fullAddress = [
                    address.street,
                    address.streetNumber,
                    address.postalCode,
                    address.city,
                    address.region,
                    address.country
                ].filter(Boolean).join(', ');

                if (fullAddress) {
                    onInputChange('address', fullAddress);
                    Alert.alert('Succès', 'Adresse auto-remplie avec succès !');
                } else {
                    Alert.alert('Info', 'Adresse non trouvée pour cette position.');
                }
            } else {
                Alert.alert('Erreur', 'Impossible de récupérer l\'adresse.');
            }

        } catch (error) {
            console.error('Erreur géolocalisation:', error);
            Alert.alert(
                'Erreur',
                'Impossible de récupérer votre position. Vérifiez votre connexion et vos paramètres de localisation.'
            );
        } finally {
            setLocationLoading(false);
        }
    };

    const handleBankSelect = (bank: string) => {
        onInputChange('bank', bank);
        setShowBankSelection(false);
    };

    const handleSocialMediaChange = (index: number, field: string, value: string) => {
        const newSocialMedia = [...formData.socialMedia];
        newSocialMedia[index] = { ...newSocialMedia[index], [field]: value };
        onInputChange('socialMedia', newSocialMedia);
    };

    const addSocialMediaField = () => {
        onInputChange('socialMedia', [...formData.socialMedia, { type: 'fac', url: '', name: formData.companyName }]);
    };

    const removeSocialMediaField = (index: number) => {
        if (formData.socialMedia.length > 1) {
            const newSocialMedia = formData.socialMedia.filter((_, i) => i !== index);
            onInputChange('socialMedia', newSocialMedia);
        }
    };

    const pickImageFront = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                onInputChange('idFront', result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert("Erreur", "Impossible de sélectionner l'image recto");
        }
    };

    const pickImageBack = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                onInputChange('idBack', result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert("Erreur", "Impossible de sélectionner l'image verso");
        }
    };

    const nextStep = () => currentStep < 4 && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.companyName.trim() !== '' &&
                    formData.address.trim() !== '' &&
                    formData.phone.trim() !== '';
            case 2:
                return formData.rib.trim() !== '' &&
                    formData.bank.trim() !== '' &&
                    formData.website.trim() !== '';
            case 3:
                return formData.description.trim() !== '' &&
                    formData.categories.trim() !== '' &&
                    formData.contactEmail.trim() !== '';
            case 4:
                return formData.idFront !== null && formData.idBack !== null;
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

    return (
        <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
        >
            <Text className="text-white text-3xl font-bold mb-2 text-center">
                Informations professionnelles
            </Text>
            <Text className="text-gray-400 text-lg text-center mb-4">
                Étape {currentStep} sur 4
            </Text>

            {renderStepIndicator()}

            {/* Étape 1 - Informations de base */}
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
                                onChangeText={text => onInputChange('companyName', text)}
                            />
                        </View>
                    </View>

                    <View className="mb-5">
                        <Text className="text-gray-400 text-lg mb-2">Type d'organisateur</Text>
                        <View className="flex-row justify-between mb-3">
                            {['entreprise', 'particulier'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    className={`py-4 px-4 rounded-xl flex-1 mx-1 ${formData.organizerType === type ? 'bg-[#ec673b]' : 'bg-white/10'}`}
                                    onPress={() => onInputChange('organizerType', type)}
                                >
                                    <Text className={`text-center ${formData.organizerType === type ? 'text-white font-bold' : 'text-white'}`}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="mb-5">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-gray-400 text-lg">Adresse complète</Text>
                            <TouchableOpacity
                                onPress={getCurrentLocation}
                                disabled={locationLoading}
                                className="flex-row items-center bg-[#ec673b] px-3 py-2 rounded-lg"
                            >
                                <Ionicons
                                    name={locationLoading ? "refresh" : "navigate"}
                                    size={20}
                                    color="white"
                                />
                                <Text className="text-white ml-2 text-sm">
                                    {locationLoading ? "Chargement..." : "Auto-remplir"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-4">
                            <Ionicons name="location" size={24} color="#ec673b" className="mr-3" />
                            <TextInput
                                className="flex-1 text-white text-lg"
                                placeholder="123 Rue de la Paix, Casablanca"
                                placeholderTextColor="#9CA3AF"
                                value={formData.address}
                                onChangeText={text => onInputChange('address', text)}
                                multiline
                                numberOfLines={2}
                            />
                        </View>
                    </View>

                    <View className="mb-5">
                        <Text className="text-gray-400 text-lg mb-2">Téléphone</Text>
                        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-4">
                            <Ionicons name="call" size={24} color="#ec673b" className="mr-3" />
                            <TextInput
                                className="flex-1 text-white text-lg"
                                placeholder="22234326838"
                                placeholderTextColor="#9CA3AF"
                                value={formData.phone}
                                onChangeText={text => onInputChange('phone', text)}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>
                </View>
            )}

            {/* Étape 2 - Informations bancaires et réseaux sociaux */}
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
                                placeholder="34326030"
                                placeholderTextColor="#9CA3AF"
                                value={formData.rib}
                                onChangeText={text => onInputChange('rib', text)}
                                keyboardType="number-pad"
                            />
                        </View>
                    </View>

                    <View className="mb-5">
                        <Text className="text-gray-400 text-lg mb-2">Site web</Text>
                        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-4">
                            <Ionicons name="globe" size={24} color="#ec673b" className="mr-3" />
                            <TextInput
                                className="flex-1 text-white text-lg"
                                placeholder="https://www.novatrix.dev"
                                placeholderTextColor="#9CA3AF"
                                value={formData.website}
                                onChangeText={text => onInputChange('website', text)}
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
                            <View key={index} className="mb-4 p-4 bg-white/5 rounded-xl">
                                <View className="flex-row items-center mb-3">
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-sm mb-1">Type</Text>
                                        <View className="flex-row flex-wrap">
                                            {socialMediaTypes.map((type) => (
                                                <TouchableOpacity
                                                    key={type}
                                                    className={`mr-2 mb-2 px-3 py-1 rounded-full ${item.type === type ? 'bg-[#ec673b]' : 'bg-white/10'}`}
                                                    onPress={() => handleSocialMediaChange(index, 'type', type)}
                                                >
                                                    <Text className="text-white text-sm capitalize">{type}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
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
                                <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
                                    <Ionicons name="link" size={20} color="#ec673b" className="mr-3" />
                                    <TextInput
                                        className="flex-1 text-white text-base"
                                        placeholder={`URL ${item.type}`}
                                        placeholderTextColor="#9CA3AF"
                                        value={item.url}
                                        onChangeText={text => handleSocialMediaChange(index, 'url', text)}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Étape 3 - Description et catégories */}
            {currentStep === 3 && (
                <View>
                    <View className="mb-5">
                        <Text className="text-gray-400 text-lg mb-2">Email de contact</Text>
                        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-4">
                            <Ionicons name="mail" size={24} color="#ec673b" className="mr-3" />
                            <TextInput
                                className="flex-1 text-white text-lg"
                                placeholder="contact@masociete.com"
                                placeholderTextColor="#9CA3AF"
                                value={formData.contactEmail}
                                onChangeText={text => onInputChange('contactEmail', text)}
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <View className="mb-5">
                        <Text className="text-gray-400 text-lg mb-2">Description</Text>
                        <View className="bg-white/10 rounded-xl px-4 py-4 h-32">
                            <TextInput
                                className="flex-1 text-white text-lg"
                                placeholder="Organisateur d'événements professionnels"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                value={formData.description}
                                onChangeText={text => onInputChange('description', text)}
                            />
                        </View>
                    </View>

                    <View className="mb-5">
                        <Text className="text-gray-400 text-lg mb-2">Catégories</Text>
                        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-4">
                            <Ionicons name="pricetags" size={24} color="#ec673b" className="mr-3" />
                            <TextInput
                                className="flex-1 text-white text-lg"
                                placeholder="musique,conférence,exposition"
                                placeholderTextColor="#9CA3AF"
                                value={formData.categories}
                                onChangeText={text => onInputChange('categories', text)}
                            />
                        </View>
                        <Text className="text-gray-500 text-sm mt-1">
                            Séparez les catégories par des virgules
                        </Text>
                    </View>
                </View>
            )}

            {/* Étape 4 - Documents légaux */}
            {currentStep === 4 && (
                <View className="mb-4">
                    <Text className="text-gray-400 text-lg mb-3">Pièce d'identité</Text>
                    <Text className="text-gray-500 text-base mb-6">
                        Téléchargez le recto et verso de votre pièce d'identité
                    </Text>

                    <View className="flex-row justify-between mb-6">
                        <View className="flex-1 mr-2">
                            <Text className="text-gray-500 text-lg mb-3 text-center">Recto</Text>
                            <TouchableOpacity
                                className="bg-white/10 rounded-xl p-6 items-center"
                                onPress={pickImageFront}
                            >
                                {formData.idFront ? (
                                    <Image
                                        source={{ uri: formData.idFront }}
                                        className="w-20 h-20 rounded-lg"
                                    />
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload" size={48} color="#ec673b" />
                                        <Text className="text-white mt-3 text-lg">Télécharger</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1 ml-2">
                            <Text className="text-gray-500 text-lg mb-3 text-center">Verso</Text>
                            <TouchableOpacity
                                className="bg-white/10 rounded-xl p-6 items-center"
                                onPress={pickImageBack}
                            >
                                {formData.idBack ? (
                                    <Image
                                        source={{ uri: formData.idBack }}
                                        className="w-20 h-20 rounded-lg"
                                    />
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload" size={48} color="#ec673b" />
                                        <Text className="text-white mt-3 text-lg">Télécharger</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="bg-blue-500/20 rounded-xl p-4 mb-4">
                        <Text className="text-blue-400 text-sm">
                            <Ionicons name="information-circle" size={16} color="#60a5fa" />
                            {' '}Pour tous les types d'organisateurs, seule la pièce d'identité est requise
                        </Text>
                    </View>
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
                    className={`py-4 px-6 rounded-xl flex-1 ${currentStep > 1 ? 'ml-4' : ''} items-center justify-center ${!isStepValid() || loading ? 'bg-gray-500' : 'bg-[#ec673b]'}`}
                    onPress={currentStep === 4 ? onSubmit : nextStep}
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
    );
};

export default OrganizerProfessionalInfo;



website