"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callRpc, ensureAuthenticatedUser } from "@/lib/api-client";
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
      await ensureAuthenticatedUser();
      const clientId = crypto.randomUUID();

      const data = await callRpc<string>("add_expense", {
        p_trip_id: input.tripId,
        p_client_id: clientId,
        p_title: input.title.trim(),
        p_amount: input.amount,
        p_paid_by: input.paidBy,
        p_category: input.category,
        p_spent_on: input.spentOn,
        p_splits: input.splits,
      });

      return data as string;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(variables.tripId) });
    },
  });
}
