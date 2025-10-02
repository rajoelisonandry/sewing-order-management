import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { OrderFormData } from '@/types/order';

const SIZES = ['S', 'M', 'L', 'XL'];

export default function OrderFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isNew = id === 'new';

  const [formData, setFormData] = useState<OrderFormData>({
    client_name: '',
    model: '',
    fabric_color: '',
    size: '',
    fabric_price: '',
    selling_price: '',
  });
  const [loading, setLoading] = useState(false);
  const [calculatedProfit, setCalculatedProfit] = useState<number>(0);

  useEffect(() => {
    if (!isNew && id) {
      fetchOrder();
    }
  }, [id]);

  useEffect(() => {
    const fabricPrice = parseFloat(formData.fabric_price) || 0;
    const sellingPrice = parseFloat(formData.selling_price) || 0;
    setCalculatedProfit(sellingPrice - fabricPrice);
  }, [formData.fabric_price, formData.selling_price]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFormData({
          client_name: data.client_name,
          model: data.model,
          fabric_color: data.fabric_color,
          size: data.size,
          fabric_price: data.fabric_price.toString(),
          selling_price: data.selling_price.toString(),
        });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Erreur', 'Impossible de charger la commande');
      router.back();
    }
  };

  const validateForm = (): boolean => {
    if (!formData.client_name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du client');
      return false;
    }
    if (!formData.model.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le modèle');
      return false;
    }
    if (!formData.fabric_color.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer la couleur du tissu');
      return false;
    }
    if (!formData.size.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner ou entrer une taille');
      return false;
    }
    if (!formData.fabric_price || isNaN(parseFloat(formData.fabric_price))) {
      Alert.alert('Erreur', 'Veuillez entrer un prix du tissu valide');
      return false;
    }
    if (!formData.selling_price || isNaN(parseFloat(formData.selling_price))) {
      Alert.alert('Erreur', 'Veuillez entrer un prix de vente valide');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const orderData = {
        client_name: formData.client_name.trim(),
        model: formData.model.trim(),
        fabric_color: formData.fabric_color.trim(),
        size: formData.size.trim(),
        fabric_price: parseFloat(formData.fabric_price),
        selling_price: parseFloat(formData.selling_price),
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { error } = await supabase
          .from('orders')
          .insert([orderData]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', id);

        if (error) throw error;
      }

      router.back();
    } catch (error) {
      console.error('Error saving order:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du client *</Text>
            <TextInput
              style={styles.input}
              value={formData.client_name}
              onChangeText={(text) =>
                setFormData({ ...formData, client_name: text })
              }
              placeholder="Ex: Marie Dupont"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modèle *</Text>
            <TextInput
              style={styles.input}
              value={formData.model}
              onChangeText={(text) => setFormData({ ...formData, model: text })}
              placeholder="Ex: Robe longue"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Couleur du tissu *</Text>
            <TextInput
              style={styles.input}
              value={formData.fabric_color}
              onChangeText={(text) =>
                setFormData({ ...formData, fabric_color: text })
              }
              placeholder="Ex: Bleu marine"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Taille *</Text>
            <View style={styles.sizeContainer}>
              {SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    formData.size === size && styles.sizeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, size })}>
                  <Text
                    style={[
                      styles.sizeButtonText,
                      formData.size === size && styles.sizeButtonTextActive,
                    ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, styles.inputMarginTop]}
              value={!SIZES.includes(formData.size) ? formData.size : ''}
              onChangeText={(text) => setFormData({ ...formData, size: text })}
              placeholder="Ou saisir une taille personnalisée"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix du tissu (€) *</Text>
            <TextInput
              style={styles.input}
              value={formData.fabric_price}
              onChangeText={(text) =>
                setFormData({ ...formData, fabric_price: text })
              }
              placeholder="Ex: 45.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix de vente (€) *</Text>
            <TextInput
              style={styles.input}
              value={formData.selling_price}
              onChangeText={(text) =>
                setFormData({ ...formData, selling_price: text })
              }
              placeholder="Ex: 120.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.profitContainer}>
            <Text style={styles.profitLabel}>Bénéfice estimé:</Text>
            <Text
              style={[
                styles.profitValue,
                calculatedProfit >= 0 ? styles.profitPositive : styles.profitNegative,
              ]}>
              {calculatedProfit.toFixed(2)} €
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}>
          <Text style={styles.saveButtonText}>
            {loading ? 'Enregistrement...' : isNew ? 'Créer' : 'Modifier'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  inputMarginTop: {
    marginTop: 8,
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sizeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  sizeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  sizeButtonTextActive: {
    color: '#fff',
  },
  profitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  profitLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  profitValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profitPositive: {
    color: '#059669',
  },
  profitNegative: {
    color: '#dc2626',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
