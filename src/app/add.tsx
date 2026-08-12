import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addBill } from '../services/billService';
import { getCategories, CustomCategory } from '../services/categoryService';
import { Category } from '../types';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddBillScreen() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [category, setCategory] = useState<Category>('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderPreference, setReminderPreference] = useState(24);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { scannedAmount, scannedCategory, scannedNote, scannedDueDate, scannedIban, scannedModel, scannedPozivNaBroj } = useLocalSearchParams();
  
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  
  const styles = createStyles(colors);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        if (cats.length > 0 && !category) {
          setCategory(cats[0].name);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (scannedAmount && typeof scannedAmount === 'string') {
      setAmount(scannedAmount);
    }
    if (scannedCategory && typeof scannedCategory === 'string' && categories.some(c => c.name === scannedCategory)) {
      setCategory(scannedCategory);
    }
    if (scannedNote && typeof scannedNote === 'string') {
      setNote(scannedNote);
    }
    if (scannedDueDate && typeof scannedDueDate === 'string') {
      const parsedDate = new Date(scannedDueDate);
      if (!isNaN(parsedDate.getTime())) {
        setDueDate(parsedDate);
      }
    }
  }, [scannedAmount, scannedCategory, scannedNote, scannedDueDate, categories]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

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
        datePaid: new Date().toISOString(), // Created date
        dueDate: dueDate.toISOString(),
        isPaid: false,
        reminderPreference,
        note,
        iban: typeof scannedIban === 'string' ? scannedIban : undefined,
        model: typeof scannedModel === 'string' ? scannedModel : undefined,
        pozivNaBroj: typeof scannedPozivNaBroj === 'string' ? scannedPozivNaBroj : undefined
      });
      // Future TODO: Schedule notification here based on reminderPreference
      Alert.alert('Uspješno', 'Račun je uspješno dodan!');
      router.push('/history');
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške prilikom spremanja.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
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
      <View style={styles.amountContainer}>
        <TextInput
          style={[styles.input, styles.amountInput]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Npr. 45.50"
          placeholderTextColor={colors.icon}
        />
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => router.push('/scan')}
        >
          <MaterialIcons name="qr-code-scanner" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Dospijeće plaćanja</Text>
      <TouchableOpacity 
        style={styles.dateButton} 
        onPress={() => setShowDatePicker(true)}
      >
        <MaterialIcons name="event" size={24} color={colors.text} style={{marginRight: 8}} />
        <Text style={{color: colors.text, fontSize: 16}}>
          {dueDate.toLocaleDateString('hr-HR')}
        </Text>
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Podsjeti me prije isteka roka</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={reminderPreference}
          onValueChange={(itemValue) => setReminderPreference(itemValue as number)}
          style={{ color: colors.text }}
          dropdownIconColor={colors.text}
        >
          <Picker.Item label="24 sata prije" value={24} color={scheme === 'dark' ? '#fff' : '#000'} />
          <Picker.Item label="12 sati prije" value={12} color={scheme === 'dark' ? '#fff' : '#000'} />
          <Picker.Item label="8 sati prije" value={8} color={scheme === 'dark' ? '#fff' : '#000'} />
          <Picker.Item label="4 sata prije" value={4} color={scheme === 'dark' ? '#fff' : '#000'} />
        </Picker>
      </View>

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
    </ScrollView>
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElement,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountInput: {
    flex: 1,
  },
  scanButton: {
    backgroundColor: '#34C759',
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
