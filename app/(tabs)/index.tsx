import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, CreditCard as Edit2, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types/order';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const handleDelete = (id: string, clientName: string) => {
    Alert.alert(
      'Supprimer la commande',
      `Voulez-vous vraiment supprimer la commande de ${clientName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', id);

              if (error) throw error;
              fetchOrders();
            } catch (error) {
              console.error('Error deleting order:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la commande');
            }
          },
        },
      ]
    );
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.clientName}>{item.client_name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => router.push(`/order/${item.id}`)}
            style={styles.actionButton}>
            <Edit2 size={20} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.client_name)}
            style={styles.actionButton}>
            <Trash2 size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Modèle:</Text>
          <Text style={styles.value}>{item.model}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Couleur:</Text>
          <Text style={styles.value}>{item.fabric_color}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Taille:</Text>
          <Text style={styles.value}>{item.size}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Prix du tissu:</Text>
          <Text style={styles.priceValue}>{item.fabric_price.toFixed(2)} €</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Prix de vente:</Text>
          <Text style={styles.priceValue}>{item.selling_price.toFixed(2)} €</Text>
        </View>
        <View style={[styles.priceRow, styles.profitRow]}>
          <Text style={styles.profitLabel}>Bénéfice:</Text>
          <Text style={[
            styles.profitValue,
            item.profit >= 0 ? styles.profitPositive : styles.profitNegative
          ]}>
            {item.profit.toFixed(2)} €
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune commande</Text>
            <Text style={styles.emptySubtext}>
              Appuyez sur + pour ajouter une nouvelle commande
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/order/new')}>
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  clientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  cardBody: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    fontWeight: '500',
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  profitRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  profitLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  profitValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profitPositive: {
    color: '#059669',
  },
  profitNegative: {
    color: '#dc2626',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
