import { currency } from '@/context/constants';

export const formatCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(n)}${currency}`;
};
