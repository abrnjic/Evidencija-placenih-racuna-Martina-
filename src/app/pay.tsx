import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, useColorScheme, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getBillById, updateBill } from '../services/billService';
import { Bill } from '../types';
import Colors from '../constants/Colors';
import * as Clipboard from 'expo-clipboard';
import { useGooglePay, GooglePayButton } from '@stripe/stripe-react-native';

export default function PayScreen() {
  const { id } = useLocalSearchParams();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const styles = createStyles(colors);

  const { isGooglePaySupported, initGooglePay, createGooglePayPaymentMethod } = useGooglePay();
  const [gpaySupported, setGpaySupported] = useState(false);

  useEffect(() => {
    const fetchBill = async () => {
      if (!id || typeof id !== 'string') return;
      try {
        const fetchedBill = await getBillById(id);
        setBill(fetchedBill || null);
      } catch (error) {
        console.error('Error fetching bill for payment:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBill();
  }, [id]);

  useEffect(() => {
    const initializeGooglePay = async () => {
      if (!(await isGooglePaySupported({ testEnv: true }))) {
        return;
      }
      const { error } = await initGooglePay({
        testEnv: true,
        merchantName: 'Evidencija Računa',
        countryCode: 'HR',
        billingAddressConfig: {
            format: 'MIN',
            isPhoneNumberRequired: false,
            isRequired: false,
        },
        existingPaymentMethodRequired: false,
        isEmailRequired: false,
      });
      if (!error) {
        setGpaySupported(true);
      }
    };
    if (Platform.OS === 'android') {
      initializeGooglePay();
    }
  }, []);

  const copyToClipboard = async (text: string, type: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Kopirano!', `${type} je kopiran u međuspremnik.`);
  };

  const payWithGooglePay = async () => {
    if (!bill) return;
    try {
      const { error, paymentMethod } = await createGooglePayPaymentMethod({
        amount: Math.round(bill.amount * 100), // amount in cents
        currencyCode: 'EUR',
      });
      
      if (error) {
        Alert.alert('Plaćanje prekinuto', error.message);
        return;
      }
      
      // If success, we pretend we charged them (we got the token)
      markAsPaid();
    } catch (e) {
      console.log(e);
      Alert.alert('Greška', 'Nije moguće pokrenuti Google Pay.');
    }
  };

  const markAsPaid = async () => {
    if (!bill || !bill.id) return;
    try {
      setLoading(true);
      await updateBill(bill.id, { isPaid: true, datePaid: new Date().toISOString() });
      Alert.alert('Uspješno', 'Račun je označen kao plaćen!');
      router.back();
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške prilikom spremanja.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  if (!bill) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Račun nije pronađen.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Plati Račun</Text>
      <Text style={styles.subtitle}>Otvorite svoju aplikaciju za mobilno bankarstvo i kopirajte podatke ispod za plaćanje.</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardCategory}>{bill.category}</Text>
        <Text style={styles.cardAmount}>{bill.amount.toFixed(2)} €</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>IBAN primatelja</Text>
            <Text style={styles.detailValue}>{bill.iban || 'Nije poznat'}</Text>
          </View>
          {bill.iban ? (
            <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(bill.iban!, 'IBAN')}>
              <MaterialIcons name="content-copy" size={20} color="#208AEF" />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.divider} />
        
        <View style={styles.detailRow}>
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Iznos</Text>
            <Text style={styles.detailValue}>{bill.amount.toFixed(2)} EUR</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(bill.amount.toFixed(2).toString(), 'Iznos')}>
            <MaterialIcons name="content-copy" size={20} color="#208AEF" />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Model i Poziv na broj</Text>
            <Text style={styles.detailValue}>
              {bill.model ? bill.model + ' ' : ''}{bill.pozivNaBroj || 'Nije poznat'}
            </Text>
          </View>
          {bill.pozivNaBroj ? (
            <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(`${bill.model ? bill.model + ' ' : ''}${bill.pozivNaBroj}`, 'Poziv na broj')}>
              <MaterialIcons name="content-copy" size={20} color="#208AEF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {gpaySupported && Platform.OS === 'android' ? (
        <GooglePayButton
          type="pay"
          onPress={payWithGooglePay}
          style={styles.googlePayButton}
        />
      ) : null}

      <TouchableOpacity style={styles.confirmButton} onPress={markAsPaid}>
        <MaterialIcons name="check-circle" size={24} color="#fff" style={{marginRight: 8}} />
        <Text style={styles.confirmButtonText}>Potvrdi da je plaćeno (Ručno)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  errorText: {
    color: colors.text,
    fontSize: 18,
  },
  card: {
    backgroundColor: '#208AEF',
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardCategory: {
    color: '#E0F0FF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: colors.backgroundElement,
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  copyBtn: {
    padding: 8,
    backgroundColor: 'rgba(32, 138, 239, 0.1)',
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#34C759',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  googlePayButton: {
    width: '100%',
    height: 50,
    marginBottom: 16,
  }
});
