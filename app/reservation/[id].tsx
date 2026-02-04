import BackgroundWrapper from "@/components/BackgroundWrapper";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import { SafeAreaView } from "react-native-safe-area-context";


import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const phoneNumberSchema = z
  .string()
  .regex(/^[0-9]+$/, "Le numéro doit contenir uniquement des chiffres");
const transactionIdSchema = z.string().min(1, "L'ID de transaction est requis");

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  city: string;
  image: string | null;
}

interface TicketType {
  _id: string;
  type: string;
  price: number;
  description: string;
}

interface Ticket {
  id: string;
  ticketRef: string;
  ticketNumber: number;
  event: string;
  ticketType: string;
  ticketTypeId: string;
  price: number;
  encryptedData: string;
  status: string;
}

interface BookingResponse {
  message: string;
  bookingRef: string;
  totalPrice: number;
  quantity: number;
  tickets: Ticket[] | Ticket;
}

interface PaymentMethodData {
  id: PaymentMethod;
  name: string;
  icon: string;
  requirements: string;
  image: any;
  receiverNumber: string;
}

type PaymentMethod = "Bankily" | "Masrvi" | "Sedad" | "Bimbank";

interface SearchParams {
  id?: string;
  ticketTypeId?: string;
  quantity?: string;
  price?: string;
  eventTitle?: string;
  eventDate?: string;
}

const paymentMethodsData: PaymentMethodData[] = [
  {
    id: "Bankily",
    name: "Bankily",
    icon: "phone-portrait-outline",
    requirements: "Paiement via l'application Bankily",
    image: require("@/assets/payment/bankily.png"),
    receiverNumber: "34326830",
  },
  {
    id: "Masrvi",
    name: "Masrvi",
    icon: "phone-portrait-outline",
    requirements: "Paiement via l'application Masrvi",
    image: require("@/assets/payment/masrvi.png"),
    receiverNumber: "45454545",
  },
  {
    id: "Bimbank",
    name: "BimBank",
    icon: "phone-portrait-outline",
    requirements: "Paiement via l'application BimBank",
    image: require("@/assets/payment/bimbank.png"),
    receiverNumber: "56565656",
  },
];

const useEventDetails = (eventId?: string, ticketTypeId?: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketType, setTicketType] = useState<TicketType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventDetails = useCallback(async () => {
    if (!eventId) {
      setError("ID d'événement manquant");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/events/${eventId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 10000,
      });

      setEvent(response.data);

      if (response.data.ticket && response.data.ticket.length > 0) {
        const selectedTicket = response.data.ticket.find(
          (t: TicketType) => t._id === ticketTypeId
        );
        if (selectedTicket) {
          setTicketType(selectedTicket);
        } else {
          setError("Type de billet non trouvé");
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Erreur réseau";
      setError(errorMessage);
      console.error("Error fetching event details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, ticketTypeId]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  return { event, ticketType, isLoading, error, refetch: fetchEventDetails };
};

const ReservationScreen = () => {
const params = useLocalSearchParams() as unknown as SearchParams;

  const eventId = params.id;
  const ticketTypeId = params.ticketTypeId;
  const quantity = parseInt(params.quantity || "1", 10);
  const price = parseFloat(params.price || "0");

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Bankily");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionID, setTransactionID] = useState("");
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [receiverNumber, setReceiverNumber] = useState("34326830");
  const [bookingData, setBookingData] = useState<BookingResponse | null>(null);
  const [formErrors, setFormErrors] = useState<{
    senderNumber?: string;
    transactionID?: string;
  }>({});

  const scrollViewRef = useRef<ScrollView>(null);

  const { event, ticketType, isLoading, error } = useEventDetails(
    eventId,
    ticketTypeId
  );

  useEffect(() => {
    const selectedMethod = paymentMethodsData.find(
      (method) => method.id === paymentMethod
    );
    if (selectedMethod) {
      setReceiverNumber(selectedMethod.receiverNumber);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (error && !isLoading) {
      Alert.alert("Erreur", error);
    }
  }, [error, isLoading]);

  // Calculations
  const totalPrice = ticketType
    ? ticketType.price * quantity
    : price * quantity;

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      scrollToTop();
    } else if (currentStep === 3) {
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

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Vous devez autoriser l'accès à la galerie pour téléverser une image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setPaymentProof(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image");
    }
  };

  const validateStep3 = (): boolean => {
    const errors: { senderNumber?: string; transactionID?: string } = {};

    try {
      phoneNumberSchema.parse(senderNumber);
    } catch (e) {
      errors.senderNumber =
  e instanceof z.ZodError ? e.issues[0].message : "Numéro invalide";

    }

    try {
      transactionIdSchema.parse(transactionID);
    } catch (e) {
      errors.transactionID =
  e instanceof z.ZodError ? e.issues[0].message : "ID de transaction requis";

    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getTicketIdsFromBooking = (
    bookingResult: BookingResponse
  ): string[] => {
    console.log("Structure complète du booking:", bookingResult);

    if (!bookingResult.tickets) {
      console.error("Aucun ticket trouvé dans la réponse de booking");
      return [];
    }

    if (Array.isArray(bookingResult.tickets)) {
      console.log("Tickets sous forme de tableau:", bookingResult.tickets);
      return bookingResult.tickets.map((ticket) => ticket.id);
    } else if (
      typeof bookingResult.tickets === "object" &&
      bookingResult.tickets.id
    ) {
      console.log("Ticket unique:", bookingResult.tickets);
      return [bookingResult.tickets.id];
    } else {
      console.error("Structure de tickets inattendue:", bookingResult.tickets);
      return [];
    }
  };

  const createBooking = async (): Promise<BookingResponse | null> => {
    if (!eventId || !ticketTypeId) {
      Alert.alert("Erreur", "Informations de réservation incomplètes");
      return null;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert(
          "Erreur",
          "Vous devez être connecté pour effectuer une réservation"
        );
        return null;
      }

      const bookingRequestData = {
        eventId,
        ticketTypeId,
        quantity,
        paymentMethod,
      };

      console.log("Données envoyées pour la réservation:", bookingRequestData);

      const response = await axios.post<BookingResponse>(
        `${API_URL}/api/tickets/book`,
        bookingRequestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      console.log("Réponse de réservation reçue:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la réservation:", error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : "Erreur réseau";

      Alert.alert("Erreur de réservation", errorMessage);
      return null;
    }
  };

  const handlePayment = async () => {
    if (!acceptedTerms) {
      Alert.alert("Veuillez accepter les conditions générales");
      return;
    }

    if (!validateStep3()) {
      return;
    }

    if (!paymentProof) {
      Alert.alert("Veuillez téléverser une preuve de paiement");
      return;
    }

    setIsProcessing(true);

    try {
      const bookingResult = await createBooking();
      if (!bookingResult) {
        setIsProcessing(false);
        return;
      }

      setBookingData(bookingResult);

      const ticketIdsFromBooking = getTicketIdsFromBooking(bookingResult);

      if (ticketIdsFromBooking.length === 0) {
        Alert.alert("Aucun ticket créé dans la réservation");
        setIsProcessing(false);
        return;
      }

      console.log("IDs de tickets à envoyer:", ticketIdsFromBooking);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erreur", "Session expirée");
        setIsProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append("paymentType", paymentMethod);
      formData.append("amount", totalPrice.toString());
      formData.append("receiver", "68a26e2b73e6cc96dfcdf272");
      formData.append("receiverNumber", receiverNumber);
      formData.append("senderNumber", senderNumber);
      formData.append("event", eventId!);

      const ticketsArray = Array.isArray(ticketIdsFromBooking)
        ? ticketIdsFromBooking
        : [ticketIdsFromBooking];

      formData.append("ticket", JSON.stringify(ticketsArray));

      formData.append("transactionID", transactionID);

      if (paymentProof) {
        formData.append("paymentProof", {
          uri: paymentProof,
          name: "payment_proof.jpg",
          type: "image/jpeg",
        } as any);
      }

      console.log("les données du reservation : ", formData);
      const response = await axios.post(
        `${API_URL}/api/payments/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );

      console.log("Réponse du paiement:", response.data);

      if (response.status === 201) {
        setConfirmationNumber(
          response.data.payment?._id || `temp_${Date.now()}`
        );
        setIsProcessing(false);
        setIsPending(true);
      } else {
        throw new Error(response.data.message || "Erreur lors du paiement");
      }
    } catch (error: any) {
      console.error("Payment error détaillé:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : "Erreur réseau";

      Alert.alert("Erreur de paiement", errorMessage);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ec673b" />
          <Text className="text-white mt-4">Chargement des détails...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  if (error && !event) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-white text-xl text-center mt-4 mb-8">
            {error}
          </Text>
          <TouchableOpacity
            className="bg-[#ec673b] py-4 px-8 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-bold text-lg">Retour</Text>
          </TouchableOpacity>
        </View>
      </BackgroundWrapper>
    );
  }

  if (isPending) {
    return (
      <BackgroundWrapper>
        <SafeAreaView className="flex-1" edges={["top"]}>
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
                Votre paiement pour {event?.title} est en cours de vérification.
              </Text>

              <View className="bg-white/10 rounded-xl p-6 w-full mb-8">
                <Text className="text-white font-bold text-center mb-3 text-lg">
                  Numéro de confirmation
                </Text>
                <Text className="text-teal-400 text-center text-2xl font-bold">
                  #{confirmationNumber}
                </Text>
                {bookingData && (
                  <Text className="text-white text-center mt-3 text-sm">
                    Référence de réservation: {bookingData.bookingRef}
                  </Text>
                )}
              </View>

              <Text className="text-gray-400 text-center text-base mt-6">
                Merci pour votre patience. Votre réservation sera validée après
                vérification de votre paiement.
              </Text>

              <TouchableOpacity
                className="mt-8 bg-[#ec673b] py-4 px-8 rounded-full"
                onPress={() => router.replace("/(tabs-client)/ticket")}
              >
                <Text className="text-white font-bold text-lg">
                  Voir mes billets
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1">
        <View className="flex-row justify-between items-center px-6 pt-6">
          <TouchableOpacity
            onPress={prevStep}
            disabled={currentStep === 1}
            className={`p-3 rounded-full ${currentStep === 1 ? "opacity-30" : "bg-white/10"}`}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={currentStep === 1 ? "#9CA3AF" : "#68f2f4"}
            />
          </TouchableOpacity>

          <Text className="text-white font-bold text-lg">
            Étape {currentStep}/3
          </Text>

          <View className="w-12" />
        </View>

        <View className="px-6 mt-4">
          <View className="h-1 bg-white/10 rounded-full">
            <View
              className="h-1 bg-teal-400 rounded-full"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Step 1: Summary */}
          {currentStep === 1 && event && (
            <>
              <Text className="text-white text-2xl font-bold mb-8 text-center">
                Récapitulatif
              </Text>

              <View className="bg-white/10 rounded-2xl p-6 mb-8">
                <Text className="text-white font-bold text-xl mb-4">
                  Événement
                </Text>
                <View className="flex-row items-center mb-6">
                  {event.image ? (
                    <Image
                      source={{ uri: event.image }}
                      className="w-20 h-20 rounded-xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-20 h-20 rounded-xl bg-teal-400/20 items-center justify-center">
                      <Ionicons
                        name="image-outline"
                        size={30}
                        color="#68f2f4"
                      />
                    </View>
                  )}
                  <View className="ml-5 flex-1">
                    <Text
                      className="text-white font-bold text-lg"
                      numberOfLines={2}
                    >
                      {event.title}
                    </Text>
                    <Text className="text-gray-400 text-base mt-2">
                      {new Date(event.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Text className="text-gray-400 text-base">
                      {event.location}, {event.city}
                    </Text>
                  </View>
                </View>

                <View className="border-t border-white/10 pt-5">
                  <View className="flex-row justify-between mb-4 py-2 border-b border-white/10">
                    <Text className="text-gray-400 text-base">
                      Type de billet
                    </Text>
                    <Text className="text-white text-base font-medium">
                      {ticketType?.type || "Standard"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-4 py-2 border-b border-white/10">
                    <Text className="text-gray-400 text-base">Quantité</Text>
                    <Text className="text-white text-base font-medium">
                      {quantity}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-4 py-2 border-b border-white/10">
                    <Text className="text-gray-400 text-base">
                      Prix unitaire
                    </Text>
                    <Text className="text-white text-base font-medium">
                      {(ticketType?.price || price).toLocaleString("fr-FR")} MRO
                    </Text>
                  </View>
                  <View className="flex-row justify-between mt-5 pt-5 border-t border-white/20">
                    <Text className="text-gray-400 font-bold text-lg">
                      Total
                    </Text>
                    <Text className="text-teal-400 font-bold text-xl">
                      {totalPrice.toLocaleString("fr-FR")} MRO
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Text className="text-white text-2xl font-bold mb-8 text-center">
                Méthode de paiement
              </Text>

              <View className="mb-8">
                {paymentMethodsData.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    className={`p-5 rounded-2xl mb-4 flex-row items-center ${
                      paymentMethod === method.id
                        ? "bg-teal-400 border-2 border-teal-400"
                        : "bg-white/10 border border-white/10"
                    }`}
                    onPress={() => setPaymentMethod(method.id)}
                  >
                    <Image
                      source={method.image}
                      className="w-10 h-10"
                      resizeMode="contain"
                    />
                    <View className="ml-4 flex-1">
                      <Text
                        className={`font-bold text-lg ${
                          paymentMethod === method.id
                            ? "text-gray-900"
                            : "text-white"
                        }`}
                      >
                        {method.name}
                      </Text>
                      <Text
                        className={`text-sm ${
                          paymentMethod === method.id
                            ? "text-gray-700"
                            : "text-gray-400"
                        }`}
                      >
                        {method.requirements}
                      </Text>
                    </View>
                    <Ionicons
                      name={
                        paymentMethod === method.id
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={24}
                      color={
                        paymentMethod === method.id ? "#001215" : "#9CA3AF"
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {currentStep === 3 && (
            <>
              <Text className="text-white text-2xl font-bold mb-8 text-center">
                Informations de paiement
              </Text>

              <View className="bg-white/10 rounded-2xl p-6 mb-8">
                <Text className="text-white font-bold text-xl mb-4">
                  Instructions
                </Text>
                <Text className="text-gray-400 text-base mb-4">
                  Veuillez effectuer un transfert de{" "}
                  <Text className="text-teal-400 font-bold">
                    {totalPrice.toLocaleString("fr-FR")} MRO
                  </Text>{" "}
                  vers le numéro suivant :
                </Text>

                <View className="bg-teal-400/20 rounded-xl p-4 mb-6">
                  <Text className="text-teal-400 text-2xl font-bold text-center">
                    {receiverNumber}
                  </Text>
                </View>

                <Text className="text-gray-400 text-base mb-2">
                  Méthode:{" "}
                  <Text className="text-white font-medium">
                    {paymentMethod.toUpperCase()}
                  </Text>
                </Text>
                <Text className="text-gray-400 text-base">
                  Après le transfert, veuillez remplir les informations
                  ci-dessous et téléverser une capture {"d'écran"} de la
                  transaction.
                </Text>
              </View>

              <View className="bg-white/10 rounded-2xl p-6 mb-8">
                <Text className="text-white font-bold text-xl mb-4">
                  Vos informations
                </Text>

                <View className="mb-4">
                  <Text className="text-gray-400 text-base mb-2">
                    Votre numéro
                  </Text>
                  <TextInput
                    className={`bg-white/5 border rounded-xl p-4 text-white text-base ${
                      formErrors.senderNumber
                        ? "border-red-500"
                        : "border-white/10"
                    }`}
                    placeholder="Entrez votre numéro"
                    placeholderTextColor="#9CA3AF"
                    value={senderNumber}
                    onChangeText={(text) => {
                      setSenderNumber(text);
                      if (formErrors.senderNumber) {
                        setFormErrors((prev) => ({
                          ...prev,
                          senderNumber: undefined,
                        }));
                      }
                    }}
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                  {formErrors.senderNumber && (
                    <Text className="text-red-400 text-sm mt-1">
                      {formErrors.senderNumber}
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="text-gray-400 text-base mb-2">
                    ID de transaction
                  </Text>
                  <TextInput
                    className={`bg-white/5 border rounded-xl p-4 text-white text-base ${
                      formErrors.transactionID
                        ? "border-red-500"
                        : "border-white/10"
                    }`}
                    placeholder="Entrez l'ID de transaction"
                    placeholderTextColor="#9CA3AF"
                    value={transactionID}
                    onChangeText={(text) => {
                      setTransactionID(text);
                      if (formErrors.transactionID) {
                        setFormErrors((prev) => ({
                          ...prev,
                          transactionID: undefined,
                        }));
                      }
                    }}
                    maxLength={50}
                  />
                  {formErrors.transactionID && (
                    <Text className="text-red-400 text-sm mt-1">
                      {formErrors.transactionID}
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="text-gray-400 text-base mb-2">
                    Preuve de paiement
                  </Text>
                  <TouchableOpacity
                    className="bg-white/5 border border-white/10 rounded-xl p-4 items-center"
                    onPress={pickImage}
                  >
                    <Ionicons
                      name={
                        paymentProof ? "checkmark-circle" : "camera-outline"
                      }
                      size={32}
                      color={paymentProof ? "#10b981" : "#68f2f4"}
                    />
                    <Text
                      className={`text-base mt-2 ${paymentProof ? "text-teal-400" : "text-white"}`}
                    >
                      {paymentProof
                        ? "Image sélectionnée"
                        : "Téléverser une capture"}
                    </Text>
                  </TouchableOpacity>
                  {paymentProof && (
                    <Image
                      source={{ uri: paymentProof }}
                      className="w-full h-40 rounded-xl mt-4"
                      resizeMode="contain"
                    />
                  )}
                </View>
              </View>

              <View className="flex-row items-start mb-8">
                <TouchableOpacity
                  className={`rounded-xl w-7 h-7 items-center justify-center mr-4 mt-1 ${
                    acceptedTerms ? "bg-teal-400" : "bg-white/10"
                  }`}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                >
                  {acceptedTerms && (
                    <Ionicons name="checkmark" size={20} color="#001215" />
                  )}
                </TouchableOpacity>
                <Text className="text-gray-400 flex-1 text-base">
                  {" J'accepte"} les conditions générales de vente et confirme
                  que {"j'ai"} pris connaissance de la politique d'annulation et
                  de remboursement.
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        <View className="p-6 bg-black/50 flex-row">
          {currentStep > 1 && (
            <TouchableOpacity
              className="py-5 rounded-xl items-center flex-1 mr-3 bg-white/10"
              onPress={prevStep}
              disabled={isProcessing}
            >
              <Text className="text-white font-bold text-base">Précédent</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className={`py-5 rounded-xl items-center ${
              currentStep === 1 ? "flex-1" : "flex-1 ml-3"
            } ${isProcessing ? "bg-gray-500" : "bg-[#ec673b]"}`}
            onPress={nextStep}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                {currentStep === 3 ? "Confirmer le paiement" : "Continuer"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default ReservationScreen;
