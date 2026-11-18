"use client";

import { createContext, useContext } from "react";
import type { TripDetailData } from "./types";

interface TripContextValue {
  data: TripDetailData;
  isLoading: boolean;
  refetch: () => void;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({
  value,
  children,
}: {
  value: TripContextValue;
  children: React.ReactNode;
}) {
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTripContext() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTripContext must be used within a TripProvider");
  }
  return context;
}
