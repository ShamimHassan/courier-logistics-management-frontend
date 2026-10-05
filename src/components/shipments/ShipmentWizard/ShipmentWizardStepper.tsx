"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShipmentWizardStep } from "@/store/useShipmentWizardStore";

export type ShipWizStepKey = "sender" | "recipient" | "parcel" | "confirm";

const STEPS: {
  key: ShipWizStepKey;
  stepNo: ShipmentWizardStep;
  label: string;
  sub: string;
}[] = [
  { key: "sender", stepNo: 1, label: "Sender", sub: "Pickup info" },
  { key: "recipient", stepNo: 2, label: "Recipient", sub: "Delivery info" },
  { key: "parcel", stepNo: 3, label: "Parcel & Service", sub: "Weight + quote" },
  { key: "confirm", stepNo: 4, label: "Confirm", sub: "Review & pay" },
];

export const WIZARD_TOTAL_STEPS = STEPS.length;

export function getStepKey(stepNo: ShipmentWizardStep): ShipWizStepKey {
  return STEPS.find((s) => s.stepNo === stepNo)?.key ?? "sender";
}

export function getStepNo(key: ShipWizStepKey): ShipmentWizardStep {
  return STEPS.find((s) => s.key === key)?.stepNo ?? 1;
}

export interface ShipmentWizardStepperProps {
  current: ShipmentWizardStep;
  onJump?: (stepNo: ShipmentWizardStep) => void;
  allowJumpBackUntil?: ShipmentWizardStep;
  className?: string;
}

export default function ShipmentWizardStepper({
  current,
  onJump,
  allowJumpBackUntil = current,
  className,
}: ShipmentWizardStepperProps) {
  const currentIdx = useMemo(
    () => STEPS.findIndex((s) => s.stepNo === current) ?? 0,
    [current],
  );

  return (
    <nav
      aria-label="Create shipment progress"
      className={cn(
        "w-full rounded-2xl border bg-background/60 backdrop-blur-sm p-4 sm:p-5",
        className,
      )}
    >
      <ol className="relative flex items-center justify-between gap-1 sm:gap-3">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[18px] sm:top-6 mx-10 sm:mx-12 h-0.5 bg-border"
        />
        <div
          aria-hidden
          className="absolute top-[18px] sm:top-6 mx-10 sm:mx-12 h-0.5 bg-primary transition-all duration-300"
          style={{
            width: `calc(${(currentIdx / (STEPS.length - 1)) * 100}% - 0px)`,
          }}
        />
        {STEPS.map((step, i) => {
          const isComplete = i < currentIdx;
          const isActive = i === currentIdx;
          const canJumpBack =
            !!onJump && step.stepNo <= allowJumpBackUntil && !isActive;
          const state = isActive
            ? "active"
            : isComplete
              ? "complete"
              : "upcoming";
          return (
            <li
              key={step.key}
              className="relative z-10 flex flex-col items-center gap-1.5 flex-1 min-w-0"
            >
              <button
                type="button"
                onClick={
                  canJumpBack ? () => onJump(step.stepNo) : undefined
                }
                disabled={!canJumpBack}
                aria-current={isActive ? "step" : undefined}
                aria-label={[
                  `Step ${i + 1} of ${STEPS.length}: ${step.label}`,
                  isComplete ? "— complete" : isActive ? "— current" : "",
                  canJumpBack ? "— click to go back" : "",
                ].join(" ")}
                className={cn(
                  "group relative flex size-9 sm:size-10 items-center justify-center rounded-full border text-xs font-semibold transition-all select-none shrink-0",
                  state === "complete" &&
                    "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30",
                  state === "active" &&
                    "border-primary ring-4 ring-primary/15 bg-background text-primary",
                  state === "upcoming" &&
                    "border-border bg-background text-muted-foreground",
                  canJumpBack && "hover:scale-105 cursor-pointer",
                  !canJumpBack && "cursor-default",
                )}
              >
                {state === "complete" ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  <span className="text-[11px] sm:text-xs tabular-nums">
                    {i + 1}
                  </span>
                )}
              </button>
              <div className="flex flex-col items-center gap-0 text-center">
                <span
                  className={cn(
                    "text-[11px] sm:text-xs font-semibold tracking-tight whitespace-nowrap",
                    state === "active" && "text-foreground",
                    state === "complete" && "text-primary",
                    state === "upcoming" && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] whitespace-nowrap",
                    state === "active" && "text-muted-foreground",
                    state === "complete" && "text-primary/70",
                    state === "upcoming" && "text-muted-foreground/70",
                  )}
                >
                  {step.sub}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { STEPS };
