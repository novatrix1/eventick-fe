import React, { memo, useState, useMemo } from 'react'; 
import { Step1Props } from "@/types/stepTypes";
import { View, Text, TextInput, TouchableOpacity, Image, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { categories } from "@/constants/categories";

const Step1 = memo(({ eventData, setEventData, pickImage }: Step1Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter(cat => 
      cat.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="p-4 border-b border-white/20 flex-row justify-between items-center"
      onPress={() => {
        setEventData({ ...eventData, category: item });
        setModalVisible(false);
        setSearchQuery('');
      }}
      activeOpacity={0.7}
    >
      <Text className="text-white text-lg">{item}</Text>
      {eventData.category === item && (
        <Ionicons name="checkmark-circle" size={24} color="#68f2f4" />
      )}
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View className="p-4 items-center justify-center">
      <Ionicons name="search-outline" size={40} color="#9ca3af" />
      <Text className="text-gray-400 mt-2 text-center">
        Aucune catégorie trouvée pour "{searchQuery}"
      </Text>
    </View>
  );

  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6">
      <Text className="text-white text-2xl font-extrabold mb-6">
        Étape 1/5 : Informations de base
      </Text>

      <View className="mb-8">
        <Text className="text-white text-xl font-semibold mb-3">
          {"Image de l'événement"}
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
            {"Titre de l'événement"}
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
          
          <TouchableOpacity
            className="bg-white/10 border border-teal-400/50 rounded-2xl p-5 flex-row justify-between items-center"
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              {eventData.category ? (
                <>
                  <Ionicons name="pricetag" size={20} color="#68f2f4" style={{ marginRight: 8 }} />
                  <Text className="text-white text-lg">{eventData.category}</Text>
                </>
              ) : (
                <Text className="text-gray-400 text-lg">Sélectionnez une catégorie</Text>
              )}
            </View>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={eventData.category ? "#68f2f4" : "white"} 
            />
          </TouchableOpacity>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
              setSearchQuery('');
            }}
          >
            <View className="flex-1 justify-end bg-black/70">
              <Animated.View 
                entering={FadeIn.duration(300)}
                className="bg-[#1a2d3d] rounded-t-3xl p-5 h-3/4"
              >
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-white text-2xl font-bold">Choisir une catégorie</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      setModalVisible(false);
                      setSearchQuery('');
                    }}
                    className="p-2"
                  >
                    <Ionicons name="close" size={28} color="white" />
                  </TouchableOpacity>
                </View>
                
                <View className="bg-white/10 rounded-xl px-4 py-3 flex-row items-center mb-4">
                  <Ionicons name="search" size={20} color="#9ca3af" />
                  <TextInput
                    className="flex-1 text-white text-lg ml-3"
                    placeholder="Rechercher une catégorie..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <FlatList
                  data={filteredCategories}
                  keyExtractor={(item) => item}
                  renderItem={renderCategoryItem}
                  ListEmptyComponent={ListEmptyComponent}
                  showsVerticalScrollIndicator={false}
                  className="mb-4"
                />
                
                <TouchableOpacity
                  className="bg-teal-500 p-4 rounded-xl items-center"
                  onPress={() => {
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <Text className="text-white text-lg font-semibold">Valider</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Modal>
        </View>
      </View>
    </Animated.View>
  );
});

Step1.displayName = "Step1";
export default Step1;