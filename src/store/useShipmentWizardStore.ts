"use client";

import { create } from "zustand";
import type { QuoteInput } from "@/lib/validations/shipment";
import type { ServiceType, ShipmentQuote } from "@/lib/api/types";

/* =====================================================
 * Domain types matching Step-15 spec state fields
 * ===================================================== */

export interface ShipmentWizardAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  zip: string;
  zoneId: string;
  label?: "home" | "office" | "other" | "";
}

export interface ShipmentWizardParcel {
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  category?: string;
  description?: string;
  isFragile: boolean;
  insuranceEnabled: boolean;
  declaredValue: number;
}

export type ShipmentWizardStep = 1 | 2 | 3 | 4;

export interface ShipmentWizardState {
  /* Spec: 8 explicit state fields */
  step: ShipmentWizardStep;
  sender: ShipmentWizardAddress;
  recipient: ShipmentWizardAddress;
  parcel: ShipmentWizardParcel;
  serviceType: ServiceType;
  codAmount: number;
  codEnabled: boolean;
  deliveryInstructions: string;
  specialNotes?: string;
  quoteResult: ShipmentQuote | null;

  /* Internal plumbing */
  _prefillHydrated: boolean;
  _quoteInputSnapshot: QuoteInput | null;

  /* Spec: Actions — setters */
  setStep: (step: ShipmentWizardStep) => void;
  setSender: (data: Partial<ShipmentWizardAddress>) => void;
  setRecipient: (data: Partial<ShipmentWizardAddress>) => void;
  setParcel: (data: Partial<ShipmentWizardParcel>) => void;
  setServiceType: (serviceType: ServiceType) => void;
  setCodAmount: (amount: number) => void;
  setCodEnabled: (enabled: boolean) => void;
  setDeliveryInstructions: (instructions: string) => void;
  setSpecialNotes: (notes: string) => void;
  setQuoteResult: (quote: ShipmentQuote | null, input?: QuoteInput) => void;

  /* Copy helpers */
  copySenderToRecipient: () => void;

  /* Prefill hydration */
  hydrateFromPrefill: () => {
    applied: boolean;
    source: "sessionStorage" | "searchParams" | "none";
  };

  /* Reset */
  resetWizard: () => void;
}

/* =====================================================
 * Defaults — must match page form defaults 1:1
 * ===================================================== */

const DEFAULT_ADDRESS: ShipmentWizardAddress = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  region: "",
  zip: "",
  zoneId: "",
  label: "",
};

const DEFAULT_PARCEL: ShipmentWizardParcel = {
  weightKg: 1,
  lengthCm: undefined,
  widthCm: undefined,
  heightCm: undefined,
  category: "",
  description: "",
  isFragile: false,
  insuranceEnabled: false,
  declaredValue: 0,
};

/* =====================================================
 * Helpers
 * ===================================================== */

function toNumberOrUndefined(
  raw: string | null | undefined,
): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function toNumberOrDefault(
  raw: string | null | undefined,
  fallback: number,
): number {
  const n = toNumberOrUndefined(raw);
  return n === undefined ? fallback : n;
}

type ParsedPrefill = {
  sender?: Partial<ShipmentWizardAddress>;
  recipient?: Partial<ShipmentWizardAddress>;
  parcel?: Partial<ShipmentWizardParcel>;
  serviceType?: ServiceType;
  codAmount?: number;
  codEnabled?: boolean;
  quoteResult?: ShipmentQuote | null;
};

function readSessionPrefill(): ParsedPrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("cf_prefilled_quote");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      input?: QuoteInput;
      result?: ShipmentQuote;
    };
    const out: ParsedPrefill = {};
    if (parsed.input) {
      const q = parsed.input;
      out.sender = q.originZoneId ? { zoneId: q.originZoneId } : undefined;
      out.recipient = q.destinationZoneId
        ? { zoneId: q.destinationZoneId }
        : undefined;
      out.parcel = {
        weightKg: q.weightKg ?? DEFAULT_PARCEL.weightKg,
        lengthCm: q.lengthCm,
        widthCm: q.widthCm,
        heightCm: q.heightCm,
        insuranceEnabled: !!q.insuranceEnabled,
        declaredValue: q.declaredValue ?? 0,
      };
      out.serviceType = q.serviceType;
      if (q.codEnabled) {
        out.codEnabled = true;
        out.codAmount = q.codAmount ?? 0;
      }
    }
    if (parsed.result) out.quoteResult = parsed.result;
    return out;
  } catch {
    return null;
  }
}

