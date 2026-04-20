import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiMaximize } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '@/types/order';
import { getStatusByValue, getStatusColor } from '@/constants/status';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) return;
        const { data, error } = (await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single()) as {
          data: Order | null;
          error: unknown;
        };

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: number) => {
    if (!id || !order) return;

    setStatusUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setOrder({ ...order, status: newStatus as any });
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande?'))
      return;

    if (!id) return;

    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);

      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  if (loading)
    return (
      <div className="px-4 py-16 text-center text-secondary-500">
        <p>Chargement...</p>
      </div>
    );
  if (!order)
    return (
      <div className="px-4 py-16 text-center text-secondary-500">
        <p>Commande non trouvée</p>
      </div>
    );

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <button
            className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 transition hover:bg-secondary-100 dark:hover:bg-secondary-700"
            onClick={() => navigate('/')}
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-primary-700  dark:text-primary-400 dark:text-primary-300">
            Détail de la Commande
          </h1>
          {isAdmin && (
            <div className="flex gap-3">
              <button
                className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-tertiary-500 text-white transition hover:bg-tertiary-600"
                onClick={handleDelete}
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-start gap-4 rounded-3xl bg-secondary-50 dark:bg-secondary-800 p-5 text-center sm:text-left sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full">
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary-500 dark:text-secondary-400">
                Statut
              </h2>
              <div className="mt-3 flex justify-between items-center gap-3">
                <span
                  className="inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusByValue(order.status)}
                </span>
                <select
                  value={order.status || 0}
                  onChange={(e) => handleStatusChange(parseInt(e.target.value))}
                  disabled={statusUpdating}
                  className="rounded-3xl border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-4 py-2 text-sm font-medium text-secondary-900 dark:text-white shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={0}>En attente</option>
                  <option value={1}>En cours</option>
                  <option value={2}>Livré</option>
                  <option value={3}>Annulé</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-700  dark:text-primary-400">
                Informations Client
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-secondary-50 p-4 dark:bg-secondary-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                    Nom
                  </p>
                  <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                    {order.client_name}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-700  dark:text-primary-400">
                Détails de la Commande
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-secondary-50 p-4 dark:bg-secondary-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                    Modèle
                  </p>
                  <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                    {order.model}
                  </p>
                </div>
                <div className="rounded-3xl bg-secondary-50 p-4 dark:bg-secondary-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                    Couleur du Tissu
                  </p>
                  <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                    {order.fabric_color || '-'}
                  </p>
                </div>
                <div className="rounded-3xl bg-secondary-50 p-4 dark:bg-secondary-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                    Taille
                  </p>
                  <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                    {order.size || '-'}
                  </p>
                </div>
                {order.order_count != null && (
                  <div className="rounded-3xl bg-secondary-50 p-4 dark:bg-secondary-800">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                      Nombre de Commandes
                    </p>
                    <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                      {order.order_count}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {isAdmin && (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-700  dark:text-primary-400">
                  Tarification
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl bg-secondary-50 p-4 dark:bg-secondary-800">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                      Prix du Tissu
                    </p>
                    <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                      {(order.fabric_price || 0).toFixed(2)} Ar
                    </p>
                  </div>
                  <div className="rounded-3xl bg-secondary-50 p-4 dark:bg-secondary-800">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                      Prix de Vente
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary-700  dark:text-primary-400">
                      {(order.selling_price || 0).toFixed(2)} Ar
                    </p>
                  </div>
                  <div className="rounded-3xl bg-secondary-50 p-4 dark:bg-secondary-800">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                      Bénéfice
                    </p>
                    <p className="mt-2 text-sm font-semibold text-emerald-600">
                      {(order.profit || 0).toFixed(2)} Ar
                    </p>
                  </div>
                  {order.advance_payment != null && (
                    <div className="rounded-3xl bg-secondary-50 p-4 dark:bg-secondary-800">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                        Acompte
                      </p>
                      <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                        {order.advance_payment.toFixed(2)} Ar
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-700  dark:text-primary-400">
                Livraison
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {order.delivery_date && (
                  <div className="rounded-3xl bg-secondary-50 p-4 dark:bg-secondary-800">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                      Date Prévue
                    </p>
                    <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                      {new Date(order.delivery_date).toLocaleDateString(
                        'fr-FR',
                      )}
                    </p>
                  </div>
                )}
                {order.delivery_location && (
                  <div className="rounded-3xl bg-secondary-50 p-4 dark:bg-secondary-800">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                      Lieu
                    </p>
                    <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                      {order.delivery_location}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {order.model_image && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary-700  dark:text-primary-400 dark:text-primary-400">
                    Image du Modèle
                  </h3>
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all"
                    title="Voir en plein écran"
                  >
                    <FiMaximize size={16} />
                    Plein écran
                  </button>
                </div>
                <div className="overflow-hidden rounded-3xl bg-secondary-100 dark:bg-secondary-800 p-4">
                  <img
                    src={order.model_image}
                    alt={order.model}
                    className="w-full rounded-2xl object-cover max-h-96 cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                </div>
              </section>
            )}

            <section className="space-y-3 rounded-3xl bg-secondary-50 dark:bg-secondary-800 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                  Créée le
                </p>
                <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">
                  Modifiée le
                </p>
                <p className="mt-2 text-sm text-secondary-900 dark:text-white">
                  {new Date(order.updated_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Image Fullscreen Modal */}
      {showImageModal && order?.model_image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-5xl max-h-screen p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={order.model_image}
              alt={order.model}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
