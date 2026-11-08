export function formatCurrency(value: number, currency = "USD"): string {
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  try {
    return new Intl.NumberFormat("en-US", options).format(value);
  } catch {
    return new Intl.NumberFormat("en-US", {
      ...options,
      currency: "USD",
    }).format(value);
  }
}

import dayjs from "dayjs";

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