function readUrlPrefill(): ParsedPrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const sp = new URL(window.location.href).searchParams;
    const originZoneId = sp.get("originZoneId");
    const destZoneId = sp.get("destinationZoneId");
    const serviceRaw = sp.get("serviceType") as ServiceType | null;
    const weight = sp.get("weightKg");
    const codAmt = sp.get("codAmount");
    const declared = sp.get("declaredValue");
    const hasAny = [originZoneId, destZoneId, serviceRaw, weight, codAmt].some(
      Boolean,
    );
    if (!hasAny) return null;
    const out: ParsedPrefill = {};
    if (originZoneId) out.sender = { zoneId: originZoneId };
    if (destZoneId) out.recipient = { zoneId: destZoneId };
    if (serviceRaw) out.serviceType = serviceRaw;
    out.parcel = {
      weightKg: toNumberOrDefault(weight, DEFAULT_PARCEL.weightKg),
      insuranceEnabled: !!declared,
      declaredValue: toNumberOrDefault(declared, 0),
    };
    if (codAmt) {
      out.codEnabled = true;
      out.codAmount = toNumberOrDefault(codAmt, 0);
    }
    return out;
  } catch {
    return null;
  }
}

/* =====================================================
 * Store
 * ===================================================== */

export const useShipmentWizardStore = create<ShipmentWizardState>()(
  (set, get) => ({
    step: 1,
    sender: { ...DEFAULT_ADDRESS },
    recipient: { ...DEFAULT_ADDRESS },
    parcel: { ...DEFAULT_PARCEL },
    serviceType: "STANDARD",
    codAmount: 0,
    codEnabled: false,
    deliveryInstructions: "",
    specialNotes: "",
    quoteResult: null,
    _prefillHydrated: false,
    _quoteInputSnapshot: null,

    setStep: (step) => set({ step }),
    setSender: (data) =>
      set((s) => ({ sender: { ...s.sender, ...data } as ShipmentWizardAddress })),
    setRecipient: (data) =>
      set((s) => ({
        recipient: { ...s.recipient, ...data } as ShipmentWizardAddress,
      })),
    setParcel: (data) =>
      set((s) => ({ parcel: { ...s.parcel, ...data } as ShipmentWizardParcel })),
    setServiceType: (serviceType) => set({ serviceType }),
    setCodAmount: (codAmount) => set({ codAmount }),
    setCodEnabled: (codEnabled) =>
      set({ codEnabled, codAmount: codEnabled ? get().codAmount : 0 }),
    setDeliveryInstructions: (deliveryInstructions) =>
      set({ deliveryInstructions }),
    setSpecialNotes: (specialNotes) => set({ specialNotes }),
    setQuoteResult: (quoteResult, input) =>
      set({
        quoteResult,
        _quoteInputSnapshot: input ?? get()._quoteInputSnapshot,
      }),

    copySenderToRecipient: () =>
      set((s) => ({
        recipient: {
          ...s.sender,
          label: s.recipient.label ?? s.sender.label,
        },
      })),

    hydrateFromPrefill: () => {
      if (get()._prefillHydrated) {
        return { applied: false, source: "none" as const };
      }
      const sessionPrefill = readSessionPrefill();
      if (sessionPrefill) {
        const cur = get();
        set({
          sender: { ...cur.sender, ...(sessionPrefill.sender ?? {}) },
          recipient: {
            ...cur.recipient,
            ...(sessionPrefill.recipient ?? {}),
          },
          parcel: { ...cur.parcel, ...(sessionPrefill.parcel ?? {}) },
          serviceType: sessionPrefill.serviceType ?? cur.serviceType,
          codEnabled: sessionPrefill.codEnabled ?? cur.codEnabled,
          codAmount: sessionPrefill.codAmount ?? cur.codAmount,
          quoteResult: sessionPrefill.quoteResult ?? cur.quoteResult,
          _prefillHydrated: true,
        });
        return { applied: true, source: "sessionStorage" };
      }
      const urlPrefill = readUrlPrefill();
      if (urlPrefill) {
        const cur = get();
        set({
          sender: { ...cur.sender, ...(urlPrefill.sender ?? {}) },
          recipient: {
            ...cur.recipient,
            ...(urlPrefill.recipient ?? {}),
          },
          parcel: { ...cur.parcel, ...(urlPrefill.parcel ?? {}) },
          serviceType: urlPrefill.serviceType ?? cur.serviceType,
          codEnabled: urlPrefill.codEnabled ?? cur.codEnabled,
          codAmount: urlPrefill.codAmount ?? cur.codAmount,
          _prefillHydrated: true,
        });
        return { applied: true, source: "searchParams" };
      }
      set({ _prefillHydrated: true });
      return { applied: false, source: "none" };
    },

    resetWizard: () =>
      set({
        step: 1,
        sender: { ...DEFAULT_ADDRESS },
        recipient: { ...DEFAULT_ADDRESS },
        parcel: { ...DEFAULT_PARCEL },
        serviceType: "STANDARD",
        codAmount: 0,
        codEnabled: false,
        deliveryInstructions: "",
        specialNotes: "",
        quoteResult: null,
        _prefillHydrated: false,
        _quoteInputSnapshot: null,
      }),
  }),
);

export type { ShipmentQuote as ShipmentWizardQuoteResult };
export default useShipmentWizardStore;
