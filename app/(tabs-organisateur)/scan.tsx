import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const ScanScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flashMode, setFlashMode] = useState('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [validationData, setValidationData] = useState(null);
  
  const cameraRef = useRef(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
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
    ).start();

    return () => {
      scanLineAnim.stopAnimation();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const validateTicket = async (encryptedData) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Erreur', 'Token non trouvé. Veuillez vous reconnecter.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://eventick.onrender.com/api/tickets/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ encryptedData }),
      });

      const data = await response.json();

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

  const handleBarCodeScanned = ({ data }) => {
    const cleanData = data.trim();
    validateTicket(cleanData);
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'torch' : 'off');
  };

  const closeValidationModal = () => {
    setValidationModalVisible(false);
    setValidationData(null);
  };

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
        <Text style={styles.loadingText}>Demande d'autorisation pour la caméra...</Text>
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
        <Ionicons name="camera-off" size={64} color="white" />
        <Text style={styles.errorTitle}>Accès à la caméra refusé</Text>
        <Text style={styles.errorSubtitle}>
          Veuillez autoriser l'accès à la caméra dans les paramètres de votre appareil
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Demander à nouveau</Text>
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
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner de Tickets</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.scannerContainer}>
        <View style={styles.cameraWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            onBarcodeScanned={isLoading ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            flashMode={flashMode}
          />
          
          <View style={styles.overlay}>
            <View style={styles.topOverlay}>
              <Text style={styles.overlayText}>Positionnez le QR code dans le cadre</Text>
            </View>
            
            <View style={styles.middleOverlay}>
              <View style={styles.focusBox}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
                
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
                  name={flashMode === 'off' ? 'flash-off' : 'flash'} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#ec673b" />
              <Text style={styles.loadingText}>Validation en cours...</Text>
            </View>
          )}
        </View>
      </View>

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

            {validationData && (
              <View style={styles.validationDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="ticket" size={20} color="#ec673b" />
                  <Text style={styles.detailText}>
                    Référence: {validationData.ticket?.ticketRef}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="hash" size={20} color="#ec673b" />
                  <Text style={styles.detailText}>
                    Numéro: {validationData.ticket?.ticketNumber}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={20} color="#ec673b" />
                  <Text style={styles.detailText}>
                    Événement: {validationData.ticket?.event}
                  </Text>
                </View>
                
                {validationData.ticket?.usedAt && (
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={20} color="#ec673b" />
                    <Text style={styles.detailText}>
                      Utilisé le: {new Date(validationData.ticket.usedAt).toLocaleString()}
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
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: '#ec673b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  },
  focusBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(104, 242, 244, 0.3)',
    borderRadius: 16,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#68f2f4',
    backgroundColor: 'transparent',
  },
  cornerTopLeft: {
    top: -4,
    left: -4,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  cornerTopRight: {
    top: -4,
    right: -4,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  cornerBottomLeft: {
    bottom: -4,
    left: -4,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  cornerBottomRight: {
    bottom: -4,
    right: -4,
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
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  validationDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#ec673b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ScanScreen;