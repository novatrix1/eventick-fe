import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const helpOptions = [
  { id: 'contact', title: 'Contacter le support', icon: 'headset' },
  { id: 'faq', title: 'FAQ', icon: 'help-circle' },
  { id: 'terms', title: 'Conditions d\'utilisation', icon: 'document-text' },
  { id: 'privacy', title: 'Politique de confidentialité', icon: 'shield' },
  { id: 'about', title: 'À propos de l\'application', icon: 'information-circle' },
  { id: 'feedback', title: 'Envoyer des suggestions', icon: 'chatbox' }
];

const HelpCenterScreen = () => {
  const navigateToHelp = (id: string) => {
    alert(`Navigation vers: ${id}`);
  };

  const renderHelpOption = ({ item }: { item: typeof helpOptions[0] }) => (
    <TouchableOpacity
      key={item.id}
      className="flex-row items-center p-4 bg-white/5 rounded-xl mb-3"
      onPress={() => navigateToHelp(item.id)}
    >
      <Ionicons name={item.icon as any} size={24} color="#68f2f4" className="mr-3" />
      <Text className="text-white flex-1">{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#68f2f4" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-4">
      <Text className="text-white text-lg font-bold mb-4">Centre d'aide</Text>
      
      <View className="mb-6">
        <Text className="text-gray-400 mb-3">Questions fréquentes</Text>
        <View className="flex-row flex-wrap">
          <TouchableOpacity className="bg-white/10 py-2 px-4 rounded-full mr-2 mb-2">
            <Text className="text-white">Problèmes de paiement</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/10 py-2 px-4 rounded-full mr-2 mb-2">
            <Text className="text-white">Annulation</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/10 py-2 px-4 rounded-full mr-2 mb-2">
            <Text className="text-white">Billets perdus</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/10 py-2 px-4 rounded-full mr-2 mb-2">
            <Text className="text-white">Compte</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text className="text-gray-400 mb-3">Autres options</Text>
      <FlatList
        data={helpOptions}
        renderItem={renderHelpOption}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
      
      <View className="mt-6 bg-white/5 rounded-xl p-4">
        <View className="flex-row items-center mb-3">
          <Ionicons name="chatbubbles" size={24} color="#68f2f4" />
          <Text className="text-white font-bold ml-3">Support en direct</Text>
        </View>
        <Text className="text-gray-400 mb-4">
          Notre équipe est disponible 24h/24 pour répondre à vos questions
        </Text>
        <TouchableOpacity className="bg-teal-400 py-3 rounded-xl items-center">
          <Text className="text-gray-900 font-bold">Démarrer une conversation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HelpCenterScreen;