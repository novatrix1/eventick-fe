import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

type PaymentMethod = {
  id: string;
  type: 'bankily' | 'masrvi' | 'card';
  name: string;
  icon: string;
  lastDigits: string;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'bankily',
    name: 'Bankily',
    icon: 'cellphone',
    lastDigits: '•••• 1234'
  },
  {
    id: '2',
    type: 'masrvi',
    name: 'Masrvi',
    icon: 'cash',
    lastDigits: '•••• 5678'
  },
  {
    id: '3',
    type: 'card',
    name: 'Carte Visa',
    icon: 'credit-card',
    lastDigits: '•••• 9012'
  }
];

const PaymentMethodsScreen = () => {
  const [methods, setMethods] = useState(paymentMethods);

  const addPaymentMethod = () => {
    alert('Ajouter une nouvelle méthode de paiement');
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} className="flex-row items-center justify-between bg-white/5 rounded-xl p-4 mb-3">
      <View className="flex-row items-center">
        <Ionicons
          name={method.icon as any}
          size={24}
          color="#68f2f4"
          className="mr-3"
        />
        <View>
          <Text className="text-white font-bold">{method.name}</Text>
          <Text className="text-gray-400 text-xs">{method.lastDigits}</Text>
        </View>
      </View>
      <TouchableOpacity>
        <Ionicons name="create" size={20} color="#68f2f4" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 p-4">
      <Text className="text-white text-lg font-bold mb-4">Méthodes de paiement enregistrées</Text>
      
      {methods.length > 0 ? (
        <FlatList
          data={methods}
          renderItem={({ item }) => renderPaymentMethod(item)}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="bg-white/10 rounded-2xl p-6 items-center justify-center flex-1">
          <Ionicons name="card" size={40} color="#68f2f4" />
          <Text className="text-white font-bold mt-4">Aucun moyen de paiement</Text>
          <Text className="text-gray-400 text-center mt-2">
            Ajoutez un moyen de paiement pour faciliter vos futurs achats
          </Text>
        </View>
      )}

      <View className="flex-row mt-8">
        <TouchableOpacity
          className="flex-1 bg-teal-400 py-3 rounded-xl items-center"
          onPress={addPaymentMethod}
        >
          <Text className="text-gray-900 font-bold">Ajouter un moyen de paiement</Text>
        </TouchableOpacity>
      </View>
      
      <Text className="text-gray-500 mt-6 text-center">Options de paiement disponibles</Text>
      <View className="flex-row mt-4">
        <View className="flex-1 mr-2 bg-white/5 rounded-xl p-4 items-center">
          <Ionicons name="wallet" size={24} color="#68f2f4" />
          <Text className="text-white mt-2 text-center">Bankily</Text>
        </View>
        <View className="flex-1 mx-2 bg-white/5 rounded-xl p-4 items-center">
          <MaterialCommunityIcons name="cellphone" size={24} color="#68f2f4" />
          <Text className="text-white mt-2 text-center">Masrvi</Text>
        </View>
        <View className="flex-1 ml-2 bg-white/5 rounded-xl p-4 items-center">
          <FontAwesome name="credit-card" size={20} color="#68f2f4" />
          <Text className="text-white mt-2 text-center">Carte</Text>
        </View>
      </View>
    </View>
  );
};

export default PaymentMethodsScreen;