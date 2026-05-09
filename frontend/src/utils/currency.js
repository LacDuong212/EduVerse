import { currency, REGION_FORMAT } from '@/contexts/constants';

export const formatCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return `${new Intl.NumberFormat(REGION_FORMAT, {
    maximumFractionDigits: 0,
  }).format(n)}${currency}`;
};

export const toCurrency = (val) => {
  if (val === null || val === undefined || val === '') return '';

  const num = Number(val);
  if (isNaN(num)) return '';

  return new Intl.NumberFormat(REGION_FORMAT).format(num);
};

export const parseCurrency = (str) => {
  if (str === null || str === undefined || String(str).trim() === '') {
    return null;
  }

  let s = String(str);

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');

  if (lastComma > lastDot) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    s = s.replace(/,/g, '');
  }

  const cleaned = s.replace(/[^0-9.-]/g, '');

  const num = Number(cleaned);
  return isNaN(num) ? null : num;
};

export const parseRawNumber = (str) => {
  return str.replace(/\D/g, "");
};