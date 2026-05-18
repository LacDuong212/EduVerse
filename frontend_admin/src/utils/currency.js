export const currency = import.meta.env?.VITE_CURRENCY || '₫';
export const REGION_FORMAT = 'vi';

export const formatCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return `${new Intl.NumberFormat(REGION_FORMAT, {
    maximumFractionDigits: 0,
  }).format(n)}${currency}`;
};

export const formatCurrencyNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return `${new Intl.NumberFormat(REGION_FORMAT, {
    maximumFractionDigits: 0,
  }).format(n)}`;
};