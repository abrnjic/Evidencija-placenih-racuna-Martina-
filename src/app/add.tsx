import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addBill } from '../services/billService';
import { Category } from '../types';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

const CATEGORIES: Category[] = ['Struja', 'Voda', 'Plin', 'Smeće', 'Pričuva', 'Internet/TV', 'Mobitel', 'Ostalo'];

export default function AddBillScreen() {
  const [category, setCategory] = useState<Category>('Struja');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  
  const styles = createStyles(colors);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Greška', 'Molimo unesite ispravan iznos.');
      return;
    }

    setLoading(true);
    try {
      await addBill({
        category,
        amount: Number(amount),
        datePaid: new Date().toISOString(),
        note
      });
      Alert.alert('Uspješno', 'Račun je uspješno dodan!');
      router.push('/history');
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške prilikom spremanja.');
    } finally {
      setLoading(false);
    }
  };

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
          {CATEGORIES.map(cat => (
            <Picker.Item key={cat} label={cat} value={cat} color={scheme === 'dark' ? '#fff' : '#000'} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Iznos (€)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Npr. 45.50"
        placeholderTextColor={colors.icon}
      />

      <Text style={styles.label}>Napomena (opcionalno)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
        placeholder="Npr. Račun za 10. mjesec"
        placeholderTextColor={colors.icon}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Spremi Račun</Text>
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
