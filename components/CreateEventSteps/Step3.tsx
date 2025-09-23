import React, { memo, useState, useMemo } from 'react'; 
import { Step3Props } from "@/types/stepTypes";
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { mauritaniaCities } from "@/constants/cities";

const Step3 = memo(({ eventData, setEventData, formatDate }: Step3Props) => {
  const [modalStep, setModalStep] = useState<'wilaya' | 'moughataa' | 'commune' | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [selectedMoughataa, setSelectedMoughataa] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const wilayas = useMemo(() => {
    const uniqueWilayas = Array.from(new Set(mauritaniaCities.map(city => city.Wilaya)));
    return uniqueWilayas.sort();
  }, []);

  const moughataas = useMemo(() => {
    if (!selectedWilaya) return [];
    const uniqueMoughataas = Array.from(
      new Set(
        mauritaniaCities
          .filter(city => city.Wilaya === selectedWilaya)
          .map(city => city.MoughataaFr)
      )
    );
    return uniqueMoughataas.sort();
  }, [selectedWilaya]);

  const communes = useMemo(() => {
    if (!selectedWilaya || !selectedMoughataa) return [];
    return mauritaniaCities
      .filter(city => city.Wilaya === selectedWilaya && city.MoughataaFr === selectedMoughataa)
      .map(city => city.Commune)
      .sort();
  }, [selectedWilaya, selectedMoughataa]);

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      if (modalStep === 'wilaya') return wilayas;
      if (modalStep === 'moughataa') return moughataas;
      if (modalStep === 'commune') return communes;
      return [];
    }

    const query = searchQuery.toLowerCase();
    if (modalStep === 'wilaya') {
      return wilayas.filter(wilaya => wilaya.toLowerCase().includes(query));
    }
    if (modalStep === 'moughataa') {
      return moughataas.filter(moughataa => moughataa.toLowerCase().includes(query));
    }
    if (modalStep === 'commune') {
      return communes.filter(commune => commune.toLowerCase().includes(query));
    }
    return [];
  }, [modalStep, searchQuery, wilayas, moughataas, communes]);

  const renderListItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="p-4 border-b border-white/20 flex-row justify-between items-center"
      onPress={() => {
        if (modalStep === 'wilaya') {
          setSelectedWilaya(item);
          setSelectedMoughataa('');
          setEventData({ 
            ...eventData, 
            wilaya: item,
            moughataa: '',
            city: '' 
          });
          setModalStep('moughataa');
        } else if (modalStep === 'moughataa') {
          setSelectedMoughataa(item);
          setEventData({ 
            ...eventData, 
            moughataa: item,
            city: '' 
          });
          setModalStep('commune');
        } else if (modalStep === 'commune') {
          setEventData({ 
            ...eventData, 
            city: item 
          });
          setModalStep(null);
          setSearchQuery('');
        }
      }}
      activeOpacity={0.7}
    >
      <Text className="text-white text-lg">{item}</Text>
      <Ionicons name="chevron-forward" size={20} color="#68f2f4" />
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View className="p-4 items-center justify-center">
      <Ionicons name="search-outline" size={40} color="#9ca3af" />
      <Text className="text-gray-400 mt-2 text-center">
        Aucun résultat trouvé pour "{searchQuery}"
      </Text>
    </View>
  );

  const getModalTitle = () => {
    if (modalStep === 'wilaya') return "Sélectionnez une Wilaya";
    if (modalStep === 'moughataa') return `Moughataas de ${selectedWilaya}`;
    if (modalStep === 'commune') return `Communes de ${selectedMoughataa}`;
    return "";
  };

  const getCurrentSelectionText = () => {
    if (eventData.city) return eventData.city;
    if (eventData.moughataa) return `Sélectionnez une commune dans ${eventData.moughataa}`;
    if (eventData.wilaya) return `Sélectionnez une moughataa dans ${eventData.wilaya}`;
    return "Sélectionnez une ville";
  };

  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6">
      <Text className="text-white text-2xl font-extrabold mb-6">
        Étape 3/5 : Lieu
      </Text>

      <View className="space-y-6">
        <View>
          <Text className="text-teal-400 text-lg mb-2 font-medium">Ville</Text>
          
          <TouchableOpacity
            className="bg-white/10 border border-teal-400/50 rounded-2xl p-5 flex-row justify-between items-center"
            onPress={() => {
              setModalStep('wilaya');
              setSearchQuery('');
            }}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center flex-1">
              {eventData.wilaya && (
                <View className="flex-row items-center">
                  <Ionicons 
                    name="location-outline" 
                    size={20} 
                    color="#68f2f4" 
                    style={{ marginRight: 8 }} 
                  />
                  <View>
                    <Text className="text-white text-lg">
                      {getCurrentSelectionText()}
                    </Text>
                    {eventData.wilaya && (
                      <Text className="text-teal-400 text-sm">
                        {eventData.wilaya}
                        {eventData.moughataa && ` • ${eventData.moughataa}`}
                      </Text>
                    )}
                  </View>
                </View>
              )}
              {!eventData.wilaya && (
                <Text className="text-gray-400 text-lg">Sélectionnez une ville</Text>
              )}
            </View>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={eventData.wilaya ? "#68f2f4" : "white"} 
            />
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalStep !== null}
            onRequestClose={() => {
              setModalStep(null);
              setSearchQuery('');
            }}
          >
            <View className="flex-1 justify-end bg-black/70">
              <Animated.View 
                entering={FadeIn.duration(300)}
                className="bg-[#1a2d3d] rounded-t-3xl p-5 h-3/4"
              >
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-white text-2xl font-bold">{getModalTitle()}</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      setModalStep(null);
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
                    placeholder="Rechercher..."
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
                
                {modalStep !== 'wilaya' && (
                  <View className="flex-row items-center mb-3">
                    <TouchableOpacity
                      onPress={() => {
                        if (modalStep === 'commune') {
                          setModalStep('moughataa');
                        } else if (modalStep === 'moughataa') {
                          setModalStep('wilaya');
                        }
                        setSearchQuery('');
                      }}
                      className="flex-row items-center"
                    >
                      <Ionicons name="arrow-back" size={20} color="#68f2f4" />
                      <Text className="text-teal-400 ml-2">
                        {modalStep === 'commune' ? 'Retour aux Moughataas' : 'Retour aux Wilayas'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                <FlatList
                  data={filteredData}
                  keyExtractor={(item) => item}
                  renderItem={renderListItem}
                  ListEmptyComponent={ListEmptyComponent}
                  showsVerticalScrollIndicator={false}
                  className="mb-4"
                />
              </Animated.View>
            </View>
          </Modal>
        </View>

        <View>
          <Text className="text-teal-400 text-lg mb-2 font-medium">Salle / lieu spécifique</Text>
          <TextInput
            className="bg-white/10 text-white p-5 rounded-2xl text-lg"
            placeholder="Nom de la salle ou lieu"
            placeholderTextColor="#9ca3af"
            value={eventData.location}
            onChangeText={text => setEventData({ ...eventData, location: text })}
          />
        </View>
      </View>
    </Animated.View>
  );
});

Step3.displayName = "Step3";
export default Step3;