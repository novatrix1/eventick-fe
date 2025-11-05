import BackgroundWrapper from "@/components/BackgroundWrapper";
import Step1 from "@/components/CreateEventSteps/Step1";
import Step2 from "@/components/CreateEventSteps/Step2";
import Step3 from "@/components/CreateEventSteps/Step3";
import Step4 from "@/components/CreateEventSteps/Step4";
import Step5 from "@/components/CreateEventSteps/Step5";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "https://eventick.onrender.com";

interface EventData {
  title: string;
  description: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  location: string;
  city: string;
  wilaya?: string;
  moughataa?: string;
  category: string;
  image: string | null;
  isPromo: boolean;
  promoDiscount: number;
  promoEndDate: Date;
}

interface TicketType {
  id: string;
  type: string;
  price: number;
  description: string;
  totalTickets: number;
  availableTickets: number;
  available: boolean;
}

const UpdateEvent = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [eventData, setEventData] = useState<EventData>({
    title: "",
    description: "",
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
    location: "",
    city: "",
    category: "",
    image: null,
    isPromo: false,
    promoDiscount: 0,
    promoEndDate: new Date(),
  });

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      id: "1",
      type: "Standard",
      price: 0,
      description: "Accès standard à l'événement",
      totalTickets: 0,
      availableTickets: 0,
      available: true,
    },
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showPromoEndDatePicker, setShowPromoEndDatePicker] = useState(false);

  const getLocalDate = (date: Date) => {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate;
  };

  // Charger les données de l'événement existant
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Erreur", "Vous devez être connecté");
          router.replace("/login");
          return;
        }

        const response = await axios.get(`${API_URL}/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const event = response.data;
        console.log("Données de l'événement chargées:", event);

        // Formater les dates correctement en gérant le timezone
        const eventDate = new Date(event.date);

        // Convertir le temps en Date
        const [hours, minutes] = event.time.split(':');
        const startTime = new Date(eventDate);
        startTime.setHours(parseInt(hours), parseInt(minutes));

        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2);

        setEventData({
          title: event.title || "",
          description: event.description || "",
          date: getLocalDate(eventDate),
          startTime: getLocalDate(startTime),
          endTime: getLocalDate(endTime),
          location: event.location || "",
          city: event.city || "",
          wilaya: event.wilaya || "",
          moughataa: event.moughataa || "",
          category: event.category || "",
          image: event.image || null,
          isPromo: event.isPromo || false,
          promoDiscount: event.promoDiscount || 0,
          promoEndDate: event.promoEndDate ? getLocalDate(new Date(event.promoEndDate)) : getLocalDate(new Date()),
        });

        if (event.ticket && event.ticket.length > 0) {
          const formattedTickets: TicketType[] = event.ticket.map((ticket: any, index: number) => ({
            id: ticket._id || `ticket-${index}`,
            type: ticket.type || "",
            price: ticket.price || 0,
            description: ticket.description || "",
            totalTickets: ticket.totalTickets || 0,
            availableTickets: ticket.availableTickets || 0,
            available: ticket.available !== undefined ? ticket.available : true,
          }));
          setTicketTypes(formattedTickets);
        } else {
          setTicketTypes([{
            id: "1",
            type: "Standard",
            price: 0,
            description: "Accès standard à l'événement",
            totalTickets: 0,
            availableTickets: 0,
            available: true,
          }]);
        }

      } catch (error: any) {
        console.error("Erreur lors du chargement:", error);
        Alert.alert(
          "Erreur",
          error.response?.data?.message || "Impossible de charger l'événement"
        );
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || eventData.date;
    setShowDatePicker(Platform.OS === "ios");
    setEventData({ ...eventData, date: currentDate });
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || eventData.startTime;
    setShowStartTimePicker(Platform.OS === "ios");
    setEventData({ ...eventData, startTime: currentTime });
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || eventData.endTime;
    setShowEndTimePicker(Platform.OS === "ios");
    setEventData({ ...eventData, endTime: currentTime });
  };

  const handlePromoEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || eventData.promoEndDate;
    setShowPromoEndDatePicker(Platform.OS === "ios");
    setEventData({ ...eventData, promoEndDate: currentDate });
  };

  const addTicketType = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newId = Date.now().toString();
    setTicketTypes([
      ...ticketTypes,
      {
        id: newId,
        type: "",
        price: 0,
        description: "",
        totalTickets: 0,
        availableTickets: 0,
        available: true,
      },
    ]);
  };

  const removeTicketType = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((type) => type.id !== id));
    }
  };

  const updateTicketType = (id: string, field: string, value: any) => {
    setTicketTypes(
      ticketTypes.map((type) => {
        if (type.id === id) {
          if (field === "totalTickets") {
            const newTotalTickets = value;
            const currentSold = type.totalTickets - type.availableTickets;
            const newAvailableTickets = Math.max(0, newTotalTickets - currentSold);

            return {
              ...type,
              [field]: newTotalTickets,
              availableTickets: newAvailableTickets,
            };
          }
          return { ...type, [field]: value };
        }
        return type;
      })
    );
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEventData({ ...eventData, image: result.assets[0].uri });
    }
  };


 const handleSubmit = async () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setIsSubmitting(true);

  try {
    console.log("=== DÉBUT MISE À JOUR ===");

    if (
      !eventData.title ||
      !eventData.description ||
      !eventData.location ||
      !eventData.city ||
      !eventData.category ||
      ticketTypes.length === 0
    ) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      setIsSubmitting(false);
      return;
    }

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté");
      router.replace("/login");
      return;
    }

    const formatDateForAPI = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const formatTimeForAPI = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    const formattedDate = formatDateForAPI(eventData.date);
    const formattedTime = formatTimeForAPI(eventData.startTime);

    console.log("📤 Données préparées:", {
      title: eventData.title,
      date: formattedDate,
      time: formattedTime,
      location: eventData.location,
      city: eventData.city,
      category: eventData.category,
    });

    const hasNewImage =
      eventData.image &&
      typeof eventData.image === "string" &&
      !eventData.image.startsWith("http");

    let payload: any;
    let headers: any = {
      Authorization: `Bearer ${token}`,
    };

    if (hasNewImage) {
      payload = new FormData();
      payload.append("title", eventData.title);
      payload.append("description", eventData.description);
      payload.append("location", eventData.location);
      payload.append("date", formattedDate);
      payload.append("time", formattedTime);
      payload.append("category", eventData.category);
      payload.append("city", eventData.city);

      if (eventData.wilaya) payload.append("wilaya", eventData.wilaya);
      if (eventData.moughataa) payload.append("moughataa", eventData.moughataa);

      ticketTypes.forEach((ticket, index) => {
        payload.append(`ticket[${index}][type]`, ticket.type);
        payload.append(`ticket[${index}][totalTickets]`, ticket.totalTickets.toString());
        payload.append(`ticket[${index}][description]`, ticket.description);
        payload.append(`ticket[${index}][price]`, ticket.price.toString());
        payload.append(`ticket[${index}][availableTickets]`, ticket.availableTickets.toString());
        payload.append(`ticket[${index}][available]`, ticket.available.toString());
      });

      payload.append("image", {
        uri: eventData.image,
        type: "image/jpeg",
        name: "event-image.jpg",
      } as any);

      headers["Content-Type"] = "multipart/form-data";
    } 
    else {

      payload = {
        title: eventData.title,
        description: eventData.description,
        date: formattedDate,
        time: formattedTime,
        location: eventData.location,
        city: eventData.city,
        category: eventData.category,
        wilaya: eventData.wilaya,
        moughataa: eventData.moughataa,
        ticket: ticketTypes.map((t) => ({
          type: t.type,
          description: t.description,
          price: t.price,
          totalTickets: t.totalTickets,
          availableTickets: t.availableTickets,
          available: t.available,
        })),
      };

      headers["Content-Type"] = "application/json";
    }


    const response = await axios.put(`${API_URL}/api/events/${id}`, payload, {
      headers,
      timeout: 10000,
    });

  

    if (response.data.title === eventData.title) {
      Alert.alert("Succès", "Événement modifié avec succès !");
      router.replace("/(tabs-organisateur)/events");
    } else {
      Alert.alert("Attention", "La modification semble incomplète");
    }
  } catch (err: any) {
    console.error("Erreur détaillée:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });

    let errorMessage = "Échec de la modification de l'événement";
    if (err.response?.status === 403) {
      errorMessage = "Vous n'êtes pas autorisé à modifier cet événement";
    } else if (err.response?.status === 404) {
      errorMessage = "Événement non trouvé";
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }

    Alert.alert("Erreur", errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const goToNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const ProgressBar = () => {
    return (
      <View className="flex-row items-center justify-between mb-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <React.Fragment key={step}>
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${currentStep >= step
                ? "bg-teal-400"
                : "bg-white/10 border border-teal-400/50"
                }`}
            >
              <Text
                className={`font-bold ${currentStep >= step ? "text-gray-900" : "text-teal-400"}`}
              >
                {step}
              </Text>
            </View>
            {step < 5 && (
              <View
                className={`flex-1 h-1 mx-1 ${currentStep > step ? "bg-teal-400" : "bg-white/10"
                  }`}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Chargement de l'événement...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <ScrollView className="flex-1 px-4 pt-16 ">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#68f2f4" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold text-center flex-1">
            Modifier l'événement
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

        <View className="flex-row justify-between pb-20">
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
            className={`py-3 px-6 rounded-xl flex-row items-center ${currentStep < 5 ? "bg-teal-400" : "bg-amber-400"
              } ${isSubmitting ? "opacity-50" : ""}`}
            onPress={currentStep < 5 ? goToNextStep : handleSubmit}
            disabled={isSubmitting}
          >
            <Text className="text-gray-900 font-bold">
              {isSubmitting
                ? "Traitement..."
                : currentStep < 5
                  ? "Continuer"
                  : "Modifier"}
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
  );
};

export default UpdateEvent;