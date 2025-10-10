// src/lib/sui.ts

import { SuiObjectResponse } from "@mysten/sui/client";

/**
 * Helper untuk mengekstrak 'fields' dari SuiObjectResponse.
 * Didesain untuk menangani objek biasa dan objek yang dibungkus dalam Dynamic Field.
 */
export function getSuiObjectFields<T>(response: SuiObjectResponse): T | null {
  const content = response.data?.content;

  if (content?.dataType !== "moveObject") {
    return null;
  }

  // Jika tipe objek adalah wrapper Dynamic Field, kita ambil data dari dalam properti 'value'.
  if (content.type.startsWith("0x2::dynamic_field::Field<")) {
    // PERBAIKAN DI SINI: tambahkan '(as any)' untuk mengatasi error TypeScript.
    return (content.fields as any).value as T;
  }

  // Jika tidak, ini adalah objek biasa, kita ambil 'fields' secara langsung.
  return content.fields as T;
}

// Helper untuk membuat URL explorer
export function getSuiExplorerUrl(type: "tx" | "object", id: string): string {
  // Ganti dengan mainnet/testnet/devnet sesuai kebutuhan
  return `https://suiscan.xyz/testnet/${type}/${id}`;
}
