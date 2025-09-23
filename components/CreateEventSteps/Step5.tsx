import { Step5Props } from "@/types/stepTypes";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const Step5 = memo(({
  ticketTypes,
  setTicketTypes,
  addTicketType,
  removeTicketType,
  updateTicketType
}: Step5Props) => {
  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6">
      <Text className="text-white text-2xl font-extrabold mb-6">
        Étape 5/5 : Types de billets
      </Text>

      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-semibold">Types de billets</Text>
        <TouchableOpacity
          className="flex-row items-center bg-teal-400 py-2 px-4 rounded-full"
          onPress={addTicketType}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color="#001215" />
          <Text className="text-gray-900 ml-2 font-medium text-lg">Ajouter</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-teal-400 mb-4 text-base">
        Configurez les différents types de billets disponibles pour votre événement
      </Text>

      <View className="space-y-6">
        {ticketTypes.map((type, index) => (
          <View
            key={type.id}
            className="bg-white/10 p-5 rounded-2xl"
          >
            <View className="flex-row justify-between items-start mb-4">
              <Text className="text-white font-semibold text-lg">
                Type de billet #{index + 1}
              </Text>
              {ticketTypes.length > 1 && (
                <TouchableOpacity onPress={() => removeTicketType(type.id)}>
                  <Ionicons name="trash" size={22} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-teal-400 text-lg mb-2 font-medium">Type</Text>
                <TextInput
                  className="bg-white/10 text-white p-4 rounded-2xl text-lg"
                  placeholder="Ex: VIP, Standard..."
                  placeholderTextColor="#9ca3af"
                  value={type.type}
                  onChangeText={text => updateTicketType(type.id, 'type', text)}
                />
              </View>

              <View className="flex-row justify-between space-x-4">
                <View className="flex-1">
                  <Text className="text-teal-400 text-lg mb-2 font-medium">Prix (MRO)</Text>
                  <TextInput
                    className="bg-white/10 text-white p-4 rounded-2xl text-lg"
                    placeholder="Prix"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={type.price.toString()}
                    onChangeText={text => updateTicketType(type.id, 'price', parseInt(text) || 0)}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-teal-400 text-lg mb-2 font-medium">Quantité</Text>
                  <TextInput
                    className="bg-white/10 text-white p-4 rounded-2xl text-lg"
                    placeholder="Nombre de billets"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={type.totalTickets.toString()}
                    onChangeText={text => updateTicketType(type.id, 'totalTickets', parseInt(text) || 0)}
                  />
                </View>
              </View>

              <View>
                <Text className="text-teal-400 text-lg mb-2 font-medium">Description</Text>
                <TextInput
                  className="bg-white/10 text-white p-4 rounded-2xl text-lg h-20"
                  placeholder="Avantages, conditions..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  textAlignVertical="top"
                  value={type.description}
                  onChangeText={text => updateTicketType(type.id, 'description', text)}
                />
              </View>

              <View className="flex-row items-center">
                <TouchableOpacity
                  className={`w-12 h-6 rounded-full p-1 flex justify-center ${type.available ? 'bg-teal-400' : 'bg-gray-700'}`}
                  onPress={() => updateTicketType(type.id, 'available', !type.available)}
                  activeOpacity={0.7}
                >
                  <View
                    className={`bg-white w-4 h-4 rounded-full shadow ${type.available ? 'ml-6' : 'ml-0'}`}
                  />
                </TouchableOpacity>
                <Text className="text-white ml-3">Billets disponibles</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
});


Step5.displayName = "Step5";
export default Step5