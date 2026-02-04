import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Share,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

type Organizer = {
  id: string;
  name: string;
  photoUrl: string;
  rating: number;
  eventsCount: number;
  bio: string;
  phone: string;
  email: string;
  website: string;
  certified: boolean;
  socials?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
};

type EventSummary = {
  id: string;
  title: string;
  date: string;
  image: string;
  price: string;
};

const organizerData: Organizer = {
  id: 'org-1',
  name: 'Association Culturelle Mauritanienne',
  photoUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  rating: 4.7,
  eventsCount: 42,
  bio:
    "L'Association Culturelle Mauritanienne organise des événements culturels pour promouvoir notre riche patrimoine. Forte d'une expérience de plusieurs années, elle rassemble artistes, artisans et passionnés autour d'initiatives mémorables.",
  phone: '+22236123456',
  email: 'contact@associationculturelle.mr',
  website: 'https://www.associationculturelle.mr',
  certified: true,
  socials: {
    facebook: 'https://www.facebook.com/associationculturelle',
    twitter: 'https://twitter.com/assoc_culturelle',
    instagram: 'https://instagram.com/associationculturelle',
    linkedin: 'https://linkedin.com/company/associationculturelle',
  },
};

const organizerEvents: EventSummary[] = [
  {
    id: 'evt-1',
    title: 'Festival des Dattes',
    date: '15 Septembre 2023',
    image: 'https://cdn.pixabay.com/photo/2020/01/15/17/38/fireworks-4768501_1280.jpg',
    price: '1500 MRO',
  },
  {
    id: 'evt-2',
    title: 'Salon de l’Artisanat',
    date: '10 Octobre 2023',
    image: 'https://cdn.pixabay.com/photo/2018/04/18/18/47/craft-3336397_1280.jpg',
    price: 'Gratuit',
  },
  {
    id: 'evt-3',
    title: 'Concert de Musique Folklorique',
    date: '05 Novembre 2023',
    image: 'https://cdn.pixabay.com/photo/2015/07/31/15/31/concert-869695_1280.jpg',
    price: '3000 MRO',
  },
];


const OrganizerProfileScreen = () => {
  const handleCall = () => {
    Linking.openURL(`tel:${organizerData.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${organizerData.email}`);
  };

  const handleWebsite = () => {
    Linking.openURL(organizerData.website);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez ${organizerData.name} et ses événements passionnants ! Plus d'infos sur : ${organizerData.website}`,
        url: organizerData.website,
        title: organizerData.name,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager pour le moment.');
    }
  };

  const openSocialLink = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const goToEvent = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  return (
    <BackgroundWrapper>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="h-64 relative bg-black/50">
          <Image
            source={{ uri: organizerData.photoUrl }}
            className="w-32 h-32 rounded-full absolute left-6 bottom-0 border-4 border-teal-400"
            resizeMode="cover"
          />
          <TouchableOpacity
            className="absolute top-14 left-4 bg-white/20 p-2 rounded-full"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className="absolute top-14 right-4 bg-white/20 p-2 rounded-full"
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={24} color="white" />
          </TouchableOpacity>

          <View className="absolute left-44 bottom-6 right-6">
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-3xl flex-shrink mr-2">
                {organizerData.name}
              </Text>
              {organizerData.certified && (
                <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
              )}
            </View>
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text className="text-white ml-2 text-lg">
                {organizerData.rating} / 5.0 ({organizerData.eventsCount} événements)
              </Text>
            </View>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-white text-lg font-semibold mb-2">À propos</Text>
          <Text className="text-gray-300 leading-relaxed">{organizerData.bio}</Text>
        </View>

        <View className="flex-row justify-around p-4 border-t border-b border-gray-700 bg-white/5 rounded-xl mx-4 mb-6">
          <TouchableOpacity
            className="items-center"
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={28} color="#68f2f4" />
            <Text className="text-teal-300 mt-1">Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={handleEmail}
            activeOpacity={0.7}
          >
            <Ionicons name="mail" size={28} color="#68f2f4" />
            <Text className="text-teal-300 mt-1">Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={handleWebsite}
            activeOpacity={0.7}
          >
            <Ionicons name="globe" size={28} color="#68f2f4" />
            <Text className="text-teal-300 mt-1">Site Web</Text>
          </TouchableOpacity>
        </View>

        {organizerData.socials && (
          <View className="px-4 mb-6">
            <Text className="text-white text-xl font-bold mb-3">Réseaux sociaux</Text>
            <View className="flex-row">
              {organizerData.socials.facebook && (
                <TouchableOpacity
                  onPress={() => openSocialLink(organizerData.socials!.facebook)}
                  activeOpacity={0.7}
                  accessibilityLabel="Facebook"
                  style={{ marginRight: 16 }}
                >
                  <FontAwesome name="facebook-square" size={36} color="#68f2f4" />
                </TouchableOpacity>
              )}
              {organizerData.socials.twitter && (
                <TouchableOpacity
                  onPress={() => openSocialLink(organizerData.socials!.twitter)}
                  activeOpacity={0.7}
                  accessibilityLabel="Twitter"
                  style={{ marginRight: 16 }}
                >
                  <FontAwesome name="twitter-square" size={36} color="#68f2f4" />
                </TouchableOpacity>
              )}
              {organizerData.socials.instagram && (
                <TouchableOpacity
                  onPress={() => openSocialLink(organizerData.socials!.instagram)}
                  activeOpacity={0.7}
                  accessibilityLabel="Instagram"
                  style={{ marginRight: 16 }}
                >
                  <FontAwesome name="instagram" size={36} color="#68f2f4" />
                </TouchableOpacity>
              )}
              {organizerData.socials.linkedin && (
                <TouchableOpacity
                  onPress={() => openSocialLink(organizerData.socials!.linkedin)}
                  activeOpacity={0.7}
                  accessibilityLabel="LinkedIn"
                >
                  <FontAwesome name="linkedin-square" size={36} color="#68f2f4" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}



        <View className="px-4 mb-10">
          <Text className="text-white text-xl font-bold mb-3">Événements organisés</Text>
          <FlatList
            data={organizerEvents}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="mr-4 bg-white/10 rounded-xl overflow-hidden"
                style={{ width: 180 }}
                onPress={() => goToEvent(item.id)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: item.image }}
                  className="w-full h-28"
                  resizeMode="cover"
                />
                <View className="p-2">
                  <Text className="text-white font-semibold text-lg" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-teal-300 mt-1">{item.date}</Text>
                  <Text className="text-white mt-1 font-bold">{item.price}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </BackgroundWrapper>
  );
};

export default OrganizerProfileScreen;
