import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getBills } from '../services/billService';
import { Bill } from '../types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from 'expo-router';

export default function DashboardScreen() {
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [totalLastMonth, setTotalLastMonth] = useState(0);
  const [loading, setLoading] = useState(true);

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

      bills.forEach(bill => {
        const billDate = new Date(bill.datePaid);
        if (billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear) {
          currentTotal += bill.amount;
        } else if (billDate.getMonth() === lastMonth && billDate.getFullYear() === lastMonthYear) {
          lastTotal += bill.amount;
        }
      });

      setTotalThisMonth(currentTotal);
      setTotalLastMonth(lastTotal);
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
});
