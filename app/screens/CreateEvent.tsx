import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, Image, Alert } from 'react-native'
import React, { useState, memo } from 'react'
import BackgroundWrapper from '@/components/BackgroundWrapper'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import Animated, { FadeInDown } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = "https://eventick.onrender.com";

// Catégories disponibles
const categories = [
  'Concert', 'Religion', 'Sport', 'Culture',
  'Business', 'Festival', 'Conférence', 'Théâtre', 'Autre'
]

// Villes de Mauritanie
const mauritaniaCities = [
  'Nouakchott', 'Nouadhibou', 'Atar', 'Kaédi', 'Kiffa',
  'Rosso', 'Zouerate', 'Aleg', 'Sélibaby', 'Tidjikja'
]

// Étape 1: Informations de base
interface Step1Props {
  eventData: any;
  setEventData: React.Dispatch<React.SetStateAction<any>>;
  pickImage: () => Promise<void>;
}

const Step1 = memo(({ eventData, setEventData, pickImage }: Step1Props) => {
  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6">
      <Text className="text-white text-2xl font-extrabold mb-6">
        Étape 1/5 : Informations de base
      </Text>

      <View className="mb-8">
        <Text className="text-white text-xl font-semibold mb-3">
          Image de l'événement
        </Text>
        <TouchableOpacity
          className="bg-white/10 border-2 border-dashed border-teal-400/50 rounded-2xl h-56 items-center justify-center overflow-hidden"
          onPress={pickImage}
          activeOpacity={0.7}
        >
          {eventData.image ? (
            <Image
              source={{ uri: eventData.image }}
              className="w-full h-full rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center">
              <Ionicons name="image" size={56} color="#68f2f4" />
              <Text className="text-teal-400 mt-3 text-lg font-medium">
                Ajouter une image
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View className="space-y-6">
        <View>
          <Text className="text-teal-400 text-lg mb-2 font-medium">
            Titre de l'événement
          </Text>
          <TextInput
            className="bg-white/10 text-white p-5 rounded-2xl text-lg"
            placeholder="Nommez votre événement"
            placeholderTextColor="#9ca3af"
            value={eventData.title}
            onChangeText={text => setEventData({ ...eventData, title: text })}
          />
        </View>

        <View>
          <Text className="text-teal-400 text-lg mb-2 font-medium">
            Description
          </Text>
          <TextInput
            className="bg-white/10 text-white p-5 rounded-2xl text-lg h-36"
            placeholder="Décrivez votre événement..."
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            value={eventData.description}
            onChangeText={text => setEventData({ ...eventData, description: text })}
          />
        </View>

        <View>
          <Text className="text-teal-400 text-lg mb-2 font-medium">Catégorie</Text>
          <Dropdown
            style={{
              backgroundColor: 'rgba(32,166,167,0.2)',
              borderRadius: 16,
              paddingHorizontal: 16,
              height: 55,
            }}
            placeholderStyle={{ color: '#9ca3af', fontSize: 16 }}
            selectedTextStyle={{ color: 'white', fontSize: 16, fontWeight: '500' }}
            data={categories.map(cat => ({ label: cat, value: cat }))}
            labelField="label"
            valueField="value"
            placeholder="Sélectionnez une catégorie"
            value={eventData.category}
            onChange={item => {
              setEventData({ ...eventData, category: item.value });
            }}
            search
            searchPlaceholder="Recherchez une catégorie..."
            placeholderTextColor="#9ca3af"
            searchStyle={{
              backgroundColor: 'rgba(32,166,167,0.2)',
              borderRadius: 12,
              paddingHorizontal: 12,
              height: 45,
              color: 'white',
              marginBottom: 8,
            }}
            dropdownStyle={{
              backgroundColor: '#20a6a7',
              borderRadius: 16,
              maxHeight: 250,
            }}
            renderItem={item => (
              <View
                style={{
                  backgroundColor: '#20a6a7',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderBottomWidth: 0.5,
                  borderBottomColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>{item.label}</Text>
              </View>
            )}
            renderLeftIcon={() => (
              <Ionicons name="list-outline" size={20} color="white" style={{ marginRight: 8 }} />
            )}
          />
        </View>
      </View>
    </Animated.View>
  );
});

// Étape 2: Date et heure
interface Step2Props {
  eventData: any;
  setEventData: React.Dispatch<React.SetStateAction<any>>;
  showDatePicker: boolean;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  showStartTimePicker: boolean;
  setShowStartTimePicker: React.Dispatch<React.SetStateAction<boolean>>;
  showEndTimePicker: boolean;
  setShowEndTimePicker: React.Dispatch<React.SetStateAction<boolean>>;
  handleDateChange: (event: any, selectedDate?: Date) => void;
  handleStartTimeChange: (event: any, selectedTime?: Date) => void;
  handleEndTimeChange: (event: any, selectedTime?: Date) => void;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
}

const Step2 = memo(({
  eventData,
  setEventData,
  showDatePicker,
  setShowDatePicker,
  showStartTimePicker,
  setShowStartTimePicker,
  showEndTimePicker,
  setShowEndTimePicker,
  handleDateChange,
  handleStartTimeChange,
  handleEndTimeChange,
  formatDate,
  formatTime
}: Step2Props) => {
  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6">
      <Text className="text-white text-2xl font-extrabold mb-6">
        Étape 2/5 : Date et heure
      </Text>

      <View className="space-y-6">
        <View>
          <Text className="text-teal-400 text-lg mb-2 font-medium">Date</Text>
          <TouchableOpacity
            className="bg-white/10 p-5 rounded-2xl flex-row justify-between items-center"
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text className="text-white text-lg">{formatDate(eventData.date)}</Text>
            <MaterialCommunityIcons name="calendar" size={28} color="#68f2f4" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={eventData.date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View className="flex-row justify-between space-x-4">
          <View className="flex-1">
            <Text className="text-teal-400 text-lg mb-2 font-medium">Heure de début</Text>
            <TouchableOpacity
              className="bg-white/10 p-5 rounded-2xl flex-row justify-between items-center"
              onPress={() => setShowStartTimePicker(true)}
              activeOpacity={0.7}
            >
              <Text className="text-white text-lg">{formatTime(eventData.startTime)}</Text>
              <MaterialCommunityIcons name="clock" size={28} color="#68f2f4" />
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={eventData.startTime}
                mode="time"
                display="default"
                onChange={handleStartTimeChange}
              />
            )}
          </View>

          <View className="flex-1">
            <Text className="text-teal-400 text-lg mb-2 font-medium">Heure de fin</Text>
            <TouchableOpacity
              className="bg-white/10 p-5 rounded-2xl flex-row justify-between items-center"
              onPress={() => setShowEndTimePicker(true)}
              activeOpacity={0.7}
            >
              <Text className="text-white text-lg">{formatTime(eventData.endTime)}</Text>
              <MaterialCommunityIcons name="clock" size={28} color="#68f2f4" />
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={eventData.endTime}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
                minimumDate={eventData.startTime}
              />
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

// Étape 3: Lieu
interface Step3Props {
  eventData: any;
  setEventData: React.Dispatch<React.SetStateAction<any>>;
  formatDate: (date: Date) => string;
}

const Step3 = memo(({ eventData, setEventData, formatDate }: Step3Props) => {
  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6">
      <Text className="text-white text-2xl font-extrabold mb-6">
        Étape 3/5 : Lieu
      </Text>

      <View className="space-y-6">
        <View>
          <Text className="text-teal-400 text-lg mb-2 font-medium">Ville</Text>
          <Dropdown
            style={{
              backgroundColor: 'rgba(32,166,167,0.2)',
              borderRadius: 16,
              paddingHorizontal: 16,
              height: 55,
            }}
            placeholderStyle={{ color: '#9ca3af', fontSize: 16 }}
            selectedTextStyle={{ color: 'white', fontSize: 16, fontWeight: '500' }}
            data={mauritaniaCities.map(city => ({ label: city, value: city }))}
            labelField="label"
            valueField="value"
            placeholder="Sélectionnez une ville"
            value={eventData.location}
            onChange={item => {
              setEventData({ ...eventData, location: item.value });
            }}
            search
            searchPlaceholder="Recherchez une ville..."
            placeholderTextColor="#9ca3af"
            searchStyle={{
              backgroundColor: 'rgba(32,166,167,0.2)',
              borderRadius: 12,
              paddingHorizontal: 12,
              height: 45,
              color: 'white',
              marginBottom: 8,
            }}
            dropdownStyle={{
              backgroundColor: '#20a6a7',
              borderRadius: 16,
              maxHeight: 250,
            }}
            renderItem={item => (
              <View
                style={{
                  backgroundColor: '#20a6a7',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderBottomWidth: 0.5,
                  borderBottomColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>{item.label}</Text>
              </View>
            )}
            renderLeftIcon={() => (
              <Ionicons name="location-outline" size={20} color="white" style={{ marginRight: 8 }} />
            )}
          />
        </View>

        <View>
          <Text className="text-teal-400 text-lg mb-2 font-medium">Salle / lieu spécifique</Text>
          <TextInput
            className="bg-white/10 text-white p-5 rounded-2xl text-lg"
            placeholder="Nom de la salle ou lieu"
            placeholderTextColor="#9ca3af"
            value={eventData.venue}
            onChangeText={text => setEventData({ ...eventData, venue: text })}
          />
        </View>
      </View>
    </Animated.View>
  );
});

// Étape 4: Promotion
interface Step4Props {
  eventData: any;
  setEventData: React.Dispatch<React.SetStateAction<any>>;
  showPromoEndDatePicker: boolean;
  setShowPromoEndDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  handlePromoEndDateChange: (event: any, selectedDate?: Date) => void;
  formatDate: (date: Date) => string;
}

const Step4 = memo(({
  eventData,
  setEventData,
  showPromoEndDatePicker,
  setShowPromoEndDatePicker,
  handlePromoEndDateChange,
  formatDate
}: Step4Props) => {
  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6">
      <Text className="text-white text-2xl font-extrabold mb-6">
        Étape 4/5 : Promotion
      </Text>

      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-white text-lg font-medium">Activer une promotion</Text>
        <TouchableOpacity
          className={`w-14 h-7 rounded-full p-1 flex justify-center ${eventData.isPromo ? 'bg-teal-400' : 'bg-gray-700'}`}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            setEventData({ ...eventData, isPromo: !eventData.isPromo })
          }}
          activeOpacity={0.7}
        >
          <View
            className={`bg-white w-5 h-5 rounded-full shadow ${eventData.isPromo ? 'ml-7' : 'ml-0'
              }`}
            style={{ transition: 'margin-left 0.3s' }}
          />
        </TouchableOpacity>
      </View>

      {eventData.isPromo && (
        <View className="space-y-6">
          <View className="flex-row justify-between space-x-4">
            <View className="flex-1">
              <Text className="text-teal-400 text-lg mb-2 font-medium">Pourcentage de réduction</Text>
              <TextInput
                className="bg-white/10 text-white p-5 rounded-2xl text-lg"
                placeholder="Ex: 20"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={eventData.promoDiscount ? eventData.promoDiscount.toString() : ''}
                onChangeText={text =>
                  setEventData({ ...eventData, promoDiscount: parseInt(text) || 0 })
                }
              />
            </View>

            <View className="flex-1">
              <Text className="text-teal-400 text-lg mb-2 font-medium">Fin de la promotion</Text>
              <TouchableOpacity
                className="bg-white/10 p-5 rounded-2xl flex-row justify-between items-center"
                onPress={() => setShowPromoEndDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text className="text-white text-lg">{formatDate(eventData.promoEndDate)}</Text>
                <MaterialCommunityIcons name="calendar" size={28} color="#68f2f4" />
              </TouchableOpacity>
              {showPromoEndDatePicker && (
                <DateTimePicker
                  value={eventData.promoEndDate}
                  mode="date"
                  display="default"
                  onChange={handlePromoEndDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
          </View>

          <View className="bg-teal-400/10 p-4 rounded-2xl">
            <Text className="text-teal-400 text-base">
              La promotion sera automatiquement désactivée après la date de fin spécifiée.
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
});

// Étape 5: Types de billets
interface Step5Props {
  ticketTypes: any[];
  setTicketTypes: React.Dispatch<React.SetStateAction<any[]>>;
  addTicketType: () => void;
  removeTicketType: (id: string) => void;
  updateTicketType: (id: string, field: string, value: string) => void;
}

const Step5 = memo(({
  ticketTypes,
  setTicketTypes,
  addTicketType,
  removeTicketType,
  updateTicketType
}: Step5Props) => {
  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6">
      <Text className="text-white text-2xl font-extrabold mb-6">
        Étape 5/5 : Types de billets
      </Text>

      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-semibold">Types de billets</Text>
        <TouchableOpacity
          className="flex-row items-center bg-teal-400 py-2 px-4 rounded-full"
          onPress={addTicketType}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color="#001215" />
          <Text className="text-gray-900 ml-2 font-medium text-lg">Ajouter</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-teal-400 mb-4 text-base">
        La somme des places doit correspondre à la capacité totale de la salle
      </Text>

      <View className="space-y-6">
        {ticketTypes.map((type, index) => (
          <View
            key={type.id}
            className="bg-white/10 p-5 rounded-2xl"
          >
            <View className="flex-row justify-between items-start mb-4">
              <Text className="text-white font-semibold text-lg">
                Type de billet #{index + 1}
              </Text>
              {ticketTypes.length > 1 && (
                <TouchableOpacity onPress={() => removeTicketType(type.id)}>
                  <Ionicons name="trash" size={22} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-teal-400 text-lg mb-2 font-medium">Nom</Text>
                <TextInput
                  className="bg-white/10 text-white p-4 rounded-2xl text-lg"
                  placeholder="Ex: VIP, Standard..."
                  placeholderTextColor="#9ca3af"
                  value={type.name}
                  onChangeText={text => updateTicketType(type.id, 'name', text)}
                />
              </View>

              <View className="flex-row justify-between space-x-4">
                <View className="flex-1">
                  <Text className="text-teal-400 text-lg mb-2 font-medium">Prix (MRO)</Text>
                  <TextInput
                    className="bg-white/10 text-white p-4 rounded-2xl text-lg"
                    placeholder="Prix"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={type.price}
                    onChangeText={text => updateTicketType(type.id, 'price', text)}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-teal-400 text-lg mb-2 font-medium">Quantité</Text>
                  <TextInput
                    className="bg-white/10 text-white p-4 rounded-2xl text-lg"
                    placeholder="Nombre"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={type.quantity}
                    onChangeText={text => updateTicketType(type.id, 'quantity', text)}
                  />
                </View>
              </View>

              <View>
                <Text className="text-teal-400 text-lg mb-2 font-medium">Description</Text>
                <TextInput
                  className="bg-white/10 text-white p-4 rounded-2xl text-lg h-20 textAlignVertical='top'"
                  placeholder="Avantages, conditions..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  value={type.description}
                  onChangeText={text => updateTicketType(type.id, 'description', text)}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
});

const CreateEvent = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // États pour les données de l'événement
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
    location: '',
    venue: '',
    totalCapacity: '',
    category: '',
    image: null as string | null,
    isPromo: false,
    promoDiscount: 0,
    promoEndDate: new Date(),
  })

  // États pour les types de billets
  const [ticketTypes, setTicketTypes] = useState([
    { id: '1', name: 'Standard', price: '', description: 'Accès standard à l\'événement', quantity: '' },
  ])

  // États pour les sélecteurs de date/heure
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [showPromoEndDatePicker, setShowPromoEndDatePicker] = useState(false)

  // Gestion des changements de date/heure
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || eventData.date
    setShowDatePicker(Platform.OS === 'ios')
    setEventData({ ...eventData, date: currentDate })
  }

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || eventData.startTime
    setShowStartTimePicker(Platform.OS === 'ios')
    setEventData({ ...eventData, startTime: currentTime })
  }

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || eventData.endTime
    setShowEndTimePicker(Platform.OS === 'ios')
    setEventData({ ...eventData, endTime: currentTime })
  }

  const handlePromoEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || eventData.promoEndDate
    setShowPromoEndDatePicker(Platform.OS === 'ios')
    setEventData({ ...eventData, promoEndDate: currentDate })
  }

  // Ajouter un nouveau type de billet
  const addTicketType = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const newId = (ticketTypes.length + 1).toString()
    setTicketTypes([
      ...ticketTypes,
      { id: newId, name: '', price: '', description: '', quantity: '' }
    ])
  }

  // Supprimer un type de billet
  const removeTicketType = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter(type => type.id !== id))
    }
  }

  // Mettre à jour un type de billet
  const updateTicketType = (id: string, field: string, value: string) => {
    setTicketTypes(ticketTypes.map(type =>
      type.id === id ? { ...type, [field]: value } : type
    ))
  }

  // Sélectionner une image
  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled) {
      setEventData({ ...eventData, image: result.assets[0].uri })
    }
  }

  // Soumettre l'événement
  const handleSubmit = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    
    try {
      const token = await AsyncStorage.getItem("token");
      
      console.log("Le token gen : ", token)
      console.log("l'image est : ", eventData.image)
      
      await axios.post(
        `${API_URL}/api/events`,
        {
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          date: eventData.date,
          time: eventData.startTime,
          price: 2000,
          totalTickets: 50,
          image: null,
          category: eventData.category,
          paymentMethods: "bankily"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Succès", "Evenement créé !");
      router.replace("/(tabs-organisateur)/events");

    } catch (err: any) {
      Alert.alert("Erreur", err.response?.data?.message || "Échec de création");
    } 
  }

  // Formater la date pour l'affichage
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Formater l'heure pour l'affichage
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Navigation entre les étapes
  const goToNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Barre de progression
  const ProgressBar = () => {
    return (
      <View className="flex-row items-center justify-between mb-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <React.Fragment key={step}>
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${currentStep >= step
                ? 'bg-teal-400'
                : 'bg-white/10 border border-teal-400/50'
                }`}
            >
              <Text className={`font-bold ${currentStep >= step ? 'text-gray-900' : 'text-teal-400'}`}>
                {step}
              </Text>
            </View>
            {step < 5 && (
              <View
                className={`flex-1 h-1 mx-1 ${currentStep > step ? 'bg-teal-400' : 'bg-white/10'
                  }`}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    )
  }

  return (
    <BackgroundWrapper>
      <ScrollView className="flex-1 px-4 pt-16 pb-24">
        {/* En-tête */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#68f2f4" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold text-center flex-1">
            Créer un événement
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Barre de progression */}
        <ProgressBar />

        {/* Affichage de l'étape actuelle */}
        {currentStep === 1 && (
          <Step1 
            eventData={eventData} 
            setEventData={setEventData} 
            pickImage={pickImage} 
          />
        )}
        {currentStep === 2 && (
          <Step2 
            eventData={eventData}
            setEventData={setEventData}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            showStartTimePicker={showStartTimePicker}
            setShowStartTimePicker={setShowStartTimePicker}
            showEndTimePicker={showEndTimePicker}
            setShowEndTimePicker={setShowEndTimePicker}
            handleDateChange={handleDateChange}
            handleStartTimeChange={handleStartTimeChange}
            handleEndTimeChange={handleEndTimeChange}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        )}
        {currentStep === 3 && (
          <Step3 
            eventData={eventData}
            setEventData={setEventData}
            formatDate={formatDate}
          />
        )}
        {currentStep === 4 && (
          <Step4 
            eventData={eventData}
            setEventData={setEventData}
            showPromoEndDatePicker={showPromoEndDatePicker}
            setShowPromoEndDatePicker={setShowPromoEndDatePicker}
            handlePromoEndDateChange={handlePromoEndDateChange}
            formatDate={formatDate}
          />
        )}
        {currentStep === 5 && (
          <Step5 
            ticketTypes={ticketTypes}
            setTicketTypes={setTicketTypes}
            addTicketType={addTicketType}
            removeTicketType={removeTicketType}
            updateTicketType={updateTicketType}
          />
        )}

        {/* Boutons de navigation */}
        <View className="flex-row justify-between mt-8">
          {currentStep > 1 && (
            <TouchableOpacity
              className="bg-white/10 py-3 px-6 rounded-xl flex-row items-center"
              onPress={goToPreviousStep}
            >
              <Ionicons name="arrow-back" size={20} color="#68f2f4" />
              <Text className="text-teal-400 ml-2 font-medium">Retour</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className={`py-3 px-6 rounded-xl flex-row items-center ${currentStep < 5
              ? 'bg-teal-400'
              : 'bg-amber-400'
              }`}
            onPress={currentStep < 5 ? goToNextStep : handleSubmit}
          >
            <Text className="text-gray-900 font-bold">
              {currentStep < 5 ? 'Continuer' : 'Publier'}
            </Text>
            {currentStep < 5 && (
              <Ionicons
                name="arrow-forward"
                size={20}
                color="#001215"
                className="ml-2"
              />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BackgroundWrapper>
  )
}

export default CreateEvent