"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Info,
  PackagePlus,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import ShipmentWizardStepper, {
  getStepNo,
  type ShipWizStepKey,
} from "@/components/shipments/ShipmentWizard/ShipmentWizardStepper";
import Step1Sender from "@/components/shipments/ShipmentWizard/Step1Sender";
import Step2Recipient from "@/components/shipments/ShipmentWizard/Step2Recipient";
import Step3ParcelService from "@/components/shipments/ShipmentWizard/Step3ParcelService";
import Step4Confirm from "@/components/shipments/ShipmentWizard/Step4Confirm";

import {
  wizard4Schema,
  type Wizard4StepInput,
  type Wizard4Address,
} from "@/components/shipments/ShipmentWizard/schema";
import useShipmentWizardStore, {
  type ShipmentWizardStep,
} from "@/store/useShipmentWizardStore";
import type { Shipment, ShipmentQuote } from "@/lib/api/types";
import { formatBDT } from "@/lib/utils";

const STEP_ORDER: ShipWizStepKey[] = [
  "sender",
  "recipient",
  "parcel",
  "confirm",
];

const STEP_META: Record<
  ShipWizStepKey,
  { title: string; subtitle: string; tip: string }
> = {
  sender: {
    title: "1. Sender / Pickup address",
    subtitle: "Who is sending the parcel and where should we pick it up?",
    tip: "Courier calls this phone 30 min before arriving for pickup.",
  },
  recipient: {
    title: "2. Recipient / Delivery address",
    subtitle: "Where should the parcel go, and who receives it?",
    tip: "Wrong phone number = #1 missed-delivery cause. Please double-check!",
  },
  parcel: {
    title: "3. Parcel details + Service",
    subtitle: "Describe your parcel and pick a delivery speed.",
    tip: "Live price updates every ~350 ms — adjust speed and see total instantly.",
  },
  confirm: {
    title: "4. Review & Checkout",
    subtitle: "One final look — then pay securely via SSLCommerz.",
    tip: "After payment you'll receive the tracking link by SMS + email.",
  },
};

function buildDefaultValues(
  storeDefaults: Partial<Wizard4StepInput> | null,
): Wizard4StepInput {
  const baseSender: Wizard4Address = {
    fullName: "",
    phone: "",
    street: "",
    city: "",
    region: "",
    zoneId: "",
    zip: "",
    label: "",
  };
  const base: Wizard4StepInput = {
    sender: storeDefaults?.sender
      ? { ...baseSender, ...storeDefaults.sender }
      : baseSender,
    recipient: storeDefaults?.recipient
      ? { ...baseSender, ...storeDefaults.recipient }
      : baseSender,
    parcel: {
      weightKg: 1,
      lengthCm: undefined,
      widthCm: undefined,
      heightCm: undefined,
      category: "",
      description: "",
      isFragile: false,
      insuranceEnabled: false,
      declaredValue: 0,
      ...(storeDefaults?.parcel ?? {}),
    },
    serviceType: storeDefaults?.serviceType ?? "STANDARD",
    codEnabled: storeDefaults?.codEnabled ?? false,
    codAmount: storeDefaults?.codAmount ?? 0,
    deliveryInstructions: "",
    specialNotes: "",
  };
  return base;
}

/* ======================================================
 * Route component
 * ====================================================== */

export default function CreateShipmentPage() {
  const router = useRouter();
  const resolver = useMemo(
    () => zodResolver(wizard4Schema) as unknown as never,
    [],
  );

  /* --- Hydrate store on mount (Step 14 → Step 15 prefill) --- */
  const hasHydratedRef = useRef(false);
  const storeStep = useShipmentWizardStore((s) => s.step);
  const setStoreStep = useShipmentWizardStore((s) => s.setStep);
  const setSender = useShipmentWizardStore((s) => s.setSender);
  const setRecipient = useShipmentWizardStore((s) => s.setRecipient);
  const setParcel = useShipmentWizardStore((s) => s.setParcel);
  const setServiceType = useShipmentWizardStore((s) => s.setServiceType);
  const setCodEnabled = useShipmentWizardStore((s) => s.setCodEnabled);
  const setCodAmount = useShipmentWizardStore((s) => s.setCodAmount);
  const hydrateFromPrefill = useShipmentWizardStore(
    (s) => s.hydrateFromPrefill,
  );
  const resetWizard = useShipmentWizardStore((s) => s.resetWizard);

  /* Pull store defaults for initial form values */
  const initialDefaultsFromStore: Wizard4StepInput = useMemo(() => {
    const raw = useShipmentWizardStore.getState();
    return buildDefaultValues({
      sender: raw.sender as Wizard4Address,
      recipient: raw.recipient as Wizard4Address,
      parcel: { ...raw.parcel } as Wizard4StepInput["parcel"],
      serviceType: raw.serviceType,
      codEnabled: raw.codEnabled,
      codAmount: raw.codAmount,
    });
  }, []);

  const form = useForm<Wizard4StepInput>({
    resolver,
    defaultValues: initialDefaultsFromStore,
    mode: "onTouched",
    delayError: 200,
  });

  const stepKey: ShipWizStepKey = useMemo(() => {
    return STEP_ORDER[(storeStep ?? 1) - 1] ?? "sender";
  }, [storeStep]);
  const stepIndex = STEP_ORDER.indexOf(stepKey);

  /* First mount: run prefill hydrate, then reset form if anything was applied */
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    const result = hydrateFromPrefill();
    if (result.applied) {
      const raw = useShipmentWizardStore.getState();
      const next = buildDefaultValues({
        sender: raw.sender as Wizard4Address,
        recipient: raw.recipient as Wizard4Address,
        parcel: { ...raw.parcel } as Wizard4StepInput["parcel"],
        serviceType: raw.serviceType,
        codEnabled: raw.codEnabled,
        codAmount: raw.codAmount,
      });
      form.reset(next, { keepDefaultValues: false });
      toast.success("Quote details prefilled", {
        description:
          result.source === "sessionStorage"
            ? "Applied values from pricing page. You can edit anything before checkout."
            : "Applied values from URL parameters.",
      });
    }
  }, [form, hydrateFromPrefill]);

  /* Keep zustand sender/recipient synced from form (one-way sync: form → store) */
  const watchedSender = form.watch("sender");
  const watchedRecipient = form.watch("recipient");
  useEffect(() => {
    if (watchedSender) setSender(watchedSender as Partial<Wizard4Address>);
  }, [watchedSender, setSender]);
  useEffect(() => {
    if (watchedRecipient)
      setRecipient(watchedRecipient as Partial<Wizard4Address>);
  }, [watchedRecipient, setRecipient]);

  /* --- Step navigation --- */

  function fieldsFor(
    step: ShipWizStepKey,
  ): readonly (keyof Wizard4StepInput)[] {
    switch (step) {
      case "sender":
        return ["sender"];
      case "recipient":
        return ["recipient"];
      case "parcel":
        return [
          "parcel",
          "serviceType",
          "codEnabled",
          "codAmount",
        ] as unknown as readonly (keyof Wizard4StepInput)[];
      case "confirm":
        return ["deliveryInstructions", "specialNotes"];
    }
  }

  async function validateAndGoNext(nextKey: ShipWizStepKey) {
    const nextIdx = STEP_ORDER.indexOf(nextKey);
    if (nextIdx < 0) return;
    /* Backwards: go without validation */
    if (nextIdx < stepIndex) {
      setStoreStep(getStepNo(nextKey) as ShipmentWizardStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const fields = fieldsFor(stepKey);
    const ok = await form.trigger(
      fields as unknown as Parameters<typeof form.trigger>[0],
    );
    if (!ok) {
      toast.error("Please fix the highlighted fields", {
        description: `Complete ${STEP_META[stepKey].title.split(".")[0]?.trim()} first.`,
      });
      /* Focus first error */
      const firstErrorField = Object.keys(form.formState.errors ?? {})[0];
      if (firstErrorField) {
        try {
          const el = document.querySelector(
            `[name^="${firstErrorField}"]`,
          ) as HTMLElement | null;
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          el?.focus?.();
        } catch {
          /* ignore */
        }
      }
      return;
    }
    setStoreStep(getStepNo(nextKey) as ShipmentWizardStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function jumpToStep(stepNo: ShipmentWizardStep) {
    const key: ShipWizStepKey =
      STEP_ORDER[(stepNo ?? 1) - 1] ?? "sender";
    const targetIdx = STEP_ORDER.indexOf(key);
    if (targetIdx === stepIndex) return;
    if (targetIdx < stepIndex) {
      setStoreStep(stepNo);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    /* Validate forward sequentially */
    let currentIdx = stepIndex;
    const run = async () => {
      while (currentIdx < targetIdx) {
        const cur = STEP_ORDER[currentIdx]!;
        const fields = fieldsFor(cur);
        const ok = await form.trigger(
          fields as unknown as Parameters<typeof form.trigger>[0],
        );
        if (!ok) {
          toast.error("Please fix highlighted fields", {
            description: `Blocked at ${STEP_META[cur].title.split(".")[0]?.trim()}.`,
          });
          return;
        }
        currentIdx += 1;
      }
      setStoreStep(stepNo);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    void run();
  }

  function handleCopySenderToRecipient() {
    const s = form.getValues().sender;
    form.setValue("recipient", { ...(s as Wizard4Address) }, { shouldDirty: true, shouldTouch: true });
    form.clearErrors("recipient");
  }

  function handleFinalSuccess(created: Shipment & { quote?: ShipmentQuote }) {
    /* On final submit success, Step 4 handles navigation */
    void created;
  }

  const meta = STEP_META[stepKey];
  const isOnConfirm = stepKey === "confirm";
  const isOnFirst = stepIndex === 0;

  const step = stepIndex + 1;

  const total = useShipmentWizardStore.getState().quoteResult?.totalAmount;

  return (
    <div className="space-y-5 pb-10">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-primary/30">
              <PackagePlus className="h-3 w-3 text-primary" />
              New shipment
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Sparkles className="h-3 w-3 text-primary" />
              Step {step} of 4
            </Badge>
            {typeof total === "number" ? (
              <Badge variant="outline" className="gap-1 tabular-nums text-[11px]">
                Total · {formatBDT(total)}
              </Badge>
            ) : null}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Create a shipment
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Four steps to book delivery. Fill the form — price updates live on
            step 3, then pay securely via SSLCommerz (bKash, Nagad, Rocket,
            VISA, Mastercard).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <button
              type="button"
              onClick={() => router.push("/dashboard/shipments")}
            >
              <ArrowLeft className="h-4 w-4" />
              All shipments
            </button>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              if (
                window.confirm(
                  "Start over? This will clear the current wizard.",
                )
              ) {
                resetWizard();
                const fresh = buildDefaultValues(null);
                form.reset(fresh, { keepDefaultValues: false });
                setStoreStep(1);
                toast.success("Wizard reset", {
                  description: "All fields cleared.",
                });
              }
            }}
            className="gap-2"
          >
            Start over
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <ShipmentWizardStepper
        current={storeStep as ShipmentWizardStep}
        onJump={jumpToStep}
        allowJumpBackUntil={(Math.min(
          storeStep,
          4,
        ) as ShipmentWizardStep)}
      />

      {/* Step info banner */}
      <Alert variant="default" className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-xs md:text-sm font-semibold text-foreground">
          {meta.title}
        </AlertTitle>
        <AlertDescription className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">
          {meta.subtitle}{" "}
          <span className="text-foreground/70 font-medium">
            💡 Tip: {meta.tip}
          </span>
        </AlertDescription>
      </Alert>

      {/* Card: step content */}
      <Card className="border-border/80 bg-card shadow-sm">
        <CardHeader className="pb-3 flex-row items-center justify-between gap-3 flex-wrap">
          <div className="space-y-0.5">
            <CardTitle className="text-base sm:text-lg font-bold tracking-tight">
              {meta.title}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Step {step} of 4
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px]">
            SSLCommerz · bKash · Nagad · Rocket
          </Badge>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-0">
              {stepKey === "sender" && <Step1Sender form={form} />}
              {stepKey === "recipient" && (
                <Step2Recipient
                  form={form}
                  onCopySenderToRecipient={handleCopySenderToRecipient}
                />
              )}
              {stepKey === "parcel" && <Step3ParcelService form={form} />}
              {stepKey === "confirm" && (
                <Step4Confirm
                  form={form}
                  onFinalSubmitSuccess={handleFinalSuccess}
                />
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-4">
          <div className="flex-1 text-xs text-muted-foreground max-w-md">
            {meta.tip}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                isOnFirst
                  ? router.push("/dashboard/shipments")
                  : void validateAndGoNext(STEP_ORDER[stepIndex - 1]!)
              }
              className="gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              {isOnFirst ? "Cancel" : "Back"}
            </Button>
            {stepIndex < STEP_ORDER.length - 1 ? (
              <Button
                type="button"
                onClick={() =>
                  void validateAndGoNext(STEP_ORDER[stepIndex + 1]!)
                }
                className="gap-2 w-full sm:w-auto"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              /* Step-4 final button is rendered inside Step4Confirm's sidebar card so the user sees "Pay BDT X". Show an extra continue for accessibility here */
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  /* Scroll to the sidebar Pay button — it handles the mutation */
                  const el = document.querySelector(
                    "[data-wizard-pay]",
                  ) as HTMLElement | null;
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  else
                    toast.info("Review the checkout card on the right → Pay");
                }}
                className="gap-2 w-full sm:w-auto"
                data-wizard-scrolltopay
              >
                <CreditCard className="h-4 w-4" />
                Go to payment
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
