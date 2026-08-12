import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const styles = createStyles(colors);

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Aplikacija treba pristup Vašoj kameri za skeniranje barkodova.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Dopusti pristup</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      
      // Index 6 is the Recipient Name (Ime primatelja)
      const recipientName = parsedLines[6] ? parsedLines[6].trim() : '';
      // Index 13 is the Description (Opis plaćanja) which often contains due date
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

      return { amount, category, note: noteText };
    } catch (error) {
      console.error('Error parsing HUB3:', error);
      return null;
    }
  };

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    const result = parseHUB3(data);

    if (result) {
      router.replace({
        pathname: '/add',
        params: { 
          scannedAmount: result.amount,
          scannedCategory: result.category || '',
          scannedNote: result.note || ''
        }
      });
    } else {
      Alert.alert(
        'Greška',
        'Skenirani kod nije prepoznat kao važeća HUB3 uplatnica.',
        [{ text: 'Pokušaj ponovno', onPress: () => setScanned(false) }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['pdf417'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Skeniraj HUB3 Barkod</Text>
          </View>
          
          <View style={styles.targetBoxContainer}>
            <View style={styles.targetBox} />
            <Text style={styles.instructionText}>Usmjerite kameru prema 2D barkodu na uplatnici</Text>
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
    backgroundColor: 'rgba(0,0,0,0.4)', // Dim background
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
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
