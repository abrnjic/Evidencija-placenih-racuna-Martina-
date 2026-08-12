import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getBillById, updateBill } from '../../services/billService';
import { getCategories, CustomCategory } from '../../services/categoryService';
import { Category } from '../../types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function EditBillScreen() {
  const { id } = useLocalSearchParams();
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [category, setCategory] = useState<Category>('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const styles = createStyles(colors);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);

        if (!id || typeof id !== 'string') return;
        const bill = await getBillById(id);
        if (bill) {
          setCategory(bill.category);
          setAmount(bill.amount.toString());
          setNote(bill.note || '');
        } else {
          Alert.alert('Greška', 'Račun nije pronađen.');
          router.back();
        }
      } catch (error) {
        Alert.alert('Greška', 'Problem sa učitavanjem.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Greška', 'Molimo unesite ispravan iznos.');
      return;
    }

    setSaving(true);
    try {
      if (typeof id === 'string') {
        await updateBill(id, {
          category,
          amount: Number(amount),
          note
        });
        Alert.alert('Uspješno', 'Račun je ažuriran!');
        router.back();
      }
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške prilikom spremanja.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#208AEF" style={{flex: 1, justifyContent: 'center'}} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Kategorija</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue as Category)}
          style={{ color: colors.text }}
          dropdownIconColor={colors.text}
        >
          {categories.map(cat => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.name} color={scheme === 'dark' ? '#fff' : '#000'} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Iznos (€)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholderTextColor={colors.icon}
      />

      <Text style={styles.label}>Napomena (opcionalno)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
        placeholderTextColor={colors.icon}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ažuriraj Račun</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.backgroundElement,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: colors.backgroundElement,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#208AEF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
