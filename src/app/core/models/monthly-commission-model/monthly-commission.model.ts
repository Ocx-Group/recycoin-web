/**
 * Monthly commission liquidation of the brand that owns this dashboard.
 *
 * Not to be confused with `CommissionSettings`, which is the per-purchase upline
 * bonus. This one is the periodic payout an administrator runs from
 * admin/calculate-commissions, and every brand liquidates the payment group of its
 * own product at its own rate.
 */
export interface MonthlyCommissionSettings {
  brandId: number;
  /** While false the server refuses to liquidate this brand. */
  enabled: boolean;
  /** Percentage of the invoice total paid for a full period. */
  interestRate: number;
  /** Days an invoice created inside the period waits before it starts earning. */
  waitingDays: number;
  /** Payment group of the product this brand liquidates. */
  paymentGroupId: number | null;
  updatedAt: string;
}

export type UpdateMonthlyCommissionSettingsRequest = Omit<
  MonthlyCommissionSettings,
  'brandId' | 'updatedAt'
>;

/**
 * One liquidation run. The brand and the administrator name are deliberately absent:
 * the server takes both from the admin session, so they cannot be chosen here.
 *
 * The three optional parameters override the brand defaults for this run only; leave
 * them undefined to use what is configured.
 */
export interface MonthlyCommissionRunRequest {
  startDate: string;
  endDate: string;
  interestRate?: number;
  waitingDays?: number;
  paymentGroupId?: number;
  /** True previews what would be paid without writing anything. */
  dryRun: boolean;
}

export interface MonthlyCommissionItem {
  affiliateId: number;
  affiliateUserName: string;
  credit: number;
}

export interface MonthlyCommissionResult {
  dryRun: boolean;
  /** Affiliates paid, or that would be paid on a simulation. */
  rowsAffected: number;
  totalCredit: number;
  startDate: string;
  endDate: string;
  /** The parameters actually used, after the brand defaults were applied. */
  interestRate: number;
  waitingDays: number;
  paymentGroupId: number;
  items: MonthlyCommissionItem[];
}

/** Mirrors `MonthlyCommissionSettingsLimits` on the server. */
export const MONTHLY_COMMISSION_MAX_INTEREST_RATE = 100;
export const MONTHLY_COMMISSION_MAX_WAITING_DAYS = 90;
