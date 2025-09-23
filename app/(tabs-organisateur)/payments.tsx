import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const PaymentsScreen = () => {
  const [activeTab, setActiveTab] = useState<'balance' | 'history' | 'events'>('balance');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bankily' | 'masrvi' | 'bank'>('bankily');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [isWithdrawalModalVisible, setIsWithdrawalModalVisible] = useState(false);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    rib: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Données de démonstration
  const balanceData = {
    available: 1245000,
    pending: 375000,
    lastWithdrawal: {
      amount: 500000,
      date: '15 Oct 2023',
      method: 'Bankily',
      status: 'completed'
    }
  };

  const paymentHistory = [
    {
      id: '1',
      date: '15 Oct 2023',
      description: 'Festival des Dattes - Ventes de billets',
      amount: 367500,
      type: 'income',
      eventId: '1',
    },
    {
      id: '2',
      date: '10 Oct 2023',
      description: 'Retrait vers Bankily',
      amount: 500000,
      type: 'withdrawal',
      method: 'Bankily',
      status: 'completed',
      receiptId: 'rec1'
    },
    {
      id: '3',
      date: '5 Oct 2023',
      description: 'Conférence Tech - Ventes de billets',
      amount: 540000,
      type: 'income',
      eventId: '3',
    },
    {
      id: '4',
      date: '1 Oct 2023',
      description: 'Retrait vers Masrvi',
      amount: 300000,
      type: 'withdrawal',
      method: 'Masrvi',
      status: 'pending',
    },
    {
      id: '5',
      date: '25 Sept 2023',
      description: 'Concert National - Ventes de billets',
      amount: 2100000,
      type: 'income',
      eventId: '4',
    },
  ];

  const receipts = [
    {
      id: 'rec1',
      date: '10 Oct 2023',
      amount: 500000,
      method: 'Bankily',
      transactionId: 'TX123456789',
      status: 'Complété',
      fees: 500,
      netAmount: 499500
    }
  ];

  const events = [
    {
      id: '1',
      title: 'Festival des Dattes',
      date: '15 Oct 2023',
      totalSales: 367500,
      ticketsSold: 290,
      withdrawal: 0
    },
    {
      id: '2',
      title: 'Match de Football',
      date: '20 Oct 2023',
      totalSales: 0,
      ticketsSold: 0,
      withdrawal: 0
    },
    {
      id: '3',
      title: 'Conférence Tech',
      date: '25 Sept 2023',
      totalSales: 540000,
      ticketsSold: 300,
      withdrawal: 0
    },
    {
      id: '4',
      title: 'Concert National',
      date: '5 Nov 2023',
      totalSales: 2100000,
      ticketsSold: 850,
      withdrawal: 0
    }
  ];

  const generateReceiptPDF = async (withdrawalData: any, logoUrl: string) => {
  try {
    const htmlContent = `
      <html>
        <head>
          <style>
            /* Variables de couleurs modernes */
            :root {
              --primary: #4361ee;
              --secondary: #3f37c9;
              --accent: #4895ef;
              --dark: #2b2d42;
              --light: #f8f9fa;
              --gray: #8d99ae;
              --success: #4cc9f0;
            }
            
            body {
              font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
              padding: 40px;
              color: #333;
              background: linear-gradient(to bottom right, #f9fbfd, #ffffff);
            }
            
            /* En-tête avec fond dégradé */
            .header {
              text-align: center;
              margin-bottom: 35px;
              padding-bottom: 25px;
              border-bottom: 1px solid rgba(0, 0, 0, 0.05);
              position: relative;
            }
            
            .logo-container {
              margin: 0 auto 15px;
              width: 180px;
              height: 60px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .logo {
              max-height: 100%;
              max-width: 100%;
            }
            
            .title {
              font-size: 28px;
              font-weight: 700;
              margin: 10px 0 5px;
              color: var(--dark);
              letter-spacing: -0.5px;
            }
            
            .subtitle {
              font-size: 16px;
              color: var(--gray);
              font-weight: 400;
            }
            
            /* Carte principale avec ombre portée */
            .receipt-card {
              background: white;
              border-radius: 12px;
              box-shadow: 0 6px 30px rgba(0, 0, 0, 0.05);
              padding: 30px;
              margin-bottom: 30px;
              position: relative;
              overflow: hidden;
            }
            
            .receipt-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 5px;
              height: 100%;
              background: linear-gradient(to bottom, var(--primary), var(--accent));
            }
            
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              color: var(--secondary);
              display: flex;
              align-items: center;
            }
            
            .section-title::after {
              content: '';
              flex: 1;
              height: 1px;
              background: #eaeaea;
              margin-left: 15px;
            }
            
            /* Grille responsive */
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            
            .info-item {
              margin-bottom: 14px;
            }
            
            .label {
              font-size: 14px;
              color: var(--gray);
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .value {
              font-size: 16px;
              font-weight: 500;
              color: var(--dark);
            }
            
            /* Mise en valeur des montants */
            .amount-highlight {
              background: linear-gradient(to right, #f0f7ff, #e6f4ff);
              padding: 25px;
              border-radius: 10px;
              margin: 25px 0;
            }
            
            .amount-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
            }
            
            .total-amount {
              font-size: 22px;
              font-weight: 700;
              color: var(--primary);
              padding-top: 8px;
              border-top: 2px solid #eee;
            }
            
            /* QR Code moderne */
            .qr-container {
              text-align: center;
              margin: 35px 0;
            }
            
            .qr-placeholder {
              width: 140px;
              height: 140px;
              margin: 0 auto;
              background: linear-gradient(135deg, #f5f9ff, #eef6ff);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(67, 97, 238, 0.1);
            }
            
            .qr-placeholder::before {
              content: 'QR Code';
              color: var(--accent);
              font-weight: 500;
              font-size: 14px;
            }
            
            /* Signature */
            .signature-area {
              margin-top: 50px;
              text-align: right;
            }
            
            .signature-line {
              display: inline-block;
              width: 250px;
              border-top: 1px solid var(--gray);
              margin-top: 5px;
            }
            
            /* Pied de page */
            .footer {
              margin-top: 50px;
              text-align: center;
              color: var(--gray);
              font-size: 14px;
              line-height: 1.6;
            }
            
            .watermark {
              position: absolute;
              right: 30px;
              bottom: 30px;
              opacity: 0.03;
              font-size: 120px;
              font-weight: 800;
              color: var(--dark);
              transform: rotate(-25deg);
              pointer-events: none;
              user-select: none;
            }
          </style>
        </head>
        <body>
          <div class="watermark">VALIDÉ</div>
          
          <div class="header">
            <div class="logo-container">
              <img src="${logoUrl}" class="logo" alt="Company Logo">
            </div>
            <div class="title">Reçu de Paiement</div>
            <div class="subtitle">Confirmation de transaction #${withdrawalData.transactionId}</div>
          </div>
          
          <div class="receipt-card">
            <div class="section-title">Détails de la transaction</div>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Date</div>
                <div class="value">${new Date().toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}</div>
              </div>
              
              <div class="info-item">
                <div class="label">ID Transaction</div>
                <div class="value">${withdrawalData.transactionId}</div>
              </div>
              
              <div class="info-item">
                <div class="label">Méthode de paiement</div>
                <div class="value">${withdrawalData.method}</div>
              </div>
              
              <div class="info-item">
                <div class="label">Statut</div>
                <div class="value" style="color: #10b981; font-weight: 600;">
                  ${withdrawalData.status}
                </div>
              </div>
            </div>
            
            <div class="amount-highlight">
              <div class="amount-row">
                <span>Montant:</span>
                <span style="font-weight: 600;">${withdrawalData.amount} MRO</span>
              </div>
              
              <div class="amount-row">
                <span>Frais:</span>
                <span>${withdrawalData.fees} MRO</span>
              </div>
              
              <div class="amount-row total-amount">
                <span>Montant net:</span>
                <span>${withdrawalData.netAmount} MRO</span>
              </div>
            </div>
            
            ${withdrawalData.method === 'bank' ? `
            <div class="section-title">Informations bancaires</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Banque</div>
                <div class="value">${withdrawalData.bankName || 'N/A'}</div>
              </div>
              
              <div class="info-item">
                <div class="label">Titulaire du compte</div>
                <div class="value">${withdrawalData.accountName || 'N/A'}</div>
              </div>
              
              <div class="info-item">
                <div class="label">Numéro de compte</div>
                <div class="value">${withdrawalData.accountNumber || 'N/A'}</div>
              </div>
              
              ${withdrawalData.rib ? `
              <div class="info-item">
                <div class="label">RIB</div>
                <div class="value">${withdrawalData.rib}</div>
              </div>
              ` : ''}
            </div>
            ` : ''}
          </div>
        
          
          <div class="footer">
            <p>Merci d'utiliser nos services • Ce reçu est une preuve de transaction officielle</p>
            <p>Pour toute assistance, contactez notre support : support@eventmr.com</p>
            <p style="margin-top: 20px; font-size: 13px; opacity: 0.8;">
              Transaction sécurisée • © ${new Date().getFullYear()} EventMR • ID: ${withdrawalData.transactionId}
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
    console.error('Erreur lors de la génération du reçu:', error);
    alert('Erreur lors de la génération du reçu');
    return null;
  }
};

  const requestWithdrawal = async () => {
    if (!withdrawalAmount || isNaN(Number(withdrawalAmount))) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Veuillez entrer un montant valide');
      return;
    }
    
    const amount = Number(withdrawalAmount);
    if (amount > balanceData.available) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Le montant demandé dépasse votre solde disponible');
      return;
    }
    
    if (amount < 10000) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Le montant minimum de retrait est de 10,000 MRO');
      return;
    }
    
    if (withdrawalMethod === 'bank' && (!bankInfo.bankName || !bankInfo.accountNumber)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Veuillez compléter vos informations bancaires');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const receiptData = {
        id: `rec${receipts.length + 1}`,
        date: new Date().toLocaleDateString(),
        amount: amount,
        method: withdrawalMethod,
        transactionId: `TX${Math.floor(Math.random() * 1000000000)}`,
        status: 'Complété',
        fees: withdrawalMethod === 'bank' ? 1000 : 500,
        netAmount: amount - (withdrawalMethod === 'bank' ? 1000 : 500),
        bankName: bankInfo.bankName,
        accountName: bankInfo.accountName,
        accountNumber: bankInfo.accountNumber,
        rib: bankInfo.rib
      };
      
      const receiptUri = await generateReceiptPDF(receiptData, 'https://www.novatrix.dev/logo.png');
      
      if (receiptUri) {
        receiptData.uri = receiptUri;
        
        setSelectedReceipt(receiptData);
        setIsReceiptModalVisible(true);
        
        // Succès
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alert(`Retrait de ${amount.toLocaleString()} MRO effectué avec succès!`);
      }
    } catch (error) {
      console.error('Erreur lors de la demande de retrait:', error);
      alert('Erreur lors de la demande de retrait');
    } finally {
      setIsProcessing(false);
      setIsWithdrawalModalVisible(false);
      setWithdrawalAmount('');
    }
  };

  const shareReceipt = async () => {
    if (!selectedReceipt?.uri) {
      alert('Reçu non disponible');
      return;
    }
    
    try {
      if (!(await Sharing.isAvailableAsync())) {
        alert("Le partage n'est pas disponible sur votre appareil");
        return;
      }

      await Sharing.shareAsync(selectedReceipt.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Partager le reçu',
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error('Erreur lors du partage du reçu:', error);
      alert('Erreur lors du partage du reçu');
    }
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <TouchableOpacity 
        className="bg-white/5 rounded-xl p-4 mb-3"
        onPress={() => {
          if (item.type === 'withdrawal' && item.status === 'completed' && item.receiptId) {
            const receipt = receipts.find(r => r.id === item.receiptId);
            if (receipt) {
              setSelectedReceipt(receipt);
              setIsReceiptModalVisible(true);
            }
          }
        }}
      >
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-white font-bold flex-1">{item.description}</Text>
          <Text className={`text-lg font-bold ${
            item.type === 'income' ? 'text-green-400' : 'text-red-400'
          }`}>
            {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()} MRO
          </Text>
        </View>
        
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400">{item.date}</Text>
          
          {item.type === 'withdrawal' && item.status === 'completed' && item.receiptId ? (
            <View className="flex-row items-center">
              <Ionicons name="receipt" size={16} color="#68f2f4" />
              <Text className="text-teal-400 ml-1">Reçu</Text>
            </View>
          ) : item.type === 'withdrawal' ? (
            <View className={`rounded-full px-2 py-1 ${
              item.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'
            }`}>
              <Text className={`text-xs ${
                item.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {item.status === 'completed' ? 'Complété' : 'En attente'}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEventItem = ({ item }: { item: any }) => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <View className="bg-white/5 rounded-xl p-4 mb-3">
        <Text className="text-white font-bold text-lg mb-2">{item.title}</Text>
        <Text className="text-gray-400 mb-3">{item.date}</Text>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-400">Billets vendus:</Text>
          <Text className="text-white">{item.ticketsSold}</Text>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-400">Chiffre d'affaires:</Text>
          <Text className="text-white font-bold">{item.totalSales.toLocaleString()} MRO</Text>
        </View>
        
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-400">Retraits:</Text>
          <Text className="text-white">{item.withdrawal.toLocaleString()} MRO</Text>
        </View>
        
        <TouchableOpacity 
          className="bg-teal-400/20 py-2 rounded-xl items-center"
          onPress={() => {
            setWithdrawalAmount(item.totalSales.toString());
            setIsWithdrawalModalVisible(true);
          }}
          disabled={item.totalSales <= 0}
        >
          <Text className={`${item.totalSales > 0 ? 'text-teal-400' : 'text-gray-500'} font-medium`}>
            Demander un retrait
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <BackgroundWrapper>
      <View className="flex-1 px-4 pt-16">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-2xl font-bold">Paiements</Text>
          <TouchableOpacity className="bg-teal-400/10 p-2 rounded-full">
            <Ionicons name="help-circle" size={24} color="#68f2f4" />
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
          
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-xl ${activeTab === 'events' ? 'bg-teal-400' : ''}`}
            onPress={() => setActiveTab('events')}
          >
            <Text className={`text-center font-bold ${activeTab === 'events' ? 'text-gray-900' : 'text-teal-400'}`}>
              Événements
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenu des onglets */}
        {activeTab === 'balance' ? (
          // Onglet Solde
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(500)}>
              {/* Carte de solde */}
              <View className="bg-gradient-to-r from-teal-400/20 to-cyan-400/10 rounded-2xl p-6 mb-6">
                <Text className="text-gray-400 mb-1">Solde disponible</Text>
                <Text className="text-white text-3xl font-bold mb-6">
                  {balanceData.available.toLocaleString()} MRO
                </Text>
                
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400">En attente de validation:</Text>
                  <Text className="text-white">{balanceData.pending.toLocaleString()} MRO</Text>
                </View>
              </View>
              
              <View className="bg-white/5 rounded-xl p-4 mb-6">
                <Text className="text-white font-bold mb-3">Dernier retrait</Text>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400">Montant:</Text>
                  <Text className="text-white">{balanceData.lastWithdrawal.amount.toLocaleString()} MRO</Text>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400">Méthode:</Text>
                  <Text className="text-white">{balanceData.lastWithdrawal.method}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Statut:</Text>
                  <View className={`rounded-full px-3 py-1 ${
                    balanceData.lastWithdrawal.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                  }`}>
                    <Text className={`text-xs ${
                      balanceData.lastWithdrawal.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {balanceData.lastWithdrawal.status === 'completed' ? 'Complété' : 'En attente'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                className="bg-teal-400 py-4 rounded-xl flex-row items-center justify-center mb-10"
                onPress={() => setIsWithdrawalModalVisible(true)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Text className="text-gray-900 font-bold text-lg">Traitement en cours...</Text>
                ) : (
                  <>
                    <Ionicons name="cash" size={28} color="#001215" />
                    <Text className="text-gray-900 font-bold text-lg ml-3">Demander un retrait</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        ) : activeTab === 'history' ? (
          <FlatList
            data={paymentHistory}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="bg-white/5 rounded-xl p-8 items-center justify-center mt-4">
                <Ionicons name="receipt" size={48} color="#68f2f4" />
                <Text className="text-white text-center mt-4">
                  Aucune transaction pour le moment
                </Text>
              </View>
            }
          />
        ) : (
          // Onglet Événements
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="bg-white/5 rounded-xl p-8 items-center justify-center mt-4">
                <Ionicons name="calendar" size={48} color="#68f2f4" />
                <Text className="text-white text-center mt-4">
                  Aucun événement avec des transactions
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
        onRequestClose={() => setIsWithdrawalModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 max-h-[90%]">
            <ScrollView>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">Demander un retrait</Text>
                <TouchableOpacity 
                  onPress={() => setIsWithdrawalModalVisible(false)}
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
              
              {withdrawalMethod === 'bank' && (
                <View className="mb-4">
                  <Text className="text-teal-400 mb-2">Informations bancaires</Text>
                  
                  <TextInput
                    className="bg-white/10 text-white p-3 rounded-lg mb-3"
                    placeholder="Nom de la banque"
                    placeholderTextColor="#9ca3af"
                    value={bankInfo.bankName}
                    onChangeText={text => setBankInfo({...bankInfo, bankName: text})}
                    editable={!isProcessing}
                  />
                  
                  <TextInput
                    className="bg-white/10 text-white p-3 rounded-lg mb-3"
                    placeholder="Nom du titulaire du compte"
                    placeholderTextColor="#9ca3af"
                    value={bankInfo.accountName}
                    onChangeText={text => setBankInfo({...bankInfo, accountName: text})}
                    editable={!isProcessing}
                  />
                  
                  <TextInput
                    className="bg-white/10 text-white p-3 rounded-lg mb-3"
                    placeholder="Numéro de compte"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={bankInfo.accountNumber}
                    onChangeText={text => setBankInfo({...bankInfo, accountNumber: text})}
                    editable={!isProcessing}
                  />
                  
                  <TextInput
                    className="bg-white/10 text-white p-3 rounded-lg"
                    placeholder="RIB (Optionnel)"
                    placeholderTextColor="#9ca3af"
                    value={bankInfo.rib}
                    onChangeText={text => setBankInfo({...bankInfo, rib: text})}
                    editable={!isProcessing}
                  />
                </View>
              )}
              
              <View className="bg-yellow-500/10 rounded-xl p-4 mb-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-yellow-400">Frais de transaction:</Text>
                  <Text className="text-yellow-400 font-bold">
                    {withdrawalMethod === 'bank' ? '1,000 MRO' : '500 MRO'}
                  </Text>
                </View>
                <Text className="text-yellow-400 text-xs mt-2">
                  Ces frais seront déduits du montant transféré
                </Text>
              </View>
              
              <View className="bg-green-500/10 rounded-xl p-4 mb-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-green-400">Montant reçu:</Text>
                  <Text className="text-green-400 font-bold text-lg">
                    {withdrawalAmount && !isNaN(Number(withdrawalAmount)) 
                      ? `${(Number(withdrawalAmount) - (withdrawalMethod === 'bank' ? 1000 : 500)).toLocaleString()} MRO`
                      : '0 MRO'}
                  </Text>
                </View>
                <Text className="text-green-400 text-xs mt-2">
                  Montant après déduction des frais
                </Text>
              </View>
              
              <TouchableOpacity 
                className={`py-4 rounded-xl ${isProcessing ? 'bg-gray-400' : 'bg-teal-400'}`}
                onPress={requestWithdrawal}
                disabled={isProcessing}
              >
                <Text className="text-gray-900 font-bold text-center text-lg">
                  {isProcessing ? 'Traitement en cours...' : 'Confirmer le retrait'}
                </Text>
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
              <Text className="text-white text-xl font-bold">Reçu de retrait</Text>
              <TouchableOpacity onPress={() => setIsReceiptModalVisible(false)}>
                <Ionicons name="close" size={24} color="#68f2f4" />
              </TouchableOpacity>
            </View>
            
            {selectedReceipt ? (
              <View className="mb-6">
                <View className="bg-white/5 rounded-xl p-4 mb-4">
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Date:</Text>
                    <Text className="text-white">{selectedReceipt.date}</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">ID Transaction:</Text>
                    <Text className="text-white">{selectedReceipt.transactionId}</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Montant:</Text>
                    <Text className="text-white">{selectedReceipt.amount.toLocaleString()} MRO</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Méthode:</Text>
                    <Text className="text-white">{selectedReceipt.method}</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Frais:</Text>
                    <Text className="text-white">{selectedReceipt.fees.toLocaleString()} MRO</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Montant net:</Text>
                    <Text className="text-white font-bold">{selectedReceipt.netAmount.toLocaleString()} MRO</Text>
                  </View>
                  
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Statut:</Text>
                    <Text className="text-green-400">
                      {selectedReceipt.status}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-teal-400 mb-2">Reçu PDF généré</Text>
                <Text className="text-gray-400 text-sm mb-4">
                  Le reçu a été généré avec succès. 
                  Vous pouvez le partager ou l'imprimer.
                </Text>
                
                <TouchableOpacity 
                  className="bg-teal-400 py-3 rounded-xl flex-row items-center justify-center mb-4"
                  onPress={shareReceipt}
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
              </View>
            ) : (
              <View className="items-center py-10">
                <Ionicons name="warning" size={48} color="#f87171" />
                <Text className="text-white text-lg mt-4">Reçu non disponible</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </BackgroundWrapper>
  );
};

export default PaymentsScreen;