import React, { memo, useState, useMemo } from 'react'; 
import { Step3Props } from "@/types/stepTypes";
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, Keyboard } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { mauritaniaCities } from "@/constants/cities";

const Step3 = memo(({ eventData, setEventData, formatDate }: Step3Props) => {
  const [modalStep, setModalStep] = useState<'wilaya' | 'moughataa' | 'commune' | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [selectedMoughataa, setSelectedMoughataa] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [touchedFields, setTouchedFields] = useState({
    location: false
  });

  const isLocationValid = eventData.location.length >= 3;
  const isCityValid = !!eventData.city;
  const isWilayaValid = !!eventData.wilaya;

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

  const handleLocationTouch = () => {
    setTouchedFields(prev => ({ ...prev, location: true }));
  };

  const resetLocation = () => {
    setEventData({
      ...eventData,
      wilaya: '',
      moughataa: '',
      city: ''
    });
    setSelectedWilaya('');
    setSelectedMoughataa('');
  };

  const renderListItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="p-4 border-b border-white/20 flex-row justify-between items-center active:bg-white/5"
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
          Keyboard.dismiss();
        }
      }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <Ionicons 
          name={modalStep === 'wilaya' ? "location-outline" : modalStep === 'moughataa' ? "business-outline" : "home-outline"} 
          size={20} 
          color="#68f2f4" 
          style={{ marginRight: 12 }}
        />
        <Text className="text-white text-lg flex-1">{item}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#68f2f4" />
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View className="p-8 items-center justify-center">
      <Ionicons name="search-outline" size={48} color="#6b7280" />
      <Text className="text-gray-400 mt-4 text-center text-base">
        Aucun résultat trouvé pour {"\n"}"{searchQuery}"
      </Text>
      <Text className="text-gray-500 mt-2 text-center text-sm">
        Essayez avec d'autres termes
      </Text>
    </View>
  );

  const getModalTitle = () => {
    if (modalStep === 'wilaya') return "Sélectionnez une Wilaya";
    if (modalStep === 'moughataa') return `Moughataas de ${selectedWilaya}`;
    if (modalStep === 'commune') return `Communes de ${selectedMoughataa}`;
    return "";
  };

  const getModalSubtitle = () => {
    if (modalStep === 'wilaya') return "Choisissez la région de votre événement";
    if (modalStep === 'moughataa') return "Sélectionnez la moughataa correspondante";
    if (modalStep === 'commune') return "Choisissez la commune exacte";
    return "";
  };

  const getCurrentSelectionText = () => {
    if (eventData.city) return eventData.city;
    if (eventData.moughataa) return `Sélectionnez une commune dans ${eventData.moughataa}`;
    if (eventData.wilaya) return `Sélectionnez une moughataa dans ${eventData.wilaya}`;
    return "Sélectionnez une localisation";
  };

  const getLocationIcon = () => {
    if (eventData.city) return "checkmark-circle";
    if (eventData.moughataa) return "business";
    if (eventData.wilaya) return "location";
    return "location-outline";
  };

  const getLocationColor = () => {
    if (eventData.city) return "#10b981";
    if (eventData.moughataa) return "#68f2f4";
    if (eventData.wilaya) return "#68f2f4";
    return "#9ca3af";
  };

  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6 flex-1">
      <View className="mb-8">
        <Text className="text-white text-2xl font-extrabold mb-2">
          Étape 3/5 : Lieu
        </Text>
        <Text className="text-gray-400 text-base">
          Où se déroule votre événement ?
        </Text>
      </View>

      <View className="space-y-6 flex-1 justify-center">
        <View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-teal-400 text-lg font-medium">
              Localisation
            </Text>
            {eventData.wilaya && (
              <TouchableOpacity onPress={resetLocation} className="p-2">
                <Text className="text-orange-400 text-sm">Réinitialiser</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            className={`bg-white/10 p-5 rounded-2xl flex-row justify-between items-center border-2 ${
              isCityValid ? 'border-green-400/30' : 'border-white/10'
            }`}
            onPress={() => {
              Keyboard.dismiss();
              setModalStep('wilaya');
              setSearchQuery('');
            }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons 
                name={getLocationIcon()} 
                size={24} 
                color={getLocationColor()} 
                style={{ marginRight: 12 }}
              />
              <View className="flex-1">
                <Text className="text-white text-lg font-medium">
                  {getCurrentSelectionText()}
                </Text>
                {eventData.wilaya && (
                  <View className="flex-row flex-wrap mt-1">
                    <View className="bg-teal-500/20 px-2 py-1 rounded-full mr-2 mb-1">
                      <Text className="text-teal-400 text-xs">{eventData.wilaya}</Text>
                    </View>
                    {eventData.moughataa && (
                      <View className="bg-blue-500/20 px-2 py-1 rounded-full mr-2 mb-1">
                        <Text className="text-blue-400 text-xs">{eventData.moughataa}</Text>
                      </View>
                    )}
                    {eventData.city && (
                      <View className="bg-green-500/20 px-2 py-1 rounded-full mb-1">
                        <Text className="text-green-400 text-xs">{eventData.city}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={eventData.wilaya ? "#68f2f4" : "#9ca3af"} 
            />
          </TouchableOpacity>

          {isCityValid && (
            <View className="flex-row items-center mt-3 bg-green-500/10 p-3 rounded-xl">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-green-400 text-sm ml-2 flex-1">
                Commune sélectionnée : {eventData.city}
              </Text>
            </View>
          )}

          {eventData.wilaya && !eventData.city && (
            <View className="flex-row items-center mt-3 bg-blue-500/10 p-3 rounded-xl">
              <Ionicons name="information-circle" size={16} color="#68f2f4" />
              <Text className="text-blue-400 text-sm ml-2 flex-1">
                Continuez la sélection pour choisir une commune
              </Text>
            </View>
          )}
        </View>

        <View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-teal-400 text-lg font-medium">
              Lieu spécifique
            </Text>
            {touchedFields.location && !isLocationValid && (
              <Text className="text-orange-400 text-sm">Minimum 3 caractères</Text>
            )}
          </View>
          
          <TextInput
            className={`bg-white/10 text-white p-5 rounded-2xl text-lg border-2 ${
              touchedFields.location && !isLocationValid 
                ? 'border-orange-400/50' 
                : isLocationValid 
                ? 'border-green-400/30' 
                : 'border-white/10'
            }`}
            placeholder="Ex: Stade Olympique, Salle des fêtes, Complexe culturel..."
            placeholderTextColor="#6b7280"
            value={eventData.location}
            onChangeText={text => setEventData({ ...eventData, location: text })}
            onFocus={handleLocationTouch}
            multiline
          />
          
          {touchedFields.location && !isLocationValid && (
            <View className="flex-row items-center mt-3 bg-orange-500/10 p-3 rounded-xl">
              <Ionicons name="warning" size={16} color="#f97316" />
              <Text className="text-orange-400 text-sm ml-2 flex-1">
                Veuillez préciser le nom du lieu (salle, stade, complexe...)
              </Text>
            </View>
          )}

          {isLocationValid && (
            <View className="flex-row items-center mt-3 bg-green-500/10 p-3 rounded-xl">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-green-400 text-sm ml-2">
                Lieu spécifique défini ✓
              </Text>
            </View>
          )}
        </View>

        {(isCityValid && isLocationValid) && (
          <Animated.View 
            entering={FadeInDown.duration(400)}
            className="bg-teal-500/10 p-4 rounded-xl border border-teal-400/30"
          >
            <View className="flex-row items-start">
              <Ionicons name="map" size={24} color="#68f2f4" style={{ marginRight: 12, marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-teal-400 font-medium text-base mb-2">
                  Localisation confirmée
                </Text>
                <Text className="text-white text-sm mb-1">
                  {eventData.location}
                </Text>
                <Text className="text-teal-400 text-sm">
                  {eventData.city}, {eventData.moughataa}, {eventData.wilaya}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalStep !== null}
        onRequestClose={() => {
          setModalStep(null);
          setSearchQuery('');
        }}
        statusBarTranslucent
      >
        <View className="flex-1 justify-end bg-black/70">
          <Animated.View 
            entering={FadeIn.duration(300)}
            className="bg-[#1a2d3d] rounded-t-3xl p-5 h-4/5"
          >
            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-white/20">
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold">{getModalTitle()}</Text>
                <Text className="text-gray-400 text-sm mt-1">{getModalSubtitle()}</Text>
                
                {modalStep !== 'wilaya' && (
                  <View className="flex-row items-center mt-2">
                    <Text className="text-teal-400 text-xs">
                      {selectedWilaya}
                      {selectedMoughataa && ` › ${selectedMoughataa}`}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setModalStep(null);
                  setSearchQuery('');
                }}
                className="p-2 rounded-full bg-white/10"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <View className="bg-white/10 rounded-xl px-4 py-3 flex-row items-center mb-4">
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 text-white text-lg ml-3"
                placeholder={`Rechercher dans ${getModalTitle().toLowerCase()}...`}
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
            
            {modalStep !== 'wilaya' && (
              <View className="flex-row items-center mb-4 bg-white/5 p-3 rounded-xl">
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
                  <Text className="text-teal-400 ml-2 text-sm font-medium">
                    {modalStep === 'commune' ? 'Retour aux moughataas' : 'Retour aux wilayas'}
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
              className="mb-4 flex-1"
              initialNumToRender={20}
            />

            {modalStep === 'commune' && (
              <View className="bg-teal-500/10 p-3 rounded-xl mb-4">
                <Text className="text-teal-400 text-sm text-center">
                  Sélectionnez une commune pour finaliser la localisation
                </Text>
              </View>
            )}

            <View className="flex-row justify-between items-center pt-4 border-t border-white/10">
              <Text className="text-gray-400 text-sm">
                {filteredData.length} résultat(s) trouvé(s)
              </Text>
              <TouchableOpacity
                className="bg-gray-600 px-4 py-2 rounded-xl"
                onPress={() => {
                  setModalStep(null);
                  setSearchQuery('');
                }}
              >
                <Text className="text-white text-sm">Fermer</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
});

Step3.displayName = "Step3";
export default Step3;