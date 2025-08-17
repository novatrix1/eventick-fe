import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

// 🟩 TYPES
type Promotion = {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  originalPrice: string;
  category: string;
  image: string;
  discountPercentage: number;
  endDate: string;
  description: string;
};

// 🟩 DONNÉES TEMPORAIRES (identiques à ton exemple)
const promotions: Promotion[] = [
  { 
    id: '1', 
    title: 'Festival des Dattes', 
    date: '15 Sept 2023', 
    location: 'Nouakchott', 
    price: '1500 MRO', 
    originalPrice: '2000 MRO',
    category: 'culture', 
    image: 'https://cdn.pixabay.com/photo/2020/01/15/17/38/fireworks-4768501_1280.jpg',
    discountPercentage: 25,
    endDate: '2026-09-10T23:59:59', // ISO string
    description: "Profitez d'une réduction exceptionnelle pour le Festival des Dattes, l'événement culinaire le plus attendu de l'année !"
  },
  { 
    id: '2', 
    title: 'Match de Football VIP', 
    date: '20 Sept 2023', 
    location: 'Nouadhibou', 
    price: '3000 MRO', 
    originalPrice: '5000 MRO',
    category: 'sport', 
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    discountPercentage: 40,
    endDate: '2025-09-15T23:59:59',
    description: "Accès VIP avec buffet et rencontre avec les joueurs. Offre limitée aux 100 premiers billets !"
  },
  { 
    id: '3', 
    title: 'Conférence Tech Premium', 
    date: '25 Sept 2023', 
    location: 'Atar', 
    price: '750 MRO', 
    originalPrice: '1500 MRO',
    category: 'business', 
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80',
    discountPercentage: 50,
    endDate: '2023-09-18T23:59:59',
    description: "Accès premium avec ateliers pratiques et matériel inclus. Parfait pour les entrepreneurs tech."
  },
  { 
    id: '4', 
    title: 'Concert Traditionnel', 
    date: '30 Sept 2023', 
    location: 'Kaédi', 
    price: '2000 MRO', 
    originalPrice: '3000 MRO',
    category: 'concerts', 
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    discountPercentage: 33,
    endDate: '2023-09-22T23:59:59',
    description: "Découvrez les meilleurs artistes traditionnels avec cette offre spéciale. Places limitées !"
  },
  { 
    id: '5', 
    title: 'Retraite Spirituelle', 
    date: '5 Oct 2023', 
    location: 'Kiffa', 
    price: '5000 MRO', 
    originalPrice: '7500 MRO',
    category: 'religion', 
    image: 'https://cdn.pixabay.com/photo/2015/12/05/06/20/kid-1077793_1280.jpg',
    discountPercentage: 33,
    endDate: '2023-09-25T23:59:59',
    description: "Expérience spirituelle complète avec hébergement et repas inclus. Réservez tôt pour garantir votre place."
  },
];

// Parse "1500 MRO" -> 1500
const parsePrice = (priceStr: string) => {
  const parsed = parseInt(priceStr.replace(/\D/g, ''), 10);
  return isNaN(parsed) ? 0 : parsed;
};

// Calcule le temps restant
const calculateTimeLeft = (endDate: string) => {
  const diff = new Date(endDate).getTime() - Date.now();

  if (diff <= 0) return { expired: true };

  return {
    expired: false,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
  };
};

