"use client";

import { FREE_CREDITS, CreditState } from "./types";

const CREDITS_KEY = "mnemoai_credits";
const PAID_CREDITS_KEY = "mnemoai_paid_credits";

export function getCredits(): CreditState {
  if (typeof window === "undefined") return { free: FREE_CREDITS, paid: 0, total: FREE_CREDITS };
  const freeRaw = localStorage.getItem(CREDITS_KEY);
  const paidRaw = localStorage.getItem(PAID_CREDITS_KEY);
  const free = freeRaw !== null ? parseInt(freeRaw, 10) : FREE_CREDITS;
  const paid = paidRaw !== null ? parseInt(paidRaw, 10) : 0;
  return { free, paid, total: free + paid };
}

export function useCredit(): boolean {
  const state = getCredits();
  if (state.total <= 0) return false;

  if (state.paid > 0) {
    localStorage.setItem(PAID_CREDITS_KEY, String(state.paid - 1));
  } else {
    localStorage.setItem(CREDITS_KEY, String(state.free - 1));
  }
  return true;
}

export function addPaidCredits(amount: number): void {
  if (typeof window === "undefined") return;
  const current = getCredits().paid;
  localStorage.setItem(PAID_CREDITS_KEY, String(current + amount));
}

export function hasCredits(): boolean {
  return getCredits().total > 0;
}
