import React, { memo, useState, useMemo, useCallback, useRef } from 'react';
import { Step1Props } from "@/types/stepTypes";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { categories } from "@/constants/categories";
import * as ImagePicker from 'expo-image-picker';
import { any } from 'zod';

const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MAX_LENGTH = 500;

const Step1 = memo(({ eventData, setEventData }: Step1Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const descriptionInputRef = useRef<TextInput>(null);

  const isTitleValid = eventData.title.length >= 5;
  const isDescriptionValid = eventData.description.length >= 20;
  const isCategoryValid = !!eventData.category;
  const isImageValid = !!eventData.image;

  const pickImage = useCallback(async () => {
    try {
      Keyboard.dismiss();

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          "Permission requise",
          "L'accès à la galerie est nécessaire pour sélectionner une image.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: undefined,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];

        setEventData((prev : any) => ({
          ...prev,
          image: selectedImage.uri
        }));
      }
    } catch (error) {
      console.error("Erreur lors de la sélection d'image:", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de la sélection de l'image.",
        [{ text: "OK" }]
      );
    }
  }, [setEventData]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(cat =>
      cat.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const renderCategoryItem = useCallback(({ item }: { item: string }) => (
    <TouchableOpacity
      className="p-4 border-b border-white/20 flex-row justify-between items-center active:bg-white/5"
      onPress={() => {
        setEventData((prev : any) => ({ ...prev, category: item }));
        setModalVisible(false);
        setSearchQuery('');
      }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <Ionicons
          name="pricetag-outline"
          size={20}
          color="#68f2f4"
          style={{ marginRight: 12 }}
        />
        <Text className="text-white text-lg flex-1">{item}</Text>
      </View>
      {eventData.category === item && (
        <Ionicons name="checkmark-circle" size={24} color="#68f2f4" />
      )}
    </TouchableOpacity>
  ), [eventData.category]);

  const ListEmptyComponent = useCallback(() => (
    <View className="p-8 items-center justify-center">
      <Ionicons name="search-outline" size={48} color="#6b7280" />
      <Text className="text-gray-400 mt-4 text-center text-base">
        Aucune catégorie trouvée pour {"\n"}"{searchQuery}"
      </Text>
      <Text className="text-gray-500 mt-2 text-center text-sm">
        Essayez avec d'autres termes
      </Text>
    </View>
  ), [searchQuery]);

  const ModalHeader = useCallback(() => (
    <View className="flex-row justify-between items-center mb-5 pb-4 border-b border-white/20">
      <Text className="text-white text-2xl font-bold">Choisir une catégorie</Text>
      <TouchableOpacity
        onPress={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
        className="p-2 rounded-full bg-white/10"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
    </View>
  ), []);

  const SearchBar = useCallback(() => (
    <View className="bg-white/10 rounded-xl px-4 py-3 flex-row items-center mb-4">
      <Ionicons name="search" size={20} color="#9ca3af" />
      <TextInput
        className="flex-1 text-white text-lg ml-3"
        placeholder="Rechercher une catégorie..."
        placeholderTextColor="#9ca3af"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus={true}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity
          onPress={() => setSearchQuery('')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  ), [searchQuery]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="px-4 py-6 pb-10"
          >

            <View className="mb-6">
              <Text className="text-white text-2xl font-extrabold mb-2">
                Informations de base
              </Text>
              <Text className="text-gray-400 text-base">
                Étape 1/5 - Remplissez les détails essentiels
              </Text>
            </View>


            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white text-xl font-semibold">
                  Image de l'événement
                </Text>
                {!isImageValid && (
                  <Text className="text-orange-400 text-sm">Requis</Text>
                )}
              </View>

              <TouchableOpacity
                className={`border-2 border-dashed rounded-2xl h-56 items-center justify-center overflow-hidden ${isImageValid
                    ? 'border-teal-400/50 bg-teal-400/5'
                    : 'border-orange-400/50 bg-orange-400/5'
                  }`}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                {eventData.image ? (
                  <View className="w-full h-full relative">
                    <Image
                      source={{ uri: eventData.image }}
                      className="w-full h-full rounded-2xl"
                      resizeMode="cover"
                    />
                    <View className="absolute top-3 right-3 bg-black/70 rounded-full p-2">
                      <Ionicons name="camera" size={20} color="#68f2f4" />
                    </View>
                    <View className="absolute bottom-3 left-3 bg-black/70 rounded-full px-2 py-1">
                      <Text className="text-white text-xs">
                        ✓ Image sélectionnée
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View className="items-center p-6">
                    <Ionicons name="image-outline" size={56} color="#68f2f4" />
                    <Text className="text-teal-400 mt-3 text-lg font-medium text-center">
                      Ajouter une image
                    </Text>

                  </View>
                )}
              </TouchableOpacity>


              {eventData.image && (
                <View className="flex-row items-center mt-2 p-3 bg-teal-400/10 rounded-lg">
                  <Ionicons name="information-circle" size={16} color="#68f2f4" />
                  <Text className="text-teal-400 text-sm ml-2 flex-1">
                    Votre image a été acceptée. Elle sera automatiquement adaptée à l'affichage.
                  </Text>
                </View>
              )}
            </View>


            <View className="space-y-6">

              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-teal-400 text-lg font-medium">
                    Titre de l'événement
                  </Text>
                  <Text className={`text-sm ${isTitleValid ? 'text-green-400' : 'text-orange-400'
                    }`}>
                    {eventData.title.length}/{TITLE_MAX_LENGTH}
                  </Text>
                </View>
                <TextInput
                  className={`bg-white/10 text-white p-5 rounded-2xl text-lg border-2 ${isTitleValid ? 'border-green-400/30' : 'border-orange-400/30'
                    }`}
                  placeholder="Nommez votre événement..."
                  placeholderTextColor="#6b7280"
                  value={eventData.title}
                  onChangeText={text => setEventData((prev : any) => ({ ...prev, title: text }))}
                  maxLength={TITLE_MAX_LENGTH}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    descriptionInputRef.current?.focus();
                  }}
                  blurOnSubmit={false}
                />
                {!isTitleValid && eventData.title.length > 0 && (
                  <Text className="text-orange-400 text-sm mt-1">
                    Le titre doit contenir au moins 5 caractères
                  </Text>
                )}
              </View>

              {/* Champ Description */}
              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-teal-400 text-lg font-medium">
                    Description
                  </Text>
                  <Text className={`text-sm ${isDescriptionValid ? 'text-green-400' : 'text-orange-400'
                    }`}>
                    {eventData.description.length}/{DESCRIPTION_MAX_LENGTH}
                  </Text>
                </View>
                <TextInput
                  ref={descriptionInputRef}
                  className={`bg-white/10 text-white p-5 rounded-2xl text-lg h-36 border-2 ${isDescriptionValid ? 'border-green-400/30' : 'border-orange-400/30'
                    }`}
                  placeholder="Décrivez votre événement en détail..."
                  placeholderTextColor="#6b7280"
                  multiline
                  textAlignVertical="top"
                  value={eventData.description}
                  onChangeText={text => setEventData((prev : any) => ({ ...prev, description: text }))}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                {!isDescriptionValid && eventData.description.length > 0 && (
                  <Text className="text-orange-400 text-sm mt-1">
                    La description doit contenir au moins 20 caractères
                  </Text>
                )}
              </View>

              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-teal-400 text-lg font-medium">
                    Catégorie
                  </Text>
                  {!isCategoryValid && (
                    <Text className="text-orange-400 text-sm">Requis</Text>
                  )}
                </View>

                <TouchableOpacity
                  className={`bg-white/10 rounded-2xl p-5 flex-row justify-between items-center border-2 ${isCategoryValid ? 'border-green-400/30' : 'border-orange-400/30'
                    }`}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center flex-1">
                    {eventData.category ? (
                      <>
                        <Ionicons name="pricetag" size={20} color="#68f2f4" style={{ marginRight: 12 }} />
                        <Text className="text-white text-lg">{eventData.category}</Text>
                      </>
                    ) : (
                      <Text className="text-gray-400 text-lg">Sélectionnez une catégorie</Text>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={eventData.category ? "#68f2f4" : "#9ca3af"}
                  />
                </TouchableOpacity>
              </View>
            </View>


            <View className="h-20" />
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-end bg-black/70">
              <Animated.View
                entering={FadeIn.duration(300)}
                className="bg-[#1a2d3d] rounded-t-3xl p-5 h-4/5"
              >
                <ModalHeader />
                <SearchBar />

                <FlatList
                  data={filteredCategories}
                  keyExtractor={(item) => item}
                  renderItem={renderCategoryItem}
                  ListEmptyComponent={ListEmptyComponent}
                  showsVerticalScrollIndicator={false}
                  className="mb-4 flex-1"
                  initialNumToRender={15}
                  maxToRenderPerBatch={20}
                  windowSize={10}
                  keyboardShouldPersistTaps="handled"
                />

                <TouchableOpacity
                  className="bg-teal-500 p-4 rounded-xl items-center active:bg-teal-600"
                  onPress={() => {
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-lg font-semibold">
                    {eventData.category ? 'Valider la sélection' : 'Fermer'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
});

Step1.displayName = "Step1";
export default Step1;