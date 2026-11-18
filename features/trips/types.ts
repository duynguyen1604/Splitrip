export type TripRow = {
  id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date?: string | null;
  invite_code: string;
  status?: string;
};

export type Member = {
  id: string;
  trip_id?: string;
  display_name: string;
  role: "owner" | "member" | string;
  status: "active" | "left" | "removed" | string;
  user_id: string | null;
  created_at: string;
};

export type MembershipRow = {
  id: string;
  role: string;
  trips: TripRow | TripRow[] | null;
};

export type ExpenseSplit = {
  member_id: string;
  owed_amount: number;
  weight?: number | null;
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  spent_on: string;
  paid_by: string;
  created_at?: string;
  expense_splits: ExpenseSplit[];
};

export type Balance = {
  member_id: string;
  paid: number;
  owed: number;
  sent: number;
  received: number;
  net: number;
};

export type TripDetailData = {
  trip: TripRow;
  members: Member[];
  expenses: Expense[];
  balances: Balance[];
  userId: string;
};
