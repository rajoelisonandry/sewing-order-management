import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Platform,
  FlatList,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types/order';

interface StatsData {
  ordersCount: number;
  totalRevenue: number;
  totalProfit: number;
}

export default function StatsScreen() {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    ordersCount: 0,
    totalRevenue: 0,
    totalProfit: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (selectedDate: Date) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();

      const filtered = (data || []).filter((order) => {
        const d = new Date(order.created_at);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });

      setOrders(filtered);

      const ordersCount = filtered.length;
      const totalRevenue = filtered.reduce(
        (sum, o) => sum + o.selling_price,
        0
      );
      const totalProfit = filtered.reduce((sum, o) => sum + o.profit, 0);

      setStats({ ordersCount, totalRevenue, totalProfit });
    } catch (err) {
      console.error('Erreur stats:', err);
    }
  };

  useEffect(() => {
    fetchOrders(date);
  }, [date]);

  const onChange = (_event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(date).finally(() => setRefreshing(false));
  }, [date]);

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderText}>
        {item.client_name} - {item.model}
      </Text>
      <Text style={styles.orderSubText}>
        {item.size} | {item.fabric_color} |{' '}
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filtre mois stylé */}
      <View style={styles.filterCard}>
        <Text style={styles.filterLabel}>Filtrer par mois :</Text>
        <Button title="Choisir un mois" onPress={() => setShowPicker(true)} />
        <Text style={styles.currentMonth}>
          {date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={onChange}
        />
      )}

      {/* Tableau des stats */}
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Nombre de commandes</Text>
          <Text style={styles.cellValue}>{stats.ordersCount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Chiffre d'affaires</Text>
          <Text style={styles.cellValue}>
            {stats.totalRevenue.toFixed(2)} Ar
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Bénéfice</Text>
          <Text
            style={[
              styles.cellValue,
              { color: stats.totalProfit >= 0 ? '#059669' : '#dc2626' },
            ]}
          >
            {stats.totalProfit.toFixed(2)} Ar
          </Text>
        </View>
      </View>

      {/* Titre de la liste */}
      <Text style={styles.listTitle}>Commandes du mois</Text>

      {/* Liste des commandes */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={{ marginTop: 10, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            Aucune commande ce mois
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f3f4f6' },
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  currentMonth: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#7F3785',
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cellLabel: { fontSize: 16, fontWeight: '500', color: '#374151' },
  cellValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  orderSubText: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
