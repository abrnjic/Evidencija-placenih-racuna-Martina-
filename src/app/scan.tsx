import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { scanReceiptWithAI } from '../services/geminiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const styles = createStyles(colors);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Aplikacija treba pristup Vašoj kameri za skeniranje barkodova.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Dopusti pristup</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const processImageWithAI = async (base64Image: string) => {
    try {
      const apiKey = await AsyncStorage.getItem('geminiApiKey');
      if (!apiKey) {
        Alert.alert('Nedostaje API Ključ', 'Molimo unesite Gemini API ključ u Postavkama (Sigurnost tab).');
        return;
      }

      setProcessingAI(true);
      const result = await scanReceiptWithAI(base64Image);
      
      if (result) {
        router.replace({
          pathname: '/add',
          params: { 
            scannedAmount: result.amount,
            scannedCategory: result.category || '',
            scannedNote: result.note || '',
            scannedDueDate: result.dueDate || '',
            scannedIban: result.iban || '',
            scannedModel: result.model || '',
            scannedPozivNaBroj: result.pozivNaBroj || ''
          }
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Greška', 'AI skeniranje nije uspjelo. Pokušajte ponovno i osigurajte dobro osvjetljenje.');
    } finally {
      setProcessingAI(false);
      setScanned(false);
    }
  };

  const handleAIScan = async () => {
    if (!cameraRef.current) return;
    try {
      setProcessingAI(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      if (!photo?.base64) throw new Error('No base64 data');
      await processImageWithAI(photo.base64);
    } catch (error) {
      setProcessingAI(false);
      console.error(error);
    }
  };

  const handleGalleryPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setScanned(true);
        await processImageWithAI(result.assets[0].base64);
      }
    } catch (error) {
      console.error("Gallery Error:", error);
    }
  };

  const parseHUB3 = (data: string) => {
    try {
      const parsedLines = data.split(/\r?\n/);
      
      if (parsedLines[0] !== 'HRVHUB30') {
        return null;
      }
      
      const amountLine = parsedLines[2];
      if (!amountLine || amountLine.length === 0) {
        return null;
      }
      
      const amountNum = parseInt(amountLine, 10);
      if (isNaN(amountNum)) {
        return null;
      }
      
      const amount = (amountNum / 100).toFixed(2);
      
      const recipientName = parsedLines[6] ? parsedLines[6].trim() : '';
      const iban = parsedLines[8] ? parsedLines[8].trim() : '';
      const model = parsedLines[9] ? parsedLines[9].trim() : '';
      const pozivNaBroj = parsedLines[10] ? parsedLines[10].trim() : '';
      const description = parsedLines[13] ? parsedLines[13].trim() : '';
      
      let noteText = '';
      if (recipientName) noteText += `Izdavač: ${recipientName}`;
      if (description) noteText += (noteText ? '\n' : '') + `Opis: ${description}`;

      let category = null;
      const upperRecipient = recipientName.toUpperCase();
      
      if (upperRecipient.includes('HEP') || upperRecipient.includes('ELEKTRA')) category = 'Struja';
      else if (upperRecipient.includes('VODOOPSKRBA') || upperRecipient.includes('VODOVOD')) category = 'Voda';
      else if (upperRecipient.includes('PLIN') || upperRecipient.includes('GRADSKA PLINARA')) category = 'Plin';
      else if (upperRecipient.includes('ČISTOĆA') || upperRecipient.includes('CISTOCA') || upperRecipient.includes('SMEĆE') || upperRecipient.includes('SMECE')) category = 'Smeće';
      else if (upperRecipient.includes('GSKG') || upperRecipient.includes('UPRAVITELJ') || upperRecipient.includes('PRIČUVA') || upperRecipient.includes('PRICUVA')) category = 'Pričuva';
      else if (upperRecipient.includes('HT') || upperRecipient.includes('TELEKOM') || upperRecipient.includes('ISKON') || upperRecipient.includes('A1') || upperRecipient.includes('TELEMACH')) category = 'Mobitel';

      return { amount, category, note: noteText, iban, model, pozivNaBroj };
    } catch (error) {
      console.error('Error parsing HUB3:', error);
      return null;
    }
  };

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || processingAI) return;
    setScanned(true);

    const result = parseHUB3(data);

    if (result) {
      router.replace({
        pathname: '/add',
        params: { 
          scannedAmount: result.amount,
          scannedCategory: result.category || '',
          scannedNote: result.note || '',
          scannedIban: result.iban || '',
          scannedModel: result.model || '',
          scannedPozivNaBroj: result.pozivNaBroj || ''
        }
      });
    } else {
      Alert.alert(
        'Nije HUB3',
        'Skenirani kod nije prepoznat kao važeća HUB3 uplatnica. Želite li pokušati pametno AI skeniranje?',
        [
          { text: 'Odustani', onPress: () => setScanned(false), style: 'cancel' },
          { text: 'Skeniraj s AI', onPress: handleAIScan }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['pdf417'],
        }}
        onBarcodeScanned={(scanned || processingAI) ? undefined : handleBarcodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} disabled={processingAI}>
              <MaterialIcons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Skeniraj Račun</Text>
            <TouchableOpacity onPress={handleGalleryPick} style={styles.iconButton} disabled={processingAI}>
              <MaterialIcons name="photo-library" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.targetBoxContainer}>
            <View style={styles.targetBox} />
            <Text style={styles.instructionText}>Usmjerite kameru na HUB3 barkod ili učitajte iz galerije (gore desno)</Text>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.aiButton, processingAI && styles.aiButtonDisabled]} 
              onPress={handleAIScan}
              disabled={processingAI}
            >
              {processingAI ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <FontAwesome5 name="magic" size={20} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.aiButtonText}>Pametno AI Skeniranje</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  iconButton: {
    padding: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  targetBoxContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetBox: {
    width: 300,
    height: 100,
    borderWidth: 2,
    borderColor: '#34C759',
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  aiButton: {
    backgroundColor: '#8A2BE2', // Purple for AI magic
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  aiButtonDisabled: {
    opacity: 0.7,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 18,
    color: colors.text,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: '#208AEF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 40,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
