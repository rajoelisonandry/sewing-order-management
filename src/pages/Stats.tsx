import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function Stats() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    averageOrderValue: 0,
    deliveredOrders: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [selectedYear, selectedMonth]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*');

      if (error) throw error;

      let ordersList = data || [];

      // Filter by year and month
      ordersList = ordersList.filter((order) => {
        const orderDate = new Date(order.created_at);
        const orderYear = orderDate.getFullYear();
        const orderMonth = orderDate.getMonth() + 1;

        const yearMatch = orderYear === selectedYear;
        const monthMatch =
          selectedMonth === null || orderMonth === selectedMonth;

        return yearMatch && monthMatch;
      });

      if (ordersList.length > 0) {
        const totalRevenue = ordersList.reduce(
          (sum, o) => sum + (o.selling_price || 0),
          0,
        );
        const totalProfit = ordersList.reduce(
          (sum, o) => sum + (o.profit || 0),
          0,
        );
        const deliveredCount = ordersList.filter((o) => o.status === 2).length;

        setStats({
          totalOrders: ordersList.length,
          totalRevenue,
          totalProfit,
          averageOrderValue: totalRevenue / ordersList.length,
          deliveredOrders: deliveredCount,
        });
      } else {
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          totalProfit: 0,
          averageOrderValue: 0,
          deliveredOrders: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );
  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  if (loading)
    return (
      <div className="px-4 py-16 text-center text-secondary-500">
        <p>Chargement...</p>
      </div>
    );

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <h1 className="mb-6 text-3xl font-semibold text-primary-700 dark:text-primary-300">
        Statistiques
      </h1>

      {/* Filtres */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Année
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-3 py-2 text-sm text-secondary-900 dark:text-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Mois
          </label>
          <select
            value={selectedMonth ?? ''}
            onChange={(e) =>
              setSelectedMonth(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-3 py-2 text-sm text-secondary-900 dark:text-white"
          >
            <option value="">Tous les mois</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={`grid gap-5 ${isAdmin ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2'}`}
      >
        {/* Toujours affichés */}
        <div className="rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-400">
            Commandes
          </h3>
          <p className="mt-4 text-3xl font-bold text-primary-700 dark:text-primary-400">
            {stats.totalOrders}
          </p>
          <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
            Nombre total
          </p>
        </div>

        <div className="rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-400">
            Commandes Livrées
          </h3>
          <p className="mt-4 text-3xl font-bold text-primary-700 dark:text-primary-400">
            {stats.deliveredOrders}
          </p>
          <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
            Taux:{' '}
            {stats.totalOrders > 0
              ? ((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(1)
              : 0}
            %
          </p>
        </div>

        {/* Affichés seulement pour les admins */}
        {isAdmin && (
          <>
            <div className="rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-400">
                Chiffre d&apos;affaires
              </h3>
              <p className="mt-4 text-3xl font-bold text-primary-700 dark:text-primary-400">
                {stats.totalRevenue.toFixed(2)} Ar
              </p>
              <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                Ventes totales
              </p>
            </div>

            <div className="rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-400">
                Bénéfice
              </h3>
              <p className="mt-4 text-3xl font-bold text-primary-700 dark:text-primary-400">
                {stats.totalProfit.toFixed(2)} Ar
              </p>
              <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                Gain total
              </p>
            </div>

            <div className="rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-400">
                Moyenne par Commande
              </h3>
              <p className="mt-4 text-3xl font-bold text-primary-700 dark:text-primary-400">
                {stats.averageOrderValue.toFixed(2)} Ar
              </p>
              <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                Panier moyen
              </p>
            </div>

            <div className="rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-400">
                Marge Moyenne
              </h3>
              <p className="mt-4 text-3xl font-bold text-primary-700 dark:text-primary-400">
                {stats.totalOrders > 0
                  ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)
                  : 0}
                %
              </p>
              <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                Sur le chiffre d&apos;affaires
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
