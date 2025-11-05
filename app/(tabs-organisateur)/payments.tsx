import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  TextInput, 
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = "https://eventick.onrender.com";

const PaymentsScreen = () => {
  const [activeTab, setActiveTab] = useState<'balance' | 'history'>('balance');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bankily' | 'masrvi' | 'bank'>('bankily');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [isWithdrawalModalVisible, setIsWithdrawalModalVisible] = useState(false);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [balanceData, setBalanceData] = useState({
    available: 0,
    pending: 0,
    totalRevenue: 0
  });
  
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [organizerProfile, setOrganizerProfile] = useState<any>(null);

  const [bankInfo, setBankInfo] = useState({
    rib: '',
    phoneNumber: ''
  });

  const fetchOrganizerData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté");
        return;
      }

      const profileResponse = await axios.get(`${API_URL}/api/organizers/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileResponse.data && profileResponse.data.organizer) {
        const profile = profileResponse.data.organizer;
        setOrganizerProfile(profile);
        
        setBalanceData({
          available: profile.balance || 0,
          pending: 0, 
          totalRevenue: profile.totalRevenue || 0
        });

        setBankInfo(prev => ({
          ...prev,
          phoneNumber: profile.phone || profile.user?.phone || ''
        }));
      }

      await fetchWithdrawals();
    } catch (error: any) {
      console.error("Erreur chargement données:", error);
      Alert.alert("Erreur", error.response?.data?.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Récupérer l'historique des retraits
  const fetchWithdrawals = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/withdraw/user/my-withdraws`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.withdraws) {
        setWithdrawals(response.data.withdraws);
      }
    } catch (error: any) {
      console.error("Erreur chargement retraits:", error);
      Alert.alert("Erreur", "Erreur lors du chargement de l'historique");
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrganizerData();
  };

  const requestWithdrawal = async () => {
    if (!withdrawalAmount || isNaN(Number(withdrawalAmount))) {
      Haptics.notificationAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert("Erreur", "Veuillez entrer un montant valide");
      return;
    }
    
    const amount = Number(withdrawalAmount);
    
    if (amount > balanceData.available) {
      Haptics.notificationAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert("Erreur", "Le montant demandé dépasse votre solde disponible");
      return;
    }
    
    if (amount < 50) { 
      Haptics.notificationAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert("Erreur", "Le montant minimum de retrait est de 50 MRO");
      return;
    }

    if ((withdrawalMethod === 'bankily' || withdrawalMethod === 'masrvi') && !bankInfo.phoneNumber) {
      Haptics.notificationAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert("Erreur", "Veuillez entrer votre numéro de téléphone");
      return;
    }

    if (withdrawalMethod === 'bank' && !bankInfo.rib) {
      Haptics.notificationAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert("Erreur", "Veuillez entrer votre RIB");
      return;
    }

    try {
      setIsProcessing(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté");
        return;
      }

      const withdrawalData: any = {
        amount: amount,
        fees: calculateFees(amount, withdrawalMethod),
        phoneNumber: withdrawalMethod === 'bank' ? '' : bankInfo.phoneNumber
      };

      if (withdrawalMethod === 'bank') {
        withdrawalData.rib = bankInfo.rib;
      }

      console.log("Demande de retrait:", withdrawalData);

      const response = await axios.post(`${API_URL}/api/withdraw`, withdrawalData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Succès", "Votre demande de retrait a été envoyée avec succès !");
        
        fetchOrganizerData();
        setIsWithdrawalModalVisible(false);
        setWithdrawalAmount('');
      }
    } catch (error: any) {
      console.error("Erreur demande retrait:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Erreur", 
        error.response?.data?.message || "Erreur lors de la demande de retrait"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateFees = (amount: number, method: string) => {
    switch (method) {
      case 'bankily':
      case 'masrvi':
        return Math.max(10, amount * 0.01); 
      case 'bank':
        return Math.max(50, amount * 0.02); 
      default:
        return 0;
    }
  };

  const generateReceiptPDF = async (withdrawal: any) => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 30px;
                color: #333;
                line-height: 1.6;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #ec673b;
                padding-bottom: 20px;
              }
              .title {
                font-size: 24px;
                font-weight: bold;
                color: #ec673b;
                margin-bottom: 10px;
              }
              .subtitle {
                color: #666;
                font-size: 16px;
              }
              .receipt-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 5px 0;
              }
              .label {
                color: #666;
                font-weight: 500;
              }
              .value {
                font-weight: 600;
                color: #333;
              }
              .amount-section {
                background: #e8f5e8;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
              }
              .total {
                font-size: 20px;
                font-weight: bold;
                color: #ec673b;
                text-align: center;
                margin-top: 10px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
              .status-approved {
                color: #10b981;
                font-weight: bold;
              }
              .status-pending {
                color: #f59e0b;
                font-weight: bold;
              }
              .status-rejected {
                color: #ef4444;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">EventMR - Reçu de Retrait</div>
              <div class="subtitle">Confirmation de votre demande de retrait</div>
            </div>
            
            <div class="receipt-info">
              <div class="info-row">
                <span class="label">Date de la demande:</span>
                <span class="value">${new Date(withdrawal.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              
              <div class="info-row">
                <span class="label">ID Transaction:</span>
                <span class="value">${withdrawal._id}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Statut:</span>
                <span class="value status-${withdrawal.status}">${
                  withdrawal.status === 'approved' ? 'Approuvé' : 
                  withdrawal.status === 'pending' ? 'En attente' : 'Rejeté'
                }</span>
              </div>
              
              ${withdrawal.approvedDate ? `
              <div class="info-row">
                <span class="label">Date d'approbation:</span>
                <span class="value">${new Date(withdrawal.approvedDate).toLocaleDateString('fr-FR')}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="amount-section">
              <div class="info-row">
                <span class="label">Montant demandé:</span>
                <span class="value">${withdrawal.amount?.toLocaleString()} MRO</span>
              </div>
              
              <div class="info-row">
                <span class="label">Frais:</span>
                <span class="value">${withdrawal.fees?.toLocaleString()} MRO</span>
              </div>
              
              <div class="info-row total">
                <span>Montant net:</span>
                <span>${withdrawal.netAmount?.toLocaleString()} MRO</span>
              </div>
            </div>
            
            ${withdrawal.receiver ? `
            <div class="receipt-info">
              <div class="info-row">
                <span class="label">Destinataire:</span>
                <span class="value">${withdrawal.receiver.companyName || withdrawal.receiver.user?.name}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Téléphone:</span>
                <span class="value">${withdrawal.phoneNumber}</span>
              </div>
              
              ${withdrawal.rib ? `
              <div class="info-row">
                <span class="label">RIB:</span>
                <span class="value">${withdrawal.rib}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            <div class="footer">
              <p>Merci d'utiliser EventMR pour vos événements</p>
              <p>Pour toute question, contactez notre support</p>
              <p style="margin-top: 15px; font-size: 12px;">
                Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        width: 595,
        height: 842,
        base64: false
      });

      return uri;
    } catch (error) {
      console.error('Erreur génération reçu:', error);
      return null;
    }
  };

  const shareReceipt = async (withdrawal: any) => {
    try {
      const receiptUri = await generateReceiptPDF(withdrawal);
      if (!receiptUri) {
        Alert.alert("Erreur", "Impossible de générer le reçu");
        return;
      }

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Information", "Le partage n'est pas disponible sur votre appareil");
        return;
      }

      await Sharing.shareAsync(receiptUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Partager le reçu de retrait'
      });
    } catch (error) {
      console.error('Erreur partage reçu:', error);
      Alert.alert("Erreur", "Erreur lors du partage du reçu");
    }
  };

  const renderWithdrawalItem = ({ item }: { item: any }) => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <TouchableOpacity 
        className="bg-white/5 rounded-xl p-4 mb-3"
        onPress={() => {
          setSelectedReceipt(item);
          setIsReceiptModalVisible(true);
        }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">
              Retrait {item.status === 'approved' ? 'approuvé' : 
                      item.status === 'pending' ? 'en attente' : 'rejeté'}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {new Date(item.createdAt).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          
          <View className={`rounded-full px-3 py-1 ${
            item.status === 'approved' ? 'bg-green-500/20' : 
            item.status === 'pending' ? 'bg-yellow-500/20' : 'bg-red-500/20'
          }`}>
            <Text className={`text-xs font-medium ${
              item.status === 'approved' ? 'text-green-400' : 
              item.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {item.status === 'approved' ? 'Approuvé' : 
               item.status === 'pending' ? 'En attente' : 'Rejeté'}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mt-2">
          <View>
            <Text className="text-gray-400 text-sm">Montant net</Text>
            <Text className="text-white font-bold text-lg">
              {item.netAmount?.toLocaleString()} MRO
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => shareReceipt(item)}
            className="flex-row items-center bg-teal-400/20 px-3 py-2 rounded-lg"
          >
            <Ionicons name="share-outline" size={16} color="#68f2f4" />
            <Text className="text-teal-400 text-sm ml-1">Partager</Text>
          </TouchableOpacity>
        </View>
        
        {item.approvedBy && (
          <View className="mt-2 pt-2 border-t border-white/10">
            <Text className="text-gray-400 text-xs">
              Approuvé par: {item.approvedBy.name}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#68f2f4" />
          <Text className="text-white mt-4 text-lg">Chargement des données...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <View className="flex-1 px-4 pt-16">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-2xl font-bold">Paiements et Retraits</Text>
          <TouchableOpacity 
            onPress={onRefresh}
            className="bg-teal-400/10 p-2 rounded-full"
          >
            <Ionicons name="refresh" size={24} color="#68f2f4" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between bg-teal-400/10 rounded-xl p-1 mb-6">
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-xl ${activeTab === 'balance' ? 'bg-teal-400' : ''}`}
            onPress={() => setActiveTab('balance')}
          >
            <Text className={`text-center font-bold ${activeTab === 'balance' ? 'text-gray-900' : 'text-teal-400'}`}>
              Solde
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-xl ${activeTab === 'history' ? 'bg-teal-400' : ''}`}
            onPress={() => setActiveTab('history')}
          >
            <Text className={`text-center font-bold ${activeTab === 'history' ? 'text-gray-900' : 'text-teal-400'}`}>
              Historique
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'balance' ? (
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Animated.View entering={FadeInDown.duration(500)}>
              <View className="bg-gradient-to-r from-teal-400/20 to-cyan-400/10 rounded-2xl p-6 mb-6">
                <Text className="text-gray-400 mb-2">Solde disponible</Text>
                <Text className="text-white text-4xl font-bold mb-2">
                  {balanceData.available.toLocaleString()} MRO
                </Text>
                <Text className="text-teal-400 text-sm">
                  Revenu total: {balanceData.totalRevenue.toLocaleString()} MRO
                </Text>
              </View>

              <View className="bg-white/5 rounded-xl p-4 mb-6">
                <Text className="text-white font-bold mb-4">Aperçu financier</Text>
                
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-400">Retraits en attente:</Text>
                  <Text className="text-white">{balanceData.pending.toLocaleString()} MRO</Text>
                </View>
                
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-400">Retraits approuvés:</Text>
                  <Text className="text-white">
                    {withdrawals
                      .filter(w => w.status === 'approved')
                      .reduce((sum, w) => sum + (w.netAmount || 0), 0)
                      .toLocaleString()} MRO
                  </Text>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400">Total retraits:</Text>
                  <Text className="text-white">
                    {withdrawals.length}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                className="bg-teal-400 py-4 rounded-xl flex-row items-center justify-center mb-6"
                onPress={() => setIsWithdrawalModalVisible(true)}
                disabled={balanceData.available < 50}
              >
                <Ionicons name="cash-outline" size={28} color="#001215" />
                <Text className="text-gray-900 font-bold text-lg ml-3">
                  {balanceData.available < 50 ? 'Solde insuffisant' : 'Demander un retrait'}
                </Text>
              </TouchableOpacity>

              <View className="bg-blue-500/10 rounded-xl p-4">
                <Text className="text-blue-400 font-bold mb-2">Informations importantes</Text>
                <Text className="text-blue-300 text-sm">
                  • Frais de retrait: 1% pour Bankily/Masrvi (min. 10 MRO), 2% pour virement bancaire (min. 50 MRO)
                </Text>
                <Text className="text-blue-300 text-sm mt-1">
                  • Délai de traitement: 24-48 heures pour les retraits
                </Text>
                <Text className="text-blue-300 text-sm mt-1">
                  • Montant minimum: 50 MRO
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        ) : (
          <FlatList
            data={withdrawals}
            renderItem={renderWithdrawalItem}
            keyExtractor={item => item._id}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View className="bg-white/5 rounded-xl p-8 items-center justify-center mt-4">
                <Ionicons name="receipt-outline" size={48} color="#68f2f4" />
                <Text className="text-white text-center mt-4 text-lg">
                  Aucun retrait effectué
                </Text>
                <Text className="text-gray-400 text-center mt-2">
                  Vos demandes de retrait apparaitront ici
                </Text>
              </View>
            }
          />
        )}
      </View>

      <Modal
        visible={isWithdrawalModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isProcessing && setIsWithdrawalModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 max-h-[90%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">Demander un retrait</Text>
                <TouchableOpacity 
                  onPress={() => !isProcessing && setIsWithdrawalModalVisible(false)}
                  disabled={isProcessing}
                >
                  <Ionicons name="close" size={24} color="#68f2f4" />
                </TouchableOpacity>
              </View>
              
              <View className="mb-4">
                <Text className="text-teal-400 mb-2">Montant à retirer (MRO)</Text>
                <View className="bg-white/10 rounded-xl p-4 flex-row items-center">
                  <Ionicons name="cash" size={24} color="#68f2f4" />
                  <TextInput
                    placeholder="Entrez le montant"
                    placeholderTextColor="#68f2f499"
                    className="flex-1 text-white ml-3 text-lg"
                    keyboardType="numeric"
                    value={withdrawalAmount}
                    onChangeText={setWithdrawalAmount}
                    editable={!isProcessing}
                  />
                  <Text className="text-gray-400">MRO</Text>
                </View>
                <Text className="text-gray-400 mt-2">
                  Solde disponible: {balanceData.available.toLocaleString()} MRO
                </Text>
              </View>
              
              <View className="mb-6">
                <Text className="text-teal-400 mb-2">Méthode de retrait</Text>
                <View className="flex-row justify-between">
                  <TouchableOpacity 
                    className={`items-center p-3 rounded-xl flex-1 mr-2 ${
                      withdrawalMethod === 'bankily' ? 'bg-teal-400' : 'bg-white/10'
                    }`}
                    onPress={() => setWithdrawalMethod('bankily')}
                    disabled={isProcessing}
                  >
                    <Ionicons name="phone-portrait" size={32} color={withdrawalMethod === 'bankily' ? '#001215' : '#68f2f4'} />
                    <Text className={withdrawalMethod === 'bankily' ? 'text-gray-900 font-bold mt-2' : 'text-white mt-2'}>
                      Bankily
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className={`items-center p-3 rounded-xl flex-1 mr-2 ${
                      withdrawalMethod === 'masrvi' ? 'bg-teal-400' : 'bg-white/10'
                    }`}
                    onPress={() => setWithdrawalMethod('masrvi')}
                    disabled={isProcessing}
                  >
                    <Ionicons name="card" size={32} color={withdrawalMethod === 'masrvi' ? '#001215' : '#68f2f4'} />
                    <Text className={withdrawalMethod === 'masrvi' ? 'text-gray-900 font-bold mt-2' : 'text-white mt-2'}>
                      Masrvi
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className={`items-center p-3 rounded-xl flex-1 ${
                      withdrawalMethod === 'bank' ? 'bg-teal-400' : 'bg-white/10'
                    }`}
                    onPress={() => setWithdrawalMethod('bank')}
                    disabled={isProcessing}
                  >
                    <Ionicons name="business" size={32} color={withdrawalMethod === 'bank' ? '#001215' : '#68f2f4'} />
                    <Text className={withdrawalMethod === 'bank' ? 'text-gray-900 font-bold mt-2' : 'text-white mt-2'}>
                      Virement
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {(withdrawalMethod === 'bankily' || withdrawalMethod === 'masrvi') && (
                <View className="mb-4">
                  <Text className="text-teal-400 mb-2">Numéro de téléphone</Text>
                  <TextInput
                    className="bg-white/10 text-white p-4 rounded-xl text-lg"
                    placeholder="Votre numéro de téléphone"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    value={bankInfo.phoneNumber}
                    onChangeText={text => setBankInfo({...bankInfo, phoneNumber: text})}
                    editable={!isProcessing}
                  />
                </View>
              )}
              
              {withdrawalMethod === 'bank' && (
                <View className="mb-4">
                  <Text className="text-teal-400 mb-2">RIB</Text>
                  <TextInput
                    className="bg-white/10 text-white p-4 rounded-xl text-lg"
                    placeholder="Votre RIB"
                    placeholderTextColor="#9ca3af"
                    value={bankInfo.rib}
                    onChangeText={text => setBankInfo({...bankInfo, rib: text})}
                    editable={!isProcessing}
                  />
                </View>
              )}
              
              {withdrawalAmount && !isNaN(Number(withdrawalAmount)) && (
                <View className="mb-4">
                  <View className="bg-yellow-500/10 rounded-xl p-4 mb-3">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-yellow-400">Frais de transaction:</Text>
                      <Text className="text-yellow-400 font-bold">
                        {calculateFees(Number(withdrawalAmount), withdrawalMethod).toLocaleString()} MRO
                      </Text>
                    </View>
                  </View>
                  
                  <View className="bg-green-500/10 rounded-xl p-4">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-green-400">Montant net reçu:</Text>
                      <Text className="text-green-400 font-bold text-lg">
                        {(Number(withdrawalAmount) - calculateFees(Number(withdrawalAmount), withdrawalMethod)).toLocaleString()} MRO
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              
              <TouchableOpacity 
                className={`py-4 rounded-xl ${isProcessing ? 'bg-gray-400' : 'bg-teal-400'}`}
                onPress={requestWithdrawal}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#001215" />
                ) : (
                  <Text className="text-gray-900 font-bold text-center text-lg">
                    Confirmer le retrait
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isReceiptModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReceiptModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">Détails du retrait</Text>
              <TouchableOpacity onPress={() => setIsReceiptModalVisible(false)}>
                <Ionicons name="close" size={24} color="#68f2f4" />
              </TouchableOpacity>
            </View>
            
            {selectedReceipt ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="bg-white/5 rounded-xl p-4 mb-4">
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Date:</Text>
                    <Text className="text-white">{new Date(selectedReceipt.createdAt).toLocaleDateString('fr-FR')}</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">ID Transaction:</Text>
                    <Text className="text-white">{selectedReceipt._id}</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Statut:</Text>
                    <Text className={`${
                      selectedReceipt.status === 'approved' ? 'text-green-400' : 
                      selectedReceipt.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                    } font-bold`}>
                      {selectedReceipt.status === 'approved' ? 'Approuvé' : 
                       selectedReceipt.status === 'pending' ? 'En attente' : 'Rejeté'}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Montant demandé:</Text>
                    <Text className="text-white">{selectedReceipt.amount?.toLocaleString()} MRO</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Frais:</Text>
                    <Text className="text-white">{selectedReceipt.fees?.toLocaleString()} MRO</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Montant net:</Text>
                    <Text className="text-white font-bold">{selectedReceipt.netAmount?.toLocaleString()} MRO</Text>
                  </View>
                  
                  {selectedReceipt.approvedBy && (
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-400">Approuvé par:</Text>
                      <Text className="text-white">{selectedReceipt.approvedBy.name}</Text>
                    </View>
                  )}
                  
                  {selectedReceipt.approvedDate && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Date d'approbation:</Text>
                      <Text className="text-white">{new Date(selectedReceipt.approvedDate).toLocaleDateString('fr-FR')}</Text>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity 
                  className="bg-teal-400 py-3 rounded-xl flex-row items-center justify-center mb-4"
                  onPress={() => shareReceipt(selectedReceipt)}
                >
                  <Ionicons name="share-social" size={24} color="#001215" />
                  <Text className="text-gray-900 font-bold text-lg ml-2">Partager le reçu</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="bg-teal-400/20 py-3 rounded-xl flex-row items-center justify-center"
                  onPress={() => setIsReceiptModalVisible(false)}
                >
                  <Text className="text-teal-400 font-medium">Fermer</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View className="items-center py-10">
                <Ionicons name="warning" size={48} color="#f87171" />
                <Text className="text-white text-lg mt-4">Détails non disponibles</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </BackgroundWrapper>
  );
};

export default PaymentsScreen;