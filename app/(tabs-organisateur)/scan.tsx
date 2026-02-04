import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };

interface TicketData {
  ticketRef: string;
  ticketNumber: string;
  event: string;
  usedAt?: string;
}

interface ValidationData {
  message: string;
  ticket?: TicketData;
}

const ScanScreen: React.FC = () => {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // CORRECTION: Le type FlashMode n'inclut PAS 'torch'
  // Utilisez 'off' | 'on' | 'auto' selon le type FlashMode
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  
  // Ajoutez un état séparé pour la lampe torche
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [validationModalVisible, setValidationModalVisible] = useState<boolean>(false);
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [isActive, setIsActive] = useState(true);
  
  const cameraRef = useRef<CameraView>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Gère l'état actif de l'écran
  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
      };
    }, [])
  );

  // Animation pour la ligne de scan
  useEffect(() => {
    if (!isActive) return;
    
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();

    return () => {
      animation.stop();
    };
  }, [scanLineAnim, isActive]);

  // Demande de permission pour la caméra
  useEffect(() => {
    const getCameraPermission = async () => {
      if (!permission?.granted) {
        const { status } = await requestPermission();
        setHasPermission(status === 'granted');
      } else {
        setHasPermission(true);
      }
    };

    getCameraPermission();
  }, [permission, requestPermission]);

  // Validation du ticket via l'API
  const validateTicket = async (encryptedData: string): Promise<void> => {
    if (!isActive) return;
    
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Erreur', 'Token non trouvé. Veuillez vous reconnecter.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/tickets/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ encryptedData }),
      });

      const data: ValidationData = await response.json();

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setValidationData(data);
        setValidationModalVisible(true);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Erreur de validation',
          data.message || 'Une erreur est survenue lors de la validation du billet'
        );
      }
    } catch (error) {
      console.error('Erreur:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Erreur',
        'Impossible de valider le billet. Vérifiez votre connexion internet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion du scan de code QR
  const handleBarCodeScanned = ({ data }: BarcodeScanningResult): void => {
    if (isLoading || !isActive) return;
    
    const cleanData = data.trim();
    setScanResult(cleanData);
    validateTicket(cleanData);
  };

  // CORRECTION: Basculer entre flash et lampe torche
  const toggleFlash = () => {
    if (flashMode === 'off') {
      // Active la lampe torche
      setTorchEnabled(true);
      setFlashMode('off'); // Gardez flashMode à 'off' car torch est séparé
    } else {
      // Désactive tout
      setTorchEnabled(false);
      setFlashMode('off');
    }
  };

  // Fermer le modal de validation
  const closeValidationModal = (): void => {
    setValidationModalVisible(false);
    setValidationData(null);
    setScanResult(null);
  };

  const handleBack = () => {
    router.back();
  };

  // Écrans d'état pour les permissions
  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#001215', '#00252a', '#00343a', '#006873']}
          locations={[0, 0.3, 0.6, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#68f2f4" />
        <Text style={styles.loadingText}>Demande {"d'autorisation"} pour la caméra...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#001215', '#00252a', '#00343a', '#006873']}
          locations={[0, 0.3, 0.6, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="camera-outline" size={64} color="white" />
        <Text style={styles.errorTitle}>Accès à la caméra refusé</Text>
        <Text style={styles.errorSubtitle}>
          {"Veuillez autoriser l'accès à la caméra dans les paramètres de votre appareil"}
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Demander à nouveau</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.permissionButton, { marginTop: 10, backgroundColor: '#006873' }]}
          onPress={handleBack}
        >
          <Text style={styles.permissionButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#001215', '#00252a', '#00343a', '#006873']}
        locations={[0, 0.3, 0.6, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner de Tickets</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Zone du scanner - seulement si actif */}
      {isActive && (
        <View style={styles.scannerContainer}>
          <View style={styles.cameraWrapper}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{ 
                barcodeTypes: ['qr', 'pdf417', 'aztec', 'codabar'] 
              }}
              flash={flashMode} // Utilise flashMode (off | on | auto)
              enableTorch={torchEnabled} // CORRECTION: Utilise enableTorch pour la lampe torche
            />
            
            {/* Overlay avec cadre de scan */}
            <View style={styles.overlay}>
              <View style={styles.topOverlay}>
                <Text style={styles.overlayText}>Positionnez le QR code dans le cadre</Text>
              </View>
              
              <View style={styles.middleOverlay}>
                <View style={styles.focusBox}>
                  {/* Coins du cadre */}
                  <View style={[styles.corner, styles.cornerTopLeft]} />
                  <View style={[styles.corner, styles.cornerTopRight]} />
                  <View style={[styles.corner, styles.cornerBottomLeft]} />
                  <View style={[styles.corner, styles.cornerBottomRight]} />
                  
                  {/* Ligne de scan animée */}
                  <Animated.View 
                    style={[
                      styles.scanLine,
                      {
                        transform: [{
                          translateY: scanLineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 250]
                          })
                        }]
                      }
                    ]}
                  />
                </View>
              </View>
              
              <View style={styles.bottomOverlay}>
                <TouchableOpacity 
                  onPress={toggleFlash}
                  style={styles.iconButton}
                >
                  <Ionicons 
                    // CORRECTION: Vérifiez si la lampe torche est activée
                    name={torchEnabled ? 'flash' : 'flash-off'} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Overlay de chargement */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#ec673b" />
                <Text style={styles.loadingText}>Validation en cours...</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Modal de résultat de validation */}
      <Modal
        visible={validationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeValidationModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {validationData?.message || 'Résultat de validation'}
              </Text>
              <TouchableOpacity onPress={closeValidationModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {validationData?.ticket && (
              <View style={styles.validationDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="ticket-outline" size={20} color="#ec673b" />
                  <Text style={styles.detailText}>
                    Référence: {validationData.ticket.ticketRef}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag-outline" size={20} color="#ec673b" />
                  <Text style={styles.detailText}>
                    Numéro: {validationData.ticket.ticketNumber}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={20} color="#ec673b" />
                  <Text style={styles.detailText}>
                    Événement: {validationData.ticket.event}
                  </Text>
                </View>
                
                {validationData.ticket.usedAt && (
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={20} color="#ec673b" />
                    <Text style={styles.detailText}>
                      Utilisé le: {new Date(validationData.ticket.usedAt).toLocaleString('fr-FR')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeValidationModal}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Les styles restent les mêmes...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001215',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#68f2f4',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: '#ec673b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    width: 40,
  },
  scannerContainer: {
    flex: 1,
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topOverlay: {
    width: '100%',
    paddingTop: 24,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 18, 21, 0.7)',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  middleOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  focusBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(104, 242, 244, 0.3)',
    borderRadius: 16,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#68f2f4',
    backgroundColor: 'transparent',
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },
  scanLine: {
    width: '100%',
    height: 4,
    backgroundColor: '#68f2f4',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  bottomOverlay: {
    width: '100%',
    paddingBottom: 40,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0, 18, 21, 0.7)',
    alignItems: 'center',
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 104, 115, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#68f2f4',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
    color: '#333',
  },
  validationDetails: {
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#ec673b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ScanScreen;