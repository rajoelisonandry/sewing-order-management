export type OrderStatus = 0 | 1 | 2 | 3;

export const STATUS_OPTIONS: Record<OrderStatus, string> = {
  0: 'En attente',
  1: 'En cours',
  2: 'Livré',
  3: 'Annulé',
} as const;

export const getStatusByValue = (value: OrderStatus | null): string => {
  return STATUS_OPTIONS[value as OrderStatus] || 'Inconnu';
};

export const getStatusColor = (value: OrderStatus | null): string => {
  const colors: Record<OrderStatus, string> = {
    0: '#f59e0b', // orange - En attente
    1: '#3b82f6', // blue - En cours
    2: '#10b981', // green - Livré
    3: '#ef4444', // red - Annulé
  };
  return colors[value as OrderStatus] || '#6b7280';
};
