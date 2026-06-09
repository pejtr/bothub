/**
 * A/B Testing Hook
 * Assigns visitors to test variants and persists assignment in localStorage + DB
 * Supports 2-way or 3-way splits
 * Uses a stable visitor ID based on random UUID stored in localStorage
 */

import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";

function getVisitorId(): string {
  const key = "ibots_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export interface ABTestConfig {
  testName: string;
  variants: {
    control: Record<string, any>;
    variant_b: Record<string, any>;
    variant_c?: Record<string, any>;
  };
}

export function useABTest(config: ABTestConfig) {
  const visitorId = useMemo(() => getVisitorId(), []);
  const [localVariant, setLocalVariant] = useState<string | null>(() => {
    return localStorage.getItem(`ab_${config.testName}`);
  });

  const { data: serverVariant } = trpc.abtest.getVariant.useQuery(
    { testName: config.testName, visitorId },
    { enabled: !localVariant }
  );

  const recordConversion = trpc.abtest.recordConversion.useMutation();

  useEffect(() => {
    if (serverVariant && !localVariant) {
      setLocalVariant(serverVariant.variant);
      localStorage.setItem(`ab_${config.testName}`, serverVariant.variant);
    }
  }, [serverVariant, localVariant, config.testName]);

  const variant = localVariant || serverVariant?.variant || "control";
  const values = config.variants[variant as keyof typeof config.variants] || config.variants.control;

  const trackConversion = (value?: number) => {
    recordConversion.mutate({
      testName: config.testName,
      visitorId,
      conversionValue: value,
    });
  };

  return {
    variant,
    values,
    visitorId,
    trackConversion,
    isLoading: !localVariant && !serverVariant,
  };
}
