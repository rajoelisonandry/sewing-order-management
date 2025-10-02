import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, CreditCard as Edit2, Trash2, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types/order';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [deliveryDateFilter, setDeliveryDateFilter] = useState<Date | null>(
    null
  );
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);

  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
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

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  // Filtrage recherche et date livraison
  useEffect(() => {
    let filtered = [...orders];

    // Filtre par recherche
    if (searchText) {
      filtered = filtered.filter(
        (o) =>
          o.client_name.toLowerCase().includes(searchText.toLowerCase()) ||
          o.model.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtre par date livraison
    if (deliveryDateFilter) {
      filtered = filtered.filter((o) => {
        if (!o.delivery_date) return false;
        const delivery = new Date(o.delivery_date);
        return (
          delivery.getFullYear() === deliveryDateFilter.getFullYear() &&
          delivery.getMonth() === deliveryDateFilter.getMonth() &&
          delivery.getDate() === deliveryDateFilter.getDate()
        );
      });
    }

    setFilteredOrders(filtered);
  }, [searchText, deliveryDateFilter, orders]);

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.clientName}>{item.client_name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => router.push(`/order/${item.id}`)}
            style={styles.actionButton}
          >
            <Edit2 size={20} color="#7F3785" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.client_name)}
            style={styles.actionButton}
          >
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
        <View style={styles.row}>
          <Text style={styles.label}>Livraison:</Text>
          <Text style={styles.value}>
            {item.delivery_date
              ? new Date(item.delivery_date).toLocaleDateString()
              : '-'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
      {/* Barre de recherche */}
      <TextInput
        placeholder="Rechercher par client ou modèle"
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Filtre par date livraison */}
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowDeliveryPicker(true)}
          style={[styles.dateFilterButton, { flex: 1 }]}
        >
          <Text style={styles.dateFilterText}>
            {deliveryDateFilter
              ? `Livraison: ${deliveryDateFilter.toLocaleDateString()}`
              : 'Filtrer par date livraison'}
          </Text>
        </TouchableOpacity>

        {deliveryDateFilter && (
          <TouchableOpacity
            onPress={() => setDeliveryDateFilter(null)}
            style={[styles.resetButton]}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>X</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDeliveryPicker && (
        <DateTimePicker
          value={deliveryDateFilter || new Date()}
          mode="date"
          display="spinner"
          onChange={(_e, date) => {
            setShowDeliveryPicker(false);
            if (date) setDeliveryDateFilter(date);
          }}
        />
      )}

      <FlatList
        data={filteredOrders}
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
        onPress={() => router.push('/order/new')}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal détails de commande */}
      {selectedOrder && (
        <Modal
          visible={modalVisible}
          animationType="none"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color="#111827" />
              </TouchableOpacity>
              <ScrollView>
                <Text style={styles.modalTitle}>
                  Détails de {selectedOrder.client_name}
                </Text>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Modèle:</Text>
                  <Text style={styles.modalValue}>{selectedOrder.model}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Couleur:</Text>
                  <Text style={styles.modalValue}>
                    {selectedOrder.fabric_color}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Taille:</Text>
                  <Text style={styles.modalValue}>{selectedOrder.size}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Livraison:</Text>
                  <Text style={styles.modalValue}>
                    {selectedOrder.delivery_date
                      ? new Date(
                          selectedOrder.delivery_date
                        ).toLocaleDateString()
                      : '-'}
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Prix du tissu:</Text>
                    <Text style={styles.priceValue}>
                      {selectedOrder.fabric_price.toFixed(2)} Ar
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Prix de vente:</Text>
                    <Text style={styles.priceValue}>
                      {selectedOrder.selling_price.toFixed(2)} Ar
                    </Text>
                  </View>
                  <View style={[styles.priceRow, styles.profitRow]}>
                    <Text style={styles.profitLabel}>Bénéfice:</Text>
                    <Text
                      style={[
                        styles.profitValue,
                        selectedOrder.profit >= 0
                          ? styles.profitPositive
                          : styles.profitNegative,
                      ]}
                    >
                      {selectedOrder.profit.toFixed(2)} Ar
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  searchInput: {
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateFilterButton: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateFilterText: { color: '#7F3785', fontWeight: '500' },
  listContent: { paddingBottom: 80 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
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
  clientName: { fontSize: 20, fontWeight: 'bold', color: '#111827', flex: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8 },
  cardBody: { marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 8 },
  label: { fontSize: 14, color: '#6b7280', width: 80 },
  value: { fontSize: 14, color: '#111827', flex: 1, fontWeight: '500' },
  cardFooter: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceLabel: { fontSize: 14, color: '#6b7280' },
  priceValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  profitRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  profitLabel: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  profitValue: { fontSize: 16, fontWeight: 'bold' },
  profitPositive: { color: '#059669' },
  profitNegative: { color: '#dc2626' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#CC2C7F',
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
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  closeButton: { alignSelf: 'flex-end', marginBottom: 8 },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalLabel: { fontSize: 14, color: '#6b7280' },
  modalValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  resetButton: {
    backgroundColor: '#CC2C7F',
    marginLeft: 8,
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
