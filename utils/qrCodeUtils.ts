import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const shareQRCode = async (qrCodeRef: React.RefObject<any>, title: string) => {
  if (!qrCodeRef.current) return;
  
  try {
    const uri = await captureRef(qrCodeRef.current, {
      format: 'png',
      quality: 1,
    });
    
    await Sharing.shareAsync(uri, {
      dialogTitle: `Partager le billet: ${title}`,
      mimeType: 'image/png',
    });
  } catch {
    Alert.alert('Erreur', 'Impossible de partager le billet');
  }
};