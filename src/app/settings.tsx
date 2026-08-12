import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { getCategories, addCategory, deleteCategory, CustomCategory } from '../services/categoryService';
import { getBudgets, setBudget, Budget } from '../services/budgetService';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [budgets, setBudgets] = useState<Record<string, Budget>>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [hasHardware, setHasHardware] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const styles = createStyles(colors);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, budgs] = await Promise.all([getCategories(), getBudgets()]);
      setCategories(cats);
      setBudgets(budgs);
    } catch (error) {
      console.error(error);
      Alert.alert('Greška', 'Ne mogu se učitati podaci.');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const hardware = await LocalAuthentication.hasHardwareAsync();
      setHasHardware(hardware);
      
      const biometricsSaved = await AsyncStorage.getItem('appLockEnabled');
      if (biometricsSaved === 'true') {
        setIsBiometricEnabled(true);
      }

      const apiKey = await AsyncStorage.getItem('geminiApiKey');
      if (apiKey) {
        setGeminiApiKey(apiKey);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadSettings();
    }, [])
  );

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      // Trying to enable, ask for auth first
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Potvrdite identitet za uključivanje zaključavanja aplikacije',
      });
      if (result.success) {
        setIsBiometricEnabled(true);
        await AsyncStorage.setItem('appLockEnabled', 'true');
      } else {
        setIsBiometricEnabled(false);
      }
    } else {
      setIsBiometricEnabled(false);
      await AsyncStorage.setItem('appLockEnabled', 'false');
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      Alert.alert('Upozorenje', 'Naziv kategorije ne može biti prazan.');
      return;
    }
    
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Upozorenje', 'Kategorija s tim imenom već postoji.');
      return;
    }

    setAdding(true);
    try {
      const newCat = await addCategory(trimmed);
      setCategories([...categories, newCat]);
      setNewCategoryName('');
    } catch (error) {
      Alert.alert('Greška', 'Dodavanje kategorije nije uspjelo.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert(
      "Obriši kategoriju",
      `Jeste li sigurni da želite obrisati "${name}"?`,
      [
        { text: "Odustani", style: "cancel" },
        { 
          text: "Obriši", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(id);
              setCategories(categories.filter(c => c.id !== id));
            } catch (error) {
              Alert.alert("Greška", "Brisanje nije uspjelo.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: CustomCategory }) => (
    <View style={styles.card}>
      <Text style={styles.categoryName}>{item.name}</Text>
      <TouchableOpacity onPress={() => handleDeleteCategory(item.id, item.name)} style={styles.deleteButton}>
        <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sigurnost</Text>
      </View>
      
      <View style={styles.settingRow}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Zaključavanje Aplikacije</Text>
          <Text style={styles.settingDescription}>
            Zahtijevaj FaceID / TouchID pri ulasku u aplikaciju.
          </Text>
        </View>
        <Switch
          value={isBiometricEnabled}
          onValueChange={toggleBiometrics}
          disabled={!hasHardware}
          trackColor={{ false: '#767577', true: '#34C759' }}
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Skener Računa</Text>
        <Text style={styles.headerSubtitle}>Unesite svoj Google Gemini API ključ za pametno prepoznavanje računa.</Text>
      </View>
      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          value={geminiApiKey}
          onChangeText={setGeminiApiKey}
          placeholder="AIzaSy..."
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          onEndEditing={async () => {
            if (geminiApiKey) {
              await AsyncStorage.setItem('geminiApiKey', geminiApiKey);
              Alert.alert('Spremljeno', 'API ključ je uspješno spremljen.');
            }
          }}
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mjesečni Budžeti</Text>
        <Text style={styles.headerSubtitle}>Postavite limit potrošnje po kategoriji. Unesite iznos i pritisnite Spremi.</Text>
      </View>
      
      {categories.map((cat) => {
        const currentLimit = budgets[cat.name]?.limit?.toString() || '';
        return (
          <View key={`budget-${cat.id}`} style={styles.budgetRow}>
            <Text style={styles.categoryName}>{cat.name}</Text>
            <View style={styles.budgetInputContainer}>
              <TextInput
                style={styles.budgetInput}
                placeholder="Limit (€)"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
                defaultValue={currentLimit}
                onEndEditing={async (e) => {
                  const val = Number(e.nativeEvent.text);
                  if (!isNaN(val) && val > 0) {
                    await setBudget(cat.name, val);
                    setBudgets({...budgets, [cat.name]: { categoryId: cat.name, categoryName: cat.name, limit: val }});
                  }
                }}
              />
            </View>
          </View>
        );
      })}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moje Kategorije</Text>
        <Text style={styles.headerSubtitle}>Ovdje možete dodati nove ili izbrisati postojeće kategorije za Vaše račune.</Text>
      </View>

      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholder="Npr. Vrtić, Kredit..."
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddCategory}
          disabled={adding}
        >
          {adding ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <MaterialIcons name="add" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#208AEF" style={styles.loader} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.backgroundElement,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundElement,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  addButton: {
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundElement,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  deleteButton: {
    padding: 8,
    marginRight: -8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.backgroundElement,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  budgetInputContainer: {
    width: 100,
  },
  budgetInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    color: colors.text,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
