import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { getBills, addBill } from '../services/billService';
import { Bill } from '../types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [totalLastMonth, setTotalLastMonth] = useState(0);
  const [lastMonthBills, setLastMonthBills] = useState<Bill[]>([]);
  const [thisMonthBillsCount, setThisMonthBillsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);
  const router = useRouter();

  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const styles = createStyles(colors);

  const calculateTotals = async () => {
    try {
      setLoading(true);
      const bills = await getBills();
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const lastMonthDate = new Date(now);
      lastMonthDate.setMonth(currentMonth - 1);
      const lastMonth = lastMonthDate.getMonth();
      const lastMonthYear = lastMonthDate.getFullYear();

      let currentTotal = 0;
      let lastTotal = 0;
      let currentMonthCount = 0;
      const lastMonthBillsArray: Bill[] = [];

      bills.forEach(bill => {
        const billDate = new Date(bill.datePaid);
        if (billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear) {
          currentTotal += bill.amount;
          currentMonthCount++;
        } else if (billDate.getMonth() === lastMonth && billDate.getFullYear() === lastMonthYear) {
          lastTotal += bill.amount;
          lastMonthBillsArray.push(bill);
        }
      });

      setTotalThisMonth(currentTotal);
      setTotalLastMonth(lastTotal);
      setLastMonthBills(lastMonthBillsArray);
      setThisMonthBillsCount(currentMonthCount);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      calculateTotals();
    }, [])
  );

  const handleDuplicate = () => {
    if (lastMonthBills.length === 0) {
      Alert.alert('Nema računa', 'Prošli mjesec nemate plaćenih računa za kopiranje.');
      return;
    }
    
    if (thisMonthBillsCount > 0) {
      Alert.alert(
        'Upozorenje',
        'Već imate unesene račune za ovaj mjesec. Želite li svejedno iskopirati prošlomjesečne račune i potencijalno ih duplicirati?',
        [
          { text: 'Odustani', style: 'cancel' },
          { text: 'Kopiraj svejedno', onPress: performDuplication }
        ]
      );
    } else {
      performDuplication();
    }
  };

  const performDuplication = async () => {
    setDuplicating(true);
    try {
      const now = new Date();
      // Generate promises to add each bill
      const addPromises = lastMonthBills.map(bill => {
        return addBill({
          category: bill.category,
          amount: bill.amount, // copy exact amount, user can edit later
          datePaid: now.toISOString(),
          note: bill.note ? `(Kopirano) ${bill.note}` : '(Kopirano)'
        });
      });
      
      await Promise.all(addPromises);
      Alert.alert('Uspješno!', `Iskopirano je ${lastMonthBills.length} računa u ovaj mjesec. Možete ih izmijeniti u Povijesti.`);
      await calculateTotals(); // refresh
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do problema pri kopiranju.');
    } finally {
      setDuplicating(false);
    }
  };

  const difference = totalThisMonth - totalLastMonth;
  const isHigher = difference > 0;

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#208AEF" style={styles.loader} />
      ) : (
        <View style={styles.content}>
          <Text style={styles.headerTitle}>Pregled troškova</Text>
          
          <View style={styles.mainCard}>
            <Text style={styles.cardLabel}>Ovaj mjesec</Text>
            <Text style={styles.totalAmount}>{totalThisMonth.toFixed(2)} €</Text>
            
            <View style={styles.comparisonContainer}>
              <Text style={styles.comparisonText}>
                {Math.abs(difference).toFixed(2)} € {isHigher ? 'više' : 'manje'} nego prošli mjesec
              </Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Prošli mjesec</Text>
              <Text style={styles.statAmount}>{totalLastMonth.toFixed(2)} €</Text>
            </View>
          </View>
          
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.duplicateButton}
              onPress={handleDuplicate}
              disabled={duplicating}
            >
              {duplicating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="content-copy" size={24} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.duplicateButtonText}>Kopiraj prošli mjesec</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.hintText}>
              Brzo kopirajte sve račune iz prošlog mjeseca, a zatim u Povijesti izmijenite samo iznose računa koji variraju (npr. struja).
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  mainCard: {
    backgroundColor: '#208AEF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  totalAmount: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  comparisonContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  comparisonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundElement,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statLabel: {
    color: colors.text,
    opacity: 0.6,
    fontSize: 14,
    marginBottom: 8,
  },
  statAmount: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionsSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  duplicateButton: {
    backgroundColor: '#34C759', // Green color
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  duplicateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintText: {
    color: colors.text,
    opacity: 0.6,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
    paddingHorizontal: 10,
  }
});
