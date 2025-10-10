// src/lib/helpers.ts

export function getTimeSinceAdoption(adoptedAt: number): string {
  if (!adoptedAt) return "Just adopted";

  const now = new Date().getTime();
  // adoptedAt sudah dalam milidetik dari Sui
  const diff = now - adoptedAt;

  // Logika perhitungan waktu...
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return "Less than a minute";
}
