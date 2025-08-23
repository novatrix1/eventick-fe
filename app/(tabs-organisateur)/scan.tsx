import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Animated, Dimensions, StyleSheet } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// Importation directe du fichier JSON
import initialQRCodes from '@/assets/qrcodes/qrcodes.json';

const { width, height } = Dimensions.get('window');

const ScanScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [qrCodes, setQrCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastScanned, setLastScanned] = useState(null);
  const [flashMode, setFlashMode] = useState('off');
  
  const cameraRef = useRef(null);
  const resultTimeoutRef = useRef(null);
  const recentlyScanned = useRef(new Set());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const lastUsedRef = useRef({});

  // Animation de la ligne de scan
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
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      loadQRCodes();
      setIsLoading(false);
    })();

    return () => {
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  const loadQRCodes = () => {
    try {
      const initialLastUsed = {};
      initialQRCodes.forEach(code => {
        if (code.lastUsed) {
          initialLastUsed[code.id] = code.lastUsed;
        }
      });
      lastUsedRef.current = initialLastUsed;
      
      setQrCodes(initialQRCodes);
    } catch (error) {
      console.error('Erreur lors du chargement des QR codes:', error);
      Alert.alert('Erreur', 'Impossible de charger les QR codes');
    }
  };

  const showTemporaryResult = (result) => {
    setScanResult(result);
    setLastScanned(new Date());
    
    // Animation d'apparition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Nettoyer après 3 secondes
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }
    
    resultTimeoutRef.current = setTimeout(() => {
      setScanResult(null);
    }, 3100);
  };

  const formatLastUsed = (timestamp) => {
    if (!timestamp) return 'Jamais utilisé';
    
    const now = new Date();
    const lastUsed = new Date(timestamp);
    const diffTime = Math.abs(now - lastUsed);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  };

  const handleBarCodeScanned = ({ data }) => {
    const cleanData = data.trim();
    const now = Date.now();
    
    if (recentlyScanned.current.has(cleanData)) {
      console.log('Code déjà scanné récemment, ignoré:', cleanData);
      return;
    }
    
    recentlyScanned.current.add(cleanData);
    
    setTimeout(() => {
      recentlyScanned.current.delete(cleanData);
    }, 3000);
    
    const foundCode = qrCodes.find(code => code.id === cleanData);
    
    if (foundCode) {
      if (foundCode.used) {
        const lastUsed = lastUsedRef.current[cleanData] || foundCode.lastUsed;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showTemporaryResult({ 
          status: 'used', 
          data: cleanData,
          lastUsed: lastUsed 
        });
      } else {
        const updatedQrCodes = qrCodes.map(code => 
          code.id === cleanData ? { ...code, used: true, lastUsed: now } : code
        );
        
        lastUsedRef.current[cleanData] = now;
        
        setQrCodes(updatedQrCodes);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showTemporaryResult({ 
          status: 'valid', 
          data: cleanData,
          lastUsed: now 
        });
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showTemporaryResult({ status: 'invalid', data: cleanData });
    }
  };

  const generateNewQRCode = () => {
    try {
      const newId = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newQRCode = { id: newId, used: false };
      
      setQrCodes(prev => [...prev, newQRCode]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('Succès', 'Nouveau QR code généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      Alert.alert('Erreur', 'Impossible de générer un nouveau QR code');
    }
  };

  const resetAllQRCodes = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir réinitialiser tous les QR codes?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Réinitialiser',
          onPress: () => {
            try {
              const resetQrCodes = qrCodes.map(code => ({ 
                ...code, 
                used: false,
                lastUsed: null 
              }));
              
              lastUsedRef.current = {};
              
              setQrCodes(resetQrCodes);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              Alert.alert('Succès', 'Tous les QR codes ont été réinitialisés');
            } catch (error) {
              console.error('Erreur lors de la réinitialisation:', error);
              Alert.alert('Erreur', 'Impossible de réinitialiser les QR codes');
            }
          },
        },
      ]
    );
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'torch' : 'off');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#001215', '#00252a', '#00343a', '#006873']}
          locations={[0, 0.3, 0.6, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <View style={styles.spinner} />
          <Text style={styles.loadingText}>Chargement des QR codes...</Text>
        </View>
      </View>
    );
  }

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
        <Text style={styles.errorSubtitle}>Veuillez autoriser l'accès à la caméra dans les paramètres de votre appareil</Text>
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
        <Text style={styles.headerTitle}>Scanner de Tickets</Text>
        <Text style={styles.headerSubtitle}>Scannez vos codes QR</Text>
      </View>

      {/* Scanner Content */}
      <View style={styles.scannerContainer}>
        <View style={styles.cameraWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            flashMode={flashMode}
          />
          
          {/* Overlay avec cadre de scan */}
          <View style={styles.overlay}>
            {/* Top overlay */}
            <View style={styles.topOverlay}>
              <Text style={styles.overlayText}>Positionnez le QR code dans le cadre</Text>
              {lastScanned && (
                <Text style={styles.lastScannedText}>
                  Dernier scan: {lastScanned.toLocaleTimeString()}
                </Text>
              )}
            </View>
            
            {/* Middle overlay avec cadre de scan */}
            <View style={styles.middleOverlay}>
              <View style={styles.focusBox}>
                {/* Coins décoratifs */}
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
            
            {/* Bottom overlay avec boutons */}
            <View style={styles.bottomOverlay}>
              <View style={styles.buttonRow}>
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
                
                <TouchableOpacity 
                  onPress={generateNewQRCode}
                  style={styles.actionButton}
                >
                  <Ionicons name="add" size={30} color="white" />
                  <Text style={styles.buttonLabel}>Nouveau</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={resetAllQRCodes}
                  style={styles.actionButton}
                >
                  <Ionicons name="refresh" size={24} color="white" />
                  <Text style={styles.buttonLabel}>Réinit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Bannière de résultat */}
          {scanResult && (
            <Animated.View 
              style={[
                styles.resultBanner,
                { opacity: fadeAnim },
                scanResult.status === 'valid' && styles.validBanner,
                scanResult.status === 'used' && styles.usedBanner,
                scanResult.status === 'invalid' && styles.invalidBanner,
              ]}
            >
              <View style={styles.resultContent}>
                {scanResult.status === 'valid' && (
                  <Ionicons name="checkmark-circle" size={28} color="white" />
                )}
                {scanResult.status === 'used' && (
                  <Ionicons name="time" size={28} color="white" />
                )}
                {scanResult.status === 'invalid' && (
                  <Ionicons name="close-circle" size={28} color="white" />
                )}
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultTitle}>
                    {scanResult.status === 'valid' && 'Ticket valide et marqué comme utilisé'}
                    {scanResult.status === 'used' && 'Ticket déjà utilisé'}
                    {scanResult.status === 'invalid' && 'Ticket invalide'}
                  </Text>
                  
                  <Text style={styles.resultData} numberOfLines={1}>
                    {scanResult.data}
                  </Text>
                  
                  {(scanResult.status === 'used' || scanResult.status === 'valid') && scanResult.lastUsed && (
                    <Text style={styles.lastUsedText}>
                      {scanResult.status === 'valid' 
                        ? 'Marqué comme utilisé maintenant' 
                        : `Dernière utilisation: ${formatLastUsed(scanResult.lastUsed)}`
                      }
                    </Text>
                  )}
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
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
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: 'white',
    borderTopColor: 'transparent',
    marginRight: 12,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorTitle: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#68f2f4',
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#68f2f4',
    textAlign: 'center',
    marginTop: 4,
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: '600',
  },
  lastScannedText: {
    color: '#68f2f4',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
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
    paddingBottom: 10,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0, 18, 21, 0.7)',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 104, 115, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#68f2f4',
  },
  buttonLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  resultBanner: {
    position: 'absolute',
    top: 150,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  validBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  usedBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
  },
  invalidBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  resultTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultData: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  lastUsedText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
});

export default ScanScreen;