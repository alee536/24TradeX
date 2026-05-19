import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  const numericAmount = typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(numericAmount) ? numericAmount : 0)
}

export function formatCrypto(amount: number, symbol: string = '24X') {
  const numericAmount = typeof amount === "number" ? amount : Number(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
  return `${safeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${symbol}`
}

export function generateTxId() {
  return `TX24X${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy!', err);
    return false;
  }
}
