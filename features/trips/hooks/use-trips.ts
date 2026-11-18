"use client";

import { useQuery } from "@tanstack/react-query";
import { ensureAnonymousSession } from "@/lib/supabase";
import { tripKeys } from "@/lib/query-client";
import type { MembershipRow, TripRow } from "../types";

export function useTrips() {
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: async (): Promise<TripRow[]> => {
      const { supabase, userId } = await ensureAnonymousSession();
      const { data, error } = await supabase
        .from("trip_members")
        .select("id, role, trips(id, name, destination, start_date, invite_code, status)")
        .eq("user_id", userId)
        .eq("status", "active")
        .is("deleted_at", null);

      if (error) throw error;
      const rows = (data ?? []) as unknown as MembershipRow[];
      return rows.flatMap((row) =>
        row.trips ? (Array.isArray(row.trips) ? row.trips : [row.trips]) : []
      );
    },
  });
}
