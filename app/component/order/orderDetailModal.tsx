import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Order } from '@/types/order';
import { getStatusByValue } from '@/app/constant/constant';

interface Props {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailModal({ visible, order, onClose }: Props) {
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  if (!order) return null;

  const quantity = order.order_count ? order.order_count : 1;
  const totalToPay = order.selling_price * quantity;
  const advance = order.advance_payment ?? 0;
  const remaining = totalToPay - advance;
  const totalProfit = order.profit * quantity;

  return (
    <>
      <Modal visible={visible} animationType="none" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#111827" />
            </TouchableOpacity>

            <ScrollView>
              <Text style={styles.modalTitle}>
                Détails de {order.client_name}
              </Text>

              {order.model_image ? (
                <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
                  <Image
                    source={{ uri: order.model_image }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : null}

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Modèle:</Text>
                <Text style={styles.modalValue}>{order.model}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Couleur:</Text>
                <Text style={styles.modalValue}>{order.fabric_color}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Taille:</Text>
                <Text style={styles.modalValue}>{order.size}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Date de livraison:</Text>
                <Text style={styles.modalValue}>
                  {order.delivery_date
                    ? new Date(order.delivery_date).toLocaleDateString()
                    : '-'}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Lieu:</Text>
                <Text style={styles.modalValue}>
                  {order.delivery_location ? order.delivery_location : '-'}
                </Text>
              </View>
              {order.order_count && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Quantité:</Text>
                  <Text style={styles.modalValue}>{order.order_count}</Text>
                </View>
              )}
              <View style={styles.row}>
                <Text
                  style={[
                    styles.statusLabel,
                    { backgroundColor: getStatusByValue(order.status).color },
                  ]}
                >
                  {getStatusByValue(order.status).label}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Prix du tissu:</Text>
                  <Text style={styles.priceValue}>
                    {order.fabric_price.toFixed(2)} Ar
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Prix de vente (unité):</Text>
                  <Text style={styles.priceValue}>
                    {order.selling_price.toFixed(2)} Ar
                  </Text>
                </View>
              </View>

              <View>
                <View style={[styles.profitRow, styles.priceRow]}>
                  <Text style={styles.profitLabel}>Total à payer:</Text>
                  <Text style={[styles.profitValue, styles.profitPositive]}>
                    {totalToPay.toFixed(2)} Ar
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Acompte:</Text>
                  <Text style={styles.priceValue}>
                    {order.advance_payment ? `${advance.toFixed(2)} Ar` : '-'}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Reste à payer:</Text>
                  <Text style={styles.priceValue}>
                    {remaining.toFixed(2)} Ar
                  </Text>
                </View>
              </View>

              <View style={[styles.priceRow, styles.profitRow]}>
                <Text style={styles.profitLabel}>Bénéfice:</Text>
                <Text
                  style={[
                    styles.profitValue,
                    totalProfit >= 0
                      ? styles.profitPositive
                      : styles.profitNegative,
                  ]}
                >
                  {totalProfit.toFixed(2)} Ar
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {order.model_image && (
        <Modal visible={imageViewerVisible} transparent={true}>
          <ImageViewer
            imageUrls={[{ url: order.model_image }]}
            enableSwipeDown={true}
            onSwipeDown={() => setImageViewerVisible(false)}
            onCancel={() => setImageViewerVisible(false)}
          />
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', marginBottom: 8 },
  statusLabel: {
    width: 65,
    textAlign: 'center',
    color: '#fff',
    paddingVertical: 4,
    borderRadius: 4,
  },
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
  priceLabel: { fontSize: 14, color: '#6b7280' },
  priceValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  cardFooter: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
});
