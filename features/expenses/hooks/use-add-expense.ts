"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ensureAnonymousSession, getErrorMessage } from "@/lib/supabase";
import { tripKeys } from "@/lib/query-client";

export type AddExpenseInput = {
  tripId: string;
  title: string;
  amount: number;
  paidBy: string;
  category: string;
  spentOn: string;
  splits: { member_id: string; owed_amount: number }[];
};

export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddExpenseInput): Promise<string> => {
      const { supabase } = await ensureAnonymousSession();
      const clientId = crypto.randomUUID();

      const { data, error } = await supabase.rpc("add_expense", {
        p_trip_id: input.tripId,
        p_client_id: clientId,
        p_title: input.title.trim(),
        p_amount: input.amount,
        p_paid_by: input.paidBy,
        p_category: input.category,
        p_spent_on: input.spentOn,
        p_splits: input.splits,
      });

      if (error) throw new Error(getErrorMessage(error));
      return data as string;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(variables.tripId) });
    },
  });
}
