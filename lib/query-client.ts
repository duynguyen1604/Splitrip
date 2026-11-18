import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export const tripKeys = {
  all: ["trips"] as const,
  detail: (id: string) => ["trips", id] as const,
  balances: (id: string) => ["trips", id, "balances"] as const,
  expenses: (id: string) => ["trips", id, "expenses"] as const,
  members: (id: string) => ["trips", id, "members"] as const,
  settlements: (id: string) => ["trips", id, "settlements"] as const,
  bankAccounts: (id: string) => ["trips", id, "bank-accounts"] as const,
};
