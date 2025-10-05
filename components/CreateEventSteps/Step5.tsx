import { Step5Props } from "@/types/stepTypes";
import { Ionicons } from "@expo/vector-icons";
import { memo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Alert, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const Step5 = memo(({
  ticketTypes,
  setTicketTypes,
  addTicketType,
  removeTicketType,
  updateTicketType
}: Step5Props) => {
  const [touchedTickets, setTouchedTickets] = useState<{[key: string]: boolean}>({});

  const handleFieldTouch = (ticketId: string) => {
    setTouchedTickets(prev => ({ ...prev, [ticketId]: true }));
  };

  const validateTicketType = (type: any) => {
    const errors = [];
    if (!type.type || type.type.length < 2) errors.push("Le nom du type doit contenir au moins 2 caractères");
    if (type.price < 0) errors.push("Le prix ne peut pas être négatif");
    if (type.price > 1000000) errors.push("Le prix est trop élevé");
    if (type.totalTickets < 1) errors.push("La quantité doit être d'au moins 1 billet");
    if (type.totalTickets > 100000) errors.push("La quantité est trop élevée");
    return errors;
  };

  const handleRemoveTicket = (ticketId: string) => {
    if (ticketTypes.length === 1) {
      Alert.alert(
        "Impossible de supprimer",
        "Vous devez avoir au moins un type de billet",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Supprimer le type de billet",
      "Êtes-vous sûr de vouloir supprimer ce type de billet ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: () => removeTicketType(ticketId)
        }
      ]
    );
  };

  const calculateTotalTickets = () => {
    return ticketTypes.reduce((total, type) => total + type.totalTickets, 0);
  };

  const calculateTotalRevenue = () => {
    return ticketTypes.reduce((total, type) => total + (type.price * type.totalTickets), 0);
  };

  const isTicketValid = (ticket: any) => {
    return validateTicketType(ticket).length === 0;
  };

  const getTicketStatusColor = (ticket: any) => {
    if (!touchedTickets[ticket.id]) return "border-white/10";
    return isTicketValid(ticket) ? "border-green-400/30" : "border-orange-400/50";
  };

  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6 flex-1">
      <View className="mb-6">
        <Text className="text-white text-2xl font-extrabold mb-2">
          Types de billets
        </Text>
        <Text className="text-gray-400 text-base">
          Étape 5/5 - Configurez vos offres de billets
        </Text>
      </View>

      <View className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
        <View className="flex-row justify-between items-center">
          <View className="items-center flex-1">
            <Text className="text-teal-400 text-lg font-bold">{ticketTypes.length}</Text>
            <Text className="text-gray-400 text-sm">Types de billets</Text>
          </View>
          <View className="h-8 w-px bg-white/20" />
          <View className="items-center flex-1">
            <Text className="text-teal-400 text-lg font-bold">{calculateTotalTickets()}</Text>
            <Text className="text-gray-400 text-sm">Billets au total</Text>
          </View>
          <View className="h-8 w-px bg-white/20" />
          <View className="items-center flex-1">
            <Text className="text-teal-400 text-lg font-bold">
              {calculateTotalRevenue().toLocaleString()} MRO
            </Text>
            <Text className="text-gray-400 text-sm">Revenu potentiel</Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-white text-xl font-semibold">Types de billets</Text>
         
        </View>
        <TouchableOpacity
          className="flex-row items-center bg-teal-500 py-3 px-5 rounded-2xl active:bg-teal-600"
          onPress={addTicketType}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color="#001215" />
          <Text className="text-gray-900 ml-2 font-semibold text-base">Nouveau type</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="space-y-4">
          {ticketTypes.map((type, index) => {
            const errors = validateTicketType(type);
            const isValid = errors.length === 0;
            
            return (
              <View
                key={type.id}
                className={`bg-white/5 p-5 rounded-2xl border-2 ${getTicketStatusColor(type)}`}
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center flex-1">
                    <Ionicons 
                      name={isValid ? "ticket" : "warning"} 
                      size={24} 
                      color={isValid ? "#68f2f4" : "#f97316"} 
                      style={{ marginRight: 12 }}
                    />
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-lg">
                        {type.type || `Type de billet #${index + 1}`}
                      </Text>
                      {type.type && (
                        <Text className="text-teal-400 text-sm">
                          {type.price.toLocaleString()} MRO • {type.totalTickets} billets
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View className="flex-row items-center space-x-3">
                    <View className={`w-3 h-3 rounded-full ${type.available ? 'bg-green-400' : 'bg-gray-500'}`} />
                    
                    {ticketTypes.length > 1 && (
                      <TouchableOpacity 
                        onPress={() => handleRemoveTicket(type.id)}
                        className="p-2 active:opacity-70"
                      >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View className="space-y-4">
                  <View>
                    <Text className="text-teal-400 text-base font-medium mb-2">Nom du type</Text>
                    <TextInput
                      className="bg-white/10 text-white p-4 rounded-2xl text-lg border border-white/20"
                      placeholder="Ex: VIP, Standard, Économique..."
                      placeholderTextColor="#6b7280"
                      value={type.type}
                      onChangeText={text => {
                        updateTicketType(type.id, 'type', text);
                        handleFieldTouch(type.id);
                      }}
                      onFocus={() => handleFieldTouch(type.id)}
                    />
                  </View>

                  <View className="flex-row justify-between space-x-4">
                    <View className="flex-1">
                      <Text className="text-teal-400 text-base font-medium mb-2">Prix (MRO)</Text>
                      <View className="relative">
                        <TextInput
                          className="bg-white/10 text-white p-4 rounded-2xl text-lg border border-white/20"
                          placeholder="0"
                          placeholderTextColor="#6b7280"
                          keyboardType="numeric"
                          value={type.price === 0 ? "" : type.price.toString()}
                          onChangeText={text => {
                            const value = text === "" ? 0 : parseInt(text) || 0;
                            updateTicketType(type.id, 'price', value);
                            handleFieldTouch(type.id);
                          }}
                          onFocus={() => handleFieldTouch(type.id)}
                        />
                        {type.price > 0 && (
                          <View className="absolute right-3 top-3">
                            <Text className="text-teal-400 text-sm">MRO</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="text-teal-400 text-base font-medium mb-2">Quantité</Text>
                      <TextInput
                        className="bg-white/10 text-white p-4 rounded-2xl text-lg border border-white/20"
                        placeholder="0"
                        placeholderTextColor="#6b7280"
                        keyboardType="numeric"
                        value={type.totalTickets === 0 ? "" : type.totalTickets.toString()}
                        onChangeText={text => {
                          const value = text === "" ? 0 : parseInt(text) || 0;
                          updateTicketType(type.id, 'totalTickets', value);
                          handleFieldTouch(type.id);
                        }}
                        onFocus={() => handleFieldTouch(type.id)}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-teal-400 text-base font-medium mb-2">
                      Description <Text className="text-gray-400 text-sm">(Optionnel)</Text>
                    </Text>
                    <TextInput
                      className="bg-white/10 text-white p-4 rounded-2xl text-lg h-24 border border-white/20"
                      placeholder="Avantages, conditions d'accès, particularités..."
                      placeholderTextColor="#6b7280"
                      multiline
                      textAlignVertical="top"
                      value={type.description}
                      onChangeText={text => updateTicketType(type.id, 'description', text)}
                    />
                  </View>

                  <View className="flex-row justify-between items-center pt-2 border-t border-white/10">
                    <View>
                      <Text className="text-white font-medium">Billets disponibles</Text>
                      <Text className="text-gray-400 text-sm">
                        {type.available ? "En vente" : "Vente suspendue"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className={`w-14 h-8 rounded-full p-1 flex justify-center ${type.available ? 'bg-teal-500' : 'bg-gray-600'}`}
                      onPress={() => updateTicketType(type.id, 'available', !type.available)}
                      activeOpacity={0.7}
                    >
                      <View
                        className={`bg-white w-6 h-6 rounded-full shadow transform transition-all ${type.available ? 'translate-x-6' : 'translate-x-0'}`}
                      />
                    </TouchableOpacity>
                  </View>

                  {touchedTickets[type.id] && errors.length > 0 && (
                    <View className="bg-orange-500/10 p-3 rounded-xl border border-orange-400/30">
                      {errors.map((error, errorIndex) => (
                        <View key={errorIndex} className="flex-row items-center mb-1 last:mb-0">
                          <Ionicons name="alert-circle" size={16} color="#f97316" />
                          <Text className="text-orange-400 text-sm ml-2 flex-1">
                            {error}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {touchedTickets[type.id] && isValid && (
                    <View className="bg-green-500/10 p-3 rounded-xl border border-green-400/30">
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <Text className="text-green-400 text-sm ml-2 flex-1">
                          Type de billet valide ✓
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {ticketTypes.length === 0 && (
          <View className="bg-white/5 rounded-2xl p-8 items-center justify-center border border-dashed border-white/20">
            <Ionicons name="ticket-outline" size={64} color="#68f2f4" />
            <Text className="text-white text-xl font-bold mt-4 text-center">
              Aucun type de billet configuré
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Commencez par ajouter votre premier type de billet
            </Text>
          </View>
        )}
      </ScrollView>

      {ticketTypes.length > 0 && (
        <View className="bg-teal-500/10 p-4 rounded-2xl border border-teal-400/30 mt-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-teal-400 font-medium text-base">
                Résumé des billets
              </Text>
              <Text className="text-white text-sm">
                {ticketTypes.length} type(s) • {calculateTotalTickets()} billets
              </Text>
            </View>
            <Text className="text-teal-400 font-bold text-lg">
              {calculateTotalRevenue().toLocaleString()} MRO
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
});

Step5.displayName = "Step5";
export default Step5;