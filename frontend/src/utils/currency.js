import { currency } from '@/contexts/constants';

export const formatCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return `${new Intl.NumberFormat('vi', {
    maximumFractionDigits: 0,
  }).format(n)}${currency}`;
};
