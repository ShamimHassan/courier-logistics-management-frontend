"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type QuickShipStep =
  | "parcel"
  | "pickup"
  | "delivery"
  | "service"
  | "review";

const STEP_ORDER: { key: QuickShipStep; label: string; index: number }[] = [
  { key: "parcel", label: "Parcel", index: 0 },
  { key: "pickup", label: "Pickup", index: 1 },
  { key: "delivery", label: "Delivery", index: 2 },
  { key: "service", label: "Service", index: 3 },
  { key: "review", label: "Review & Pay", index: 4 },
];

const TOTAL_STEPS = STEP_ORDER.length;

export interface QuickShipStepperProps {
  current: QuickShipStep;
  onJump?: (step: QuickShipStep) => void;
  allowJumpBefore?: number;
  className?: string;
}

export function QuickShipStepper({
  current,
  onJump,
  allowJumpBefore = 0,
  className,
}: QuickShipStepperProps) {
  const currentIndex = useMemo(
    () => STEP_ORDER.findIndex((s) => s.key === current) ?? 0,
    [current],
  );

  return (
    <nav
      aria-label="Shipment creation progress"
      className={cn(
        "w-full rounded-2xl border bg-background/60 backdrop-blur-sm p-4 sm:p-5",
        className,
      )}
    >
      <ol className="relative flex items-center justify-between gap-1 sm:gap-3">
        <div className="absolute left-0 right-0 top-[18px] sm:top-6 mx-10 sm:mx-12 h-0.5 bg-border" />
        <div
          className="absolute top-[18px] sm:top-6 mx-10 sm:mx-12 h-0.5 bg-primary transition-all duration-300"
          style={{
            width: `calc(${(currentIndex / (TOTAL_STEPS - 1)) * 100}% - 0px)`,
          }}
        />
        {STEP_ORDER.map((step, i) => {
          const isComplete = i < currentIndex;
          const isActive = i === currentIndex;
          const isVisited = i <= currentIndex;
          const canJump = onJump && (isVisited || i < allowJumpBefore);
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
                onClick={canJump ? () => onJump(step.key) : undefined}
                disabled={!canJump}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${i + 1} of ${TOTAL_STEPS}: ${step.label}${
                  isComplete ? " — complete" : isActive ? " — current" : ""
                }`}
                className={cn(
                  "group relative flex size-9 sm:size-10 items-center justify-center rounded-full border text-xs font-semibold transition-all select-none shrink-0",
                  state === "complete" &&
                    "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30",
                  state === "active" &&
                    "border-primary ring-4 ring-primary/15 bg-background text-primary",
                  state === "upcoming" &&
                    "border-border bg-background text-muted-foreground",
                  canJump && "hover:scale-105 cursor-pointer",
                  !canJump && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] sm:text-xs tabular-nums",
                    state === "complete" && "text-primary-foreground",
                  )}
                >
                  {i + 1}
                </span>
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
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default QuickShipStepper;
export { STEP_ORDER, TOTAL_STEPS };
export type { QuickShipStep };
