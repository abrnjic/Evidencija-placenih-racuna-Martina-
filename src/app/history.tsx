import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { getBills, deleteBill } from '../services/billService';
import { Bill } from '../types';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from 'expo-router';

export default function HistoryScreen() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const styles = createStyles(colors);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await getBills();
      setBills(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [])
  );

  const handleDelete = (id: string | undefined) => {
    if (!id) return;
    
    Alert.alert(
      "Obriši račun",
      "Jeste li sigurni da želite obrisati ovaj račun?",
      [
        { text: "Odustani", style: "cancel" },
        { 
          text: "Obriši", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBill(id);
              setBills(bills.filter(b => b.id !== id));
            } catch (error) {
              Alert.alert("Greška", "Brisanje nije uspjelo.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Bill }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.dateText}>
          {format(new Date(item.datePaid), 'dd. MMM yyyy.', { locale: hr })}
        </Text>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.amountText}>{item.amount.toFixed(2)} €</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      
      {item.note ? (
        <Text style={styles.noteText}>{item.note}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#208AEF" style={styles.loader} />
      ) : bills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="receipt" size={64} color={colors.icon} />
          <Text style={styles.emptyText}>Nema unesenih računa.</Text>
        </View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.text,
    opacity: 0.7,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.backgroundElement,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(32, 138, 239, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#208AEF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    color: colors.text,
    opacity: 0.6,
    fontSize: 14,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  deleteButton: {
    padding: 8,
  },
  noteText: {
    marginTop: 12,
    color: colors.text,
    opacity: 0.7,
    fontSize: 14,
    fontStyle: 'italic',
  },
});
