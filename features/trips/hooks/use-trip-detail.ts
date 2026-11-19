"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest, ensureAuthenticatedUser } from "@/lib/api-client";
import { tripKeys } from "@/lib/query-client";
import type { TripDetailData } from "../types";

export function useTripDetail(tripId: string) {
  return useQuery({
    queryKey: tripKeys.detail(tripId),
    queryFn: async (): Promise<TripDetailData> => {
      await ensureAuthenticatedUser();
      return apiRequest<TripDetailData>(`/api/trips/${tripId}`);
    },
    enabled: !!tripId,
  });
}
