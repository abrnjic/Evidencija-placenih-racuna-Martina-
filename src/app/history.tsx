import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { getBills, deleteBill } from '../services/billService';
import { Bill } from '../types';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

export default function HistoryScreen() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleExportPDF = async () => {
    if (bills.length === 0) {
      Alert.alert('Nema podataka', 'Nemate evidentiranih računa za izvoz.');
      return;
    }

    try {
      let total = 0;
      let rows = '';
      
      bills.forEach(b => {
        total += b.amount;
        rows += `
          <tr>
            <td>${format(new Date(b.datePaid), 'dd.MM.yyyy')}</td>
            <td>${b.category}</td>
            <td>${b.amount.toFixed(2)} €</td>
            <td>${b.note || ''}</td>
          </tr>
        `;
      });

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Helvetica, sans-serif; padding: 20px; }
              h1 { color: #208AEF; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>Izvještaj o plaćenim računima</h1>
            <table>
              <tr>
                <th>Datum</th>
                <th>Kategorija</th>
                <th>Iznos</th>
                <th>Napomena</th>
              </tr>
              ${rows}
            </table>
            <div class="total">Ukupno plaćeno: ${total.toFixed(2)} €</div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do pogreške pri generiranju PDF-a.');
    }
  };

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

  const handlePay = (id: string | undefined) => {
    if (!id) return;
    router.push(`/pay?id=${id}`);
  };

  const renderItem = ({ item, index }: { item: Bill, index: number }) => (
    <Animated.View 
      entering={FadeIn.delay(index * 100)} 
      exiting={FadeOut}
      layout={Layout.springify()}
      style={styles.card}
    >
      {item.isPaid && (
        <View style={styles.stampContainer}>
          <Text style={styles.stampText}>PLAĆENO</Text>
        </View>
      )}
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.dateText}>
            Ubačeno: {format(new Date(item.datePaid), 'dd. MMM yyyy.', { locale: hr })}
          </Text>
          {item.dueDate && (
            <Text style={[styles.dateText, { color: item.isPaid ? '#34C759' : '#FF3B30', fontWeight: 'bold' }]}>
              Rok: {format(new Date(item.dueDate), 'dd. MMM yyyy.', { locale: hr })}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.amountText}>{item.amount.toFixed(2)} €</Text>
        <View style={styles.actionsContainer}>
          {!item.isPaid && (
            <TouchableOpacity onPress={() => handlePay(item.id)} style={styles.payButton}>
              <Text style={styles.payButtonText}>PLATI</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => router.push(`/edit/${item.id}`)} 
            style={styles.actionButton}
          >
            <MaterialIcons name="edit" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
            <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.note ? (
        <Text style={styles.noteText}>{item.note}</Text>
      ) : null}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Povijest računa</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
          <MaterialIcons name="picture-as-pdf" size={24} color="#fff" />
          <Text style={styles.exportButtonText}>Izvezi</Text>
        </TouchableOpacity>
      </View>

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
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  exportButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
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
    overflow: 'hidden',
  },
  stampContainer: {
    position: 'absolute',
    top: 30,
    right: 20,
    transform: [{ rotate: '-15deg' }],
    borderWidth: 3,
    borderColor: 'rgba(52, 199, 89, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    zIndex: 10,
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
  },
  stampText: {
    color: 'rgba(52, 199, 89, 0.4)',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noteText: {
    marginTop: 12,
    color: colors.text,
    opacity: 0.7,
    fontSize: 14,
    fontStyle: 'italic',
  },
});
