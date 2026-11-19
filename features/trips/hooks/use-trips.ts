"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest, ensureAuthenticatedUser } from "@/lib/api-client";
import { tripKeys } from "@/lib/query-client";
import type { TripRow } from "../types";

export function useTrips() {
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: async (): Promise<TripRow[]> => {
      await ensureAuthenticatedUser();
      return apiRequest<TripRow[]>("/api/trips");
    },
  });
}
