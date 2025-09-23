import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native'
import React, { useState } from 'react'
import BackgroundWrapper from '@/components/BackgroundWrapper'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import Step1 from '@/components/CreateEventSteps/Step1'
import Step2 from '@/components/CreateEventSteps/Step2'
import Step3 from '@/components/CreateEventSteps/Step3'
import Step4 from '@/components/CreateEventSteps/Step4'
import Step5 from '@/components/CreateEventSteps/Step5'


const API_URL = "https://eventick.onrender.com";


const CreateEvent = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
    location: '',
    city: '',
    category: '',
    image: null as string | null,
    isPromo: false,
    promoDiscount: 0,
    promoEndDate: new Date(),
  })

  const [ticketTypes, setTicketTypes] = useState([
    { 
      id: '1', 
      type: 'Standard', 
      price: 0, 
      description: 'Accès standard à l\'événement', 
      totalTickets: 0,
      availableTickets: 0,
      available: true 
    },
  ])

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [showPromoEndDatePicker, setShowPromoEndDatePicker] = useState(false)

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

  const addTicketType = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const newId = (Date.now()).toString()
    setTicketTypes([
      ...ticketTypes,
      { 
        id: newId, 
        type: '', 
        price: 0, 
        description: '', 
        totalTickets: 0,
        availableTickets: 0,
        available: true 
      }
    ])
  }

  const removeTicketType = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter(type => type.id !== id))
    }
  }

  const updateTicketType = (id: string, field: string, value: any) => {
    setTicketTypes(ticketTypes.map(type => {
      if (type.id === id) {
        if (field === 'totalTickets') {
          return { 
            ...type, 
            [field]: value,
            availableTickets: value
          }
        }
        return { ...type, [field]: value }
      }
      return type
    }))
  }

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

  
  const handleSubmit = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setIsSubmitting(true)

    
    
    try {
      if (!eventData.title || !eventData.description || !eventData.location || 
          !eventData.city || !eventData.category || ticketTypes.length === 0) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
        setIsSubmitting(false);
        return;
      }

      const formattedTickets = ticketTypes.map(ticket => ({
        type: ticket.type,
        totalTickets: ticket.totalTickets,
        description: ticket.description,
        price: ticket.price,
        availableTickets: ticket.totalTickets, 
        available: ticket.available
      }));



      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour créer un événement");
        router.replace("/login");
        return;
      }

      const formattedDate = eventData.date.toISOString().split('T')[0];
      const formattedTime = eventData.startTime.toTimeString().split(' ')[0].substring(0, 5);

      const eventPayload = {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        date: formattedDate,
        time: formattedTime,
        image: eventData.image,
        category: eventData.category,
        city: eventData.city,
        ticket: formattedTickets
      };

      console.log("Envoi des données:", eventPayload);

      await axios.post(
        `${API_URL}/api/events`,
        eventPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert("Succès", "Événement créé avec succès !");
      router.replace("/(tabs-organisateur)/events");

    } catch (err: any) {
      console.error("Erreur détaillée:", err.response?.data || err.message);
      Alert.alert("Erreur", err.response?.data?.message || "Échec de la création de l'événement");
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

        <ProgressBar />

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
              } ${isSubmitting ? 'opacity-50' : ''}`}
            onPress={currentStep < 5 ? goToNextStep : handleSubmit}
            disabled={isSubmitting}
          >
            <Text className="text-gray-900 font-bold">
              {isSubmitting ? 'Traitement...' : currentStep < 5 ? 'Continuer' : 'Publier'}
            </Text>
            {currentStep < 5 && !isSubmitting && (
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