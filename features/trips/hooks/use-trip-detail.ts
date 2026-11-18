"use client";

import { useQuery } from "@tanstack/react-query";
import { ensureAnonymousSession, getErrorMessage } from "@/lib/supabase";
import { tripKeys } from "@/lib/query-client";
import type { TripDetailData, TripRow, Member, Expense, Balance } from "../types";

export function useTripDetail(tripId: string) {
  return useQuery({
    queryKey: tripKeys.detail(tripId),
    queryFn: async (): Promise<TripDetailData> => {
      const { supabase, userId } = await ensureAnonymousSession();

      const [tripResult, memberResult, expenseResult, balanceResult] = await Promise.all([
        supabase
          .from("trips")
          .select("id, name, destination, start_date, end_date, invite_code, status")
          .eq("id", tripId)
          .single(),
        supabase
          .from("trip_members")
          .select("id, trip_id, display_name, role, status, user_id, created_at")
          .eq("trip_id", tripId)
          .is("deleted_at", null)
          .order("created_at"),
        supabase
          .from("expenses")
          .select("id, title, amount, category, spent_on, paid_by, created_at, expense_splits(member_id, owed_amount)")
          .eq("trip_id", tripId)
          .is("deleted_at", null)
          .order("spent_on", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase.rpc("get_trip_balances", { p_trip: tripId }),
      ]);

      if (tripResult.error) throw new Error(getErrorMessage(tripResult.error));
      if (memberResult.error) throw new Error(getErrorMessage(memberResult.error));
      if (expenseResult.error) throw new Error(getErrorMessage(expenseResult.error));
      if (balanceResult.error) throw new Error(getErrorMessage(balanceResult.error));

      return {
        trip: tripResult.data as TripRow,
        members: (memberResult.data ?? []) as Member[],
        expenses: (expenseResult.data ?? []) as unknown as Expense[],
        balances: (balanceResult.data ?? []) as Balance[],
        userId,
      };
    },
    enabled: !!tripId,
  });
}
