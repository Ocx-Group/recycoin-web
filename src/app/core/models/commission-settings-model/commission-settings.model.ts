/**
 * Purchase bonus ("bono diario") settings of the brand that owns this dashboard.
 * `commissionLevels[0]` is the percentage paid to level 1, `[1]` to level 2, and so on.
 */
export interface CommissionSettings {
  brandId: number;
  commissionEnabled: boolean;
  commissionLevels: number[];
  /**
   * When false the bonus is only paid for purchases that explicitly activated it;
   * when true it is paid on every purchase of the brand.
   */
  dailyBonusAlwaysDistribute: boolean;
  updatedAt: string;
}

export type UpdateCommissionSettingsRequest = Omit<
  CommissionSettings,
  'brandId' | 'updatedAt'
>;

/** Mirrors `CommissionSettingsLimits` on the server. */
export const COMMISSION_MAX_LEVELS = 10;
export const COMMISSION_MAX_TOTAL_PERCENTAGE = 100;
