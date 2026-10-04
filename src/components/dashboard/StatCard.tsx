"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatAccent =
  | "indigo"
  | "emerald"
  | "amber"
  | "rose"
  | "blue"
  | "lime"
  | "purple"
  | "orange"
  | "slate";

const ACCENT_CLASSES: Record<StatAccent, { iconBg: string; iconText: string; value: string; delta: string }> = {
  indigo: {
    iconBg: "bg-indigo-500/10",
    iconText: "text-indigo-600 dark:text-indigo-400",
    value: "text-indigo-600 dark:text-indigo-400",
    delta: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
    delta: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600 dark:text-amber-400",
    value: "text-amber-600 dark:text-amber-400",
    delta: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    iconBg: "bg-rose-500/10",
    iconText: "text-rose-600 dark:text-rose-400",
    value: "text-rose-600 dark:text-rose-400",
    delta: "text-rose-600 dark:text-rose-400",
  },
  blue: {
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-600 dark:text-blue-400",
    value: "text-blue-600 dark:text-blue-400",
    delta: "text-blue-600 dark:text-blue-400",
  },
  lime: {
    iconBg: "bg-lime-500/10",
    iconText: "text-lime-600 dark:text-lime-400",
    value: "text-lime-600 dark:text-lime-400",
    delta: "text-lime-600 dark:text-lime-400",
  },
  purple: {
    iconBg: "bg-purple-500/10",
    iconText: "text-purple-600 dark:text-purple-400",
    value: "text-purple-600 dark:text-purple-400",
    delta: "text-purple-600 dark:text-purple-400",
  },
  orange: {
    iconBg: "bg-orange-500/10",
    iconText: "text-orange-600 dark:text-orange-400",
    value: "text-orange-600 dark:text-orange-400",
    delta: "text-orange-600 dark:text-orange-400",
  },
  slate: {
    iconBg: "bg-slate-500/10",
    iconText: "text-slate-600 dark:text-slate-400",
    value: "text-slate-600 dark:text-slate-400",
    delta: "text-slate-500 dark:text-slate-400",
  },
};

type DeltaDirection = "up" | "down" | "neutral";

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  accent?: StatAccent;
  deltaLabel?: React.ReactNode;
  deltaDirection?: DeltaDirection;
  action?: React.ReactNode;
  className?: string;
  loading?: boolean;
  ariaLabel?: string;
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  accent = "indigo",
  deltaLabel,
  deltaDirection = "neutral",
  action,
  className,
  loading,
  ariaLabel,
}: StatCardProps) {
  const a = ACCENT_CLASSES[accent];
  const DeltaIcon = deltaDirection === "up" ? TrendingUp : deltaDirection === "down" ? TrendingDown : null;

  return (
    <Card className={cn(className)} aria-busy={loading} aria-label={ariaLabel}>
      <CardHeader className="pb-2 flex-row items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {loading ? <Skeleton className="h-3.5 w-20 inline-block" /> : label}
          </CardTitle>
          {description ? (
            <CardDescription className="text-[11px] uppercase tracking-wider">
              {loading ? <Skeleton className="h-3 w-16 inline-block" /> : description}
            </CardDescription>
          ) : null}
        </div>
        {Icon ? (
          <div
            aria-hidden
            className={cn(
              "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center",
              a.iconBg,
              a.iconText,
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-1">
        <p
          className={cn(
            "text-2xl font-bold tracking-tight",
            loading ? "text-transparent" : a.value,
          )}
        >
          {loading ? <Skeleton className="h-8 w-24" /> : value}
        </p>
        {deltaLabel !== undefined || DeltaIcon ? (
          <p
            className={cn(
              "text-xs font-medium inline-flex items-center gap-1",
              deltaDirection === "up"
                ? ACCENT_CLASSES.emerald.delta
                : deltaDirection === "down"
                  ? ACCENT_CLASSES.rose.delta
                  : "text-muted-foreground",
            )}
          >
            {DeltaIcon ? <DeltaIcon className="h-3 w-3" /> : null}
            {loading ? <Skeleton className="h-3 w-14 inline-block" /> : deltaLabel}
          </p>
        ) : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export default StatCard;
export type { StatAccent, DeltaDirection };
