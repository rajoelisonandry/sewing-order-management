import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '@/types/order';
import { getStatusByValue, getStatusColor } from '@/constants/status';
import OrderForm from '@/components/OrderForm';
import Modal from '@/components/Modal';

export default function Orders() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = (await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })) as {
        data: Order[] | null;
        error: unknown;
      };
      console.log('data order', data);

      if (error) throw error;
      setOrders(data ?? []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande?'))
      return;

    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      setOrders(orders.filter((o) => o.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleCreateNew = () => {
    setSelectedOrder(null);
    setShowModal(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    fetchOrders();
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.client_name.toLowerCase().includes(searchText.toLowerCase()) ||
      order.model.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      selectedStatus === null || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const OrderSkeleton = () => (
    <div className="rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-5 shadow-sm animate-pulse">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="h-6 w-48 rounded-full bg-secondary-200"></div>
          <div className="mt-3 h-4 w-32 rounded-full bg-secondary-200"></div>
        </div>
        <div className="h-8 w-24 rounded-full bg-secondary-200"></div>
      </div>
      <div className="mb-5 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-3xl bg-secondary-50 dark:bg-secondary-800 dark:bg-secondary-800 px-4 py-3"
          >
            <div className="h-4 w-20 rounded-full bg-secondary-200 dark:bg-secondary-700"></div>
            <div className="h-4 w-32 rounded-full bg-secondary-200 dark:bg-secondary-700"></div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-10 rounded-3xl bg-secondary-200"></div>
        <div className="h-10 rounded-3xl bg-secondary-200"></div>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold text-primary-700 dark:text-primary-300">
          {isAdmin ? 'Toutes les Commandes' : 'Mes Commandes'}
        </h1>
        {isAdmin && (
          <button
            className="inline-flex items-center gap-2 rounded-3xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            onClick={handleCreateNew}
          >
            <FiPlus size={18} />
            Nouvelle Commande
          </button>
        )}
      </header>

      <Modal
        isOpen={showModal}
        title={selectedOrder ? 'Modifier la Commande' : 'Nouvelle Commande'}
        onClose={handleCloseModal}
      >
        <OrderForm
          orderId={selectedOrder?.id}
          initialData={
            selectedOrder
              ? {
                  client_name: selectedOrder.client_name,
                  model: selectedOrder.model,
                  fabric_color: selectedOrder.fabric_color || '',
                  size: selectedOrder.size || '',
                  fabric_price: selectedOrder.fabric_price?.toString() || '',
                  selling_price: selectedOrder.selling_price?.toString() || '',
                  delivery_date: selectedOrder.delivery_date || '',
                  delivery_location: selectedOrder.delivery_location || '',
                  order_count: selectedOrder.order_count?.toString() || '',
                  model_image: selectedOrder.model_image || '',
                  advance_payment:
                    selectedOrder.advance_payment?.toString() || '',
                  status: (selectedOrder.status ?? 0) as any,
                }
              : undefined
          }
          onSuccess={handleFormSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:gap-4">
        <div className="flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Rechercher une commande..."
            className="w-full rounded-3xl border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 px-4 py-3 text-sm text-secondary-900 dark:text-white shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="sm:w-48">
          <select
            value={selectedStatus ?? ''}
            onChange={(e) =>
              setSelectedStatus(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full rounded-3xl border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 px-4 py-3 text-sm text-secondary-900 dark:text-white shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">Tous les statuts</option>
            <option value={0}>En attente</option>
            <option value={1}>En cours</option>
            <option value={2}>Livré</option>
            <option value={3}>Annulé</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="py-16 text-center text-secondary-500">
          Aucune commande trouvée
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                    {order.client_name}
                  </h3>
                  <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                    {order.model}
                  </p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-[12px] font-semibold text-white"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusByValue(order.status)}
                </span>
              </div>

              <div className="mb-5 space-y-3 text-sm text-secondary-600 dark:text-secondary-400">
                <div className="flex items-center justify-between rounded-3xl bg-secondary-50 dark:bg-secondary-800 px-4 py-3">
                  <span className="font-medium text-secondary-500">
                    Couleur
                  </span>
                  <span className="dark:text-white">
                    {order.fabric_color || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-secondary-50 dark:bg-secondary-800 px-4 py-3">
                  <span className="font-medium text-secondary-500">Taille</span>
                  <span className="dark:text-white">{order.size || '-'}</span>
                </div>
                {isAdmin && (
                  <>
                    <div className="flex items-center justify-between rounded-3xl bg-secondary-50 dark:bg-secondary-800 px-4 py-3">
                      <span className="font-medium text-secondary-500">
                        Prix tissu
                      </span>
                      <span className="dark:text-white">
                        {order.fabric_price?.toFixed(2) ?? '0.00'} Ar
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-3xl bg-secondary-50 dark:bg-secondary-800 px-4 py-3">
                      <span className="font-medium text-secondary-500">
                        Prix vente
                      </span>
                      <span className="dark:text-white">
                        {order.selling_price?.toFixed(2) ?? '0.00'} Ar
                      </span>
                    </div>
                  </>
                )}
                {order.delivery_date && (
                  <div className="flex items-center justify-between rounded-3xl bg-secondary-50 dark:bg-secondary-800 px-4 py-3">
                    <span className="font-medium text-secondary-500">
                      Livraison
                    </span>
                    <span className="dark:text-white">
                      {new Date(order.delivery_date).toLocaleDateString(
                        'fr-FR',
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <FiEye size={18} />
                  Voir
                </button>
                {isAdmin && (
                  <>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-3xl bg-secondary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary-700"
                      onClick={() => handleEdit(order)}
                    >
                      <FiEdit2 size={18} />
                      Modifier
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-3xl bg-tertiary-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-tertiary-600"
                      onClick={() => handleDelete(order.id)}
                    >
                      <FiTrash2 size={18} />
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
