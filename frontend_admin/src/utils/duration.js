
/**
 * @param {Number} value
 * @param {String} fromUnit "second" | "minute" | "hour" | "day" 
 * @param {String} toUnit "second" | "minute" | "hour" | "day" 
 * @returns {Object|null} { value, unit }
 */
export const convertDuration = (
  value,
  fromUnit,
  toUnit,
  { precision = 2 } = {}
) => {
  const UNIT_IN_SECONDS = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
  };

  const num = Number(value);

  if (!Number.isFinite(num)) {
    return null;
  }

  if (num <= 0) {
    return 0;
  }

  if (!UNIT_IN_SECONDS[fromUnit]) {
    return null;
  }

  if (!UNIT_IN_SECONDS[toUnit]) {
    return null;
  }

  const seconds = num * UNIT_IN_SECONDS[fromUnit];
  const result = seconds / UNIT_IN_SECONDS[toUnit];

  const factor = 10 ** precision;
  return {
    value: Math.round(result * factor) / factor,
    unit: toUnit,
  };
};

export const secondsToDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0s";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];

  if (h > 0) parts.push(`${h}h`);
  
  if (m > 0) parts.push(`${m}m`);
  
  if (s > 0 || parts.length === 0) {
    parts.push(`${s}s`);
  }

  return parts.join(" ");
};

export const secondsToDurationHM = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0m";
  }

  // round seconds to nearest minute
  const totalMinutes = Math.floor((seconds + 30) / 60);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}m`;
};

export const secondsToHours = (seconds) => {
  const num = Number(seconds);
  if (!Number.isFinite(num) || num <= 0) return 0;

  const hours = num / 3600;
  return Number(hours.toFixed(2));
};