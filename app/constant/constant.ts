export const DRAFT = {
  label: 'Brouillon',
  value: 0,
  color: '#9CA3AF', // gris
};

export const PENDING = {
  label: 'En attente',
  value: 1,
  color: '#F59E0B', // jaune
};

export const PRODUCTION = {
  label: 'En cours',
  value: 2,
  color: '#3B82F6', // bleu
};

export const PAUSE = {
  label: 'Pause',
  value: 3,
  color: '#6B7280', // gris foncé
};

export const DONE = {
  label: 'Terminé',
  value: 4,
  color: '#10B981', // vert
};

export const DELIVERED = {
  label: 'Livré',
  value: 5,
  color: '#14B8A6', // turquoise
};

export const CANCELED = {
  label: 'Annulée',
  value: 6,
  color: '#EF4444', // rouge
};

export const RETOUCH = {
  label: 'Retouche',
  value: 7,
  color: '#8B5CF6', // violet
};

export const ARCHIVED = {
  label: 'Archivée',
  value: 8,
  color: '#4B5563', // gris foncé
};

export const STATUSES = [
  DRAFT,
  PENDING,
  PRODUCTION,
  PAUSE,
  DONE,
  DELIVERED,
  CANCELED,
  RETOUCH,
  ARCHIVED,
];

export const FORM_STATUSES = [
  DRAFT,
  PENDING,
  PRODUCTION,
  DONE,
  DELIVERED,
  CANCELED,
];

export const SIZES = ['S', 'M', 'L', 'XL'];

export const getStatusByValue = (value: number | null) => {
  return STATUSES.find((s) => s.value === value) || DRAFT;
};
