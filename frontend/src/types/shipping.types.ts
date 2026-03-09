// Shipping rate types

export interface WeightTier {
  min: number;   // kg
  max: number;   // kg (0 = unlimited)
  price: number; // VND — per-tier flat price OR per-kg surcharge depending on weight_calc_type
}

export interface OrderTotalRule {
  min_total: number;  // VND – lower bound (inclusive)
  max_total: number;  // VND – upper bound (inclusive); 0 = no upper bound
  shipping_fee: number; // VND; 0 = free shipping
}

export type LocationType = 'province' | 'district' | 'ward' | 'region';

/**
 * weight_calc_type:
 *  'replace' – weight tier price replaces base_rate entirely (default)
 *  'per_kg'  – weight tier price is a per-kg surcharge added on top of base_rate
 */
export type WeightCalcType = 'replace' | 'per_kg';

export interface ShippingRate {
  id?: number;
  location_type: LocationType;
  location_code: string;   // Province code, district maqh, ward xaid, or region_code
  location_name?: string;  // Display name (populated by the server)
  base_rate: number;       // VND
  weight_tiers: WeightTier[];
  order_total_rules: OrderTotalRule[];
  weight_calc_type: WeightCalcType;
  priority: number;
  updated_at?: string;
}

export interface ShippingRateFormData {
  location_type: LocationType;
  location_code: string;
  base_rate: number;
  weight_tiers: WeightTier[];
  order_total_rules: OrderTotalRule[];
  weight_calc_type: WeightCalcType;
  priority: number;
}

// ---- Regions ----------------------------------------------------------------

export interface Region {
  id?: number;
  region_name: string;
  region_code: string;
  province_codes: string[]; // Array of province code strings
  is_predefined: boolean;
  updated_at?: string;
}

// ---- CSV import result -------------------------------------------------------

export interface CSVImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

// ---- Bulk-apply result -------------------------------------------------------

export interface BulkApplyResult {
  inserted: number;
  updated: number;
}