const PromotionCard = ({ promo, onPress }: { promo: Promotion; onPress: () => void }) => {
  const timeLeft = calculateTimeLeft(promo.endDate);

  return (
    <TouchableOpacity
      className="bg-white/10 rounded-2xl mb-5 overflow-hidden shadow-md"
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View className="flex-row">
        <Image
          source={{ uri: promo.image }}
          className="w-28 h-28 rounded-l-2xl"
          resizeMode="cover"
        />
        <View className="flex-1 p-4 justify-between">
          <View>
            <Text className="text-white font-semibold text-lg mb-1 truncate">{promo.title}</Text>
            <View className="flex-row items-center space-x-2 mb-1">
              <Ionicons name="calendar" size={16} color="#38bdf8" />
              <Text className="text-sky-300 text-xs">{promo.date}</Text>
            </View>
            <View className="flex-row items-center space-x-2 mb-3">
              <Ionicons name="location" size={16} color="#38bdf8" />
              <Text className="text-sky-300 text-xs">{promo.location}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold text-lg">{promo.price}</Text>
              <Text className="text-gray-400 text-xs line-through">{promo.originalPrice}</Text>
            </View>
            <View className="bg-red-600 px-3 py-1 rounded-full shadow-sm">
              <Text className="text-white text-xs font-semibold">-{promo.discountPercentage}%</Text>
            </View>
          </View>
        </View>
      </View>

      {timeLeft.expired ? (
        <View className="bg-red-900/80 py-2 flex-row justify-center items-center space-x-2">
          <Ionicons name="close-circle" size={16} color="#f87171" />
          <Text className="text-red-400 text-xs font-semibold">Offre expirée</Text>
        </View>
      ) : (
        <View className="bg-black/50 py-2 flex-row justify-center items-center space-x-2">
          <Ionicons name="time" size={16} color="#fde68a" />
          <Text className="text-yellow-300 text-xs font-semibold">
            {timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}m restantes
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const FeaturedPromotion = ({ promo, onPress }: { promo: Promotion; onPress: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const savedAmount =
    parsePrice(promo.originalPrice) - parsePrice(promo.price);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
      className="mb-8"
    >
      <Text className="text-white text-2xl font-extrabold mb-4">Offre vedette</Text>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        className="rounded-3xl overflow-hidden shadow-lg"
      >
        <Image
          source={{ uri: promo.image }}
          className="w-full h-56"
          resizeMode="cover"
        />

        {/* Overlay haut */}
        <View className="absolute top-0 left-0 right-0 p-4 flex-row justify-between bg-gradient-to-b from-black/70 to-transparent">
          <View className="bg-red-600 px-4 py-1 rounded-full shadow">
            <Text className="text-white font-semibold text-sm">-{promo.discountPercentage}%</Text>
          </View>
          <View className="bg-teal-400 px-4 py-1 rounded-full shadow">
            <Text className="text-gray-900 font-bold text-sm">
              ÉCONOMISEZ {savedAmount} MRO
            </Text>
          </View>
        </View>

        {/* Overlay bas */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <Text className="text-white text-2xl font-bold">{promo.title}</Text>
          <Text className="text-teal-400 text-sm">
            {promo.date} • {promo.location}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="mt-5 px-3">
        <Text className="text-gray-300 mb-4">{promo.description}</Text>

        <View className="flex-row justify-between items-center bg-white/10 rounded-xl p-5 shadow-md">
          <View>
            <Text className="text-white font-extrabold text-2xl">{promo.price}</Text>
            <Text className="text-gray-400 text-sm line-through">{promo.originalPrice}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-teal-400 px-8 py-3 rounded-2xl shadow-md"
          >
            <Text className="text-gray-900 font-bold text-lg">Réserver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const PromotionsScreen = () => {
  const navigation = useNavigation();
  const [featuredPromo, setFeaturedPromo] = useState<Promotion | null>(null);
  const [otherPromos, setOtherPromos] = useState<Promotion[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFeaturedPromo(promotions[0]);
      setOtherPromos(promotions.slice(1));
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BackgroundWrapper>
      <ScrollView className="flex-1 px-5 pt-16" showsVerticalScrollIndicator={false}>
        <StatusBar style="light" />

        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#38bdf8" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-extrabold">Offres spéciales</Text>
          <TouchableOpacity>
            <Ionicons name="gift" size={26} color="#38bdf8" />
          </TouchableOpacity>
        </View>

        {/* Introduction */}
        <View className="bg-teal-500/20 rounded-3xl p-6 mb-8 shadow-inner">
          <Text className="text-white text-xl font-bold mb-3">
            Économisez sur les meilleurs événements
          </Text>
          <Text className="text-teal-300 text-base">
            Profitez de réductions exclusives pour une durée limitée. Dépêchez-vous, ces offres expirent bientôt !
          </Text>
        </View>

        {/* Offre vedette */}
        {featuredPromo && (
          <FeaturedPromotion
            promo={featuredPromo}
            onPress={() => navigation.navigate('EventDetail', { eventId: featuredPromo.id })}
          />
        )}

        {/* Autres offres */}
        <Text className="text-white text-2xl font-extrabold mb-5">Autres offres</Text>

        {otherPromos.length > 0 ? (
          <FlatList
            data={otherPromos}
            renderItem={({ item }) => (
              <PromotionCard
                promo={item}
                onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="pricetags" size={56} color="#64748b" />
            <Text className="text-gray-500 mt-5 text-lg font-medium">
              Aucune autre offre disponible actuellement
            </Text>
          </View>
        )}

        {/* Section info */}
        <View className="bg-white/10 rounded-3xl p-6 mt-10 mb-20 shadow-lg">
          <Text className="text-white font-extrabold text-xl mb-6">
            Comment fonctionnent nos offres spéciales ?
          </Text>

          <View className="flex-row items-start mb-5 space-x-4">
            <View className="bg-teal-400 rounded-full p-3">
              <Ionicons name="time" size={20} color="#001215" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold mb-1">Durée limitée</Text>
              <Text className="text-teal-300 text-sm leading-relaxed">
                Chaque offre a une date d'expiration. Réservez avant la fin du compte à rebours pour profiter du prix réduit.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start mb-5 space-x-4">
            <View className="bg-teal-400 rounded-full p-3">
              <Ionicons name="ticket" size={20} color="#001215" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold mb-1">Places limitées</Text>
              <Text className="text-teal-300 text-sm leading-relaxed">
                Certaines offres sont disponibles en quantité limitée. Premiers arrivés, premiers servis !
              </Text>
            </View>
          </View>

          <View className="flex-row items-start space-x-4">
            <View className="bg-teal-400 rounded-full p-3">
              <Ionicons name="refresh" size={20} color="#001215" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold mb-1">Nouvelles offres régulières</Text>
              <Text className="text-teal-300 text-sm leading-relaxed">
                Consultez régulièrement cette section pour découvrir les nouvelles promotions.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </BackgroundWrapper>
  );
};

export default PromotionsScreen;
