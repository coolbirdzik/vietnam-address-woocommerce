import React, { useState } from 'react';
import type { ShippingRate, WeightTier, OrderTotalRule, LocationType, WeightCalcType } from '@/types/shipping.types';

interface RateFormProps {
  rate: ShippingRate | null;
  locationType: LocationType;
  locationCode: string;
  locationName?: string;
  onSave: (rate: Partial<ShippingRate>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  province: 'Province/City',
  district: 'District',
  ward:     'Ward/Commune/Town',
  region:   'Region',
};

export const RateForm: React.FC<RateFormProps> = ({
  rate,
  locationType,
  locationCode,
  locationName,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [baseRate, setBaseRate]         = useState(rate?.base_rate ?? 0);
  const [priority, setPriority]         = useState(rate?.priority ?? 0);
  const [weightCalcType, setWeightCalcType] = useState<WeightCalcType>(
    rate?.weight_calc_type ?? 'replace'
  );
  const [weightTiers, setWeightTiers]   = useState<WeightTier[]>(
    rate?.weight_tiers?.length ? rate.weight_tiers : []
  );
  const [orderRules, setOrderRules]     = useState<OrderTotalRule[]>(
    rate?.order_total_rules ?? []
  );

  // ---- Weight tier helpers --------------------------------------------------

  const addWeightTier = () =>
    setWeightTiers([...weightTiers, { min: 0, max: 0, price: 0 }]);

  const removeWeightTier = (i: number) =>
    setWeightTiers(weightTiers.filter((_, idx) => idx !== i));

  const updateWeightTier = (i: number, field: keyof WeightTier, value: number) => {
    const next = [...weightTiers];
    next[i] = { ...next[i], [field]: value };
    setWeightTiers(next);
  };

  // ---- Order rule helpers ---------------------------------------------------

  const addOrderRule = () =>
    setOrderRules([...orderRules, { min_total: 0, max_total: 0, shipping_fee: 0 }]);

  const removeOrderRule = (i: number) =>
    setOrderRules(orderRules.filter((_, idx) => idx !== i));

  const updateOrderRule = (i: number, field: keyof OrderTotalRule, value: number) => {
    const next = [...orderRules];
    next[i] = { ...next[i], [field]: value };
    setOrderRules(next);
  };

  // ---- Submit ---------------------------------------------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: rate?.id,
      location_type: locationType,
      location_code: locationCode,
      base_rate: baseRate,
      priority,
      weight_calc_type: weightCalcType,
      weight_tiers: weightTiers,
      order_total_rules: orderRules,
    });
  };

  // ---- Styles (inline, no external deps) -----------------------------------

  const inputStyle: React.CSSProperties = {
    borderRadius: '4px',
    border: '1px solid #8c8f94',
    padding: '4px 8px',
  };

  const tileStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  };

  const descStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  };

  const segmentStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 14px',
    border: '1px solid',
    borderColor: active ? '#2271b1' : '#c3c4c7',
    borderRadius: active ? '4px' : '4px',
    background: active ? '#2271b1' : '#fff',
    color: active ? '#fff' : '#1d2327',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.1s',
  });

  return (
    <div
      className="coolbirdzik-rate-form"
      style={{
        margin: '20px 0',
        padding: '20px',
        background: '#f9f9f9',
        border: '1px solid #c3c4c7',
        borderRadius: '4px',
      }}
    >
      <h3 style={{ marginTop: 0 }}>
        {rate ? 'Edit shipping rate' : 'Add shipping rate'}
        {locationName && (
          <span style={{ fontWeight: 'normal', fontSize: '14px', marginLeft: '8px', color: '#6b7280' }}>
            — {LOCATION_TYPE_LABELS[locationType]}: {locationName}
          </span>
        )}
      </h3>

      <form onSubmit={handleSubmit}>
        <table className="form-table">
          <tbody>
            {/* Base rate */}
            <tr>
              <th scope="row"><label>Base rate (VND)</label></th>
              <td>
                <input
                  type="number"
                  value={baseRate}
                  onChange={(e) => setBaseRate(Number(e.target.value))}
                  min="0"
                  step="1000"
                  required
                  style={{ ...inputStyle, width: '180px' }}
                />
                <p style={descStyle}>Default rate when no weight tier matches.</p>
              </td>
            </tr>

            {/* Priority */}
            <tr>
              <th scope="row"><label>Priority</label></th>
              <td>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  min="0"
                  style={{ ...inputStyle, width: '100px' }}
                />
                <p style={descStyle}>Higher numbers win when multiple rules match the same location.</p>
              </td>
            </tr>

            {/* Weight calculation mode */}
            <tr>
              <th scope="row"><label>Weight calculation</label></th>
              <td>
                <div style={{ display: 'flex', gap: 0, borderRadius: '4px', overflow: 'hidden', width: 'fit-content' }}>
                  <button
                    type="button"
                    style={segmentStyle(weightCalcType === 'replace')}
                    onClick={() => setWeightCalcType('replace')}
                  >
                    Replace base rate
                  </button>
                  <button
                    type="button"
                    style={segmentStyle(weightCalcType === 'per_kg')}
                    onClick={() => setWeightCalcType('per_kg')}
                  >
                    Add per kg
                  </button>
                </div>
                <p style={descStyle}>
                  {weightCalcType === 'replace'
                    ? 'Weight tiers replace the base rate completely.'
                    : 'Calculated: base rate + (weight × tier price per kg).'}
                </p>
              </td>
            </tr>

            {/* Weight tiers */}
            <tr>
              <th scope="row" style={{ verticalAlign: 'top', paddingTop: '12px' }}>
                <label>Weight tiers</label>
              </th>
              <td>
                {weightTiers.length === 0 && (
                  <p style={{ ...descStyle, marginBottom: '8px' }}>
                    No tiers — base rate always applies.
                  </p>
                )}
                {weightTiers.map((tier, i) => (
                  <div key={i} style={tileStyle}>
                    <span style={{ minWidth: '28px', color: '#6b7280', fontSize: '12px' }}>#{i + 1}</span>
                    <span style={{ fontSize: '13px' }}>From</span>
                    <input
                      type="number"
                      value={tier.min}
                      onChange={(e) => updateWeightTier(i, 'min', Number(e.target.value))}
                      min="0"
                      step="0.1"
                      placeholder="0"
                      style={{ ...inputStyle, width: '90px' }}
                    />
                    <span style={{ fontSize: '13px' }}>kg — to</span>
                    <input
                      type="number"
                      value={tier.max}
                      onChange={(e) => updateWeightTier(i, 'max', Number(e.target.value))}
                      min="0"
                      step="0.1"
                      placeholder="0 = ∞"
                      style={{ ...inputStyle, width: '90px' }}
                      title="0 = unlimited"
                    />
                    <span style={{ fontSize: '13px' }}>kg</span>
                    <span style={{ fontSize: '13px', color: '#2271b1' }}>→</span>
                    <input
                      type="number"
                      value={tier.price}
                      onChange={(e) => updateWeightTier(i, 'price', Number(e.target.value))}
                      min="0"
                      step="1000"
                      placeholder={weightCalcType === 'per_kg' ? 'VND/kg' : 'VND'}
                      style={{ ...inputStyle, width: '130px' }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      {weightCalcType === 'per_kg' ? 'VND/kg' : 'VND'}
                    </span>
                    <button
                      type="button"
                      className="button button-small"
                      onClick={() => removeWeightTier(i)}
                      style={{ color: '#b32d2e' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" className="button button-small" onClick={addWeightTier}>
                  + Add weight tier
                </button>
              </td>
            </tr>

            {/* Order total rules */}
            <tr>
              <th scope="row" style={{ verticalAlign: 'top', paddingTop: '12px' }}>
                <label>Order total conditions</label>
              </th>
              <td>
                {orderRules.length === 0 && (
                  <p style={{ ...descStyle, marginBottom: '8px' }}>
                    No conditions — weight rate (or base rate) always applies.
                  </p>
                )}
                {orderRules.map((rule, i) => (
                  <div key={i} style={tileStyle}>
                    <span style={{ minWidth: '28px', color: '#6b7280', fontSize: '12px' }}>#{i + 1}</span>
                    <span style={{ fontSize: '13px' }}>Order from</span>
                    <input
                      type="number"
                      value={rule.min_total}
                      onChange={(e) => updateOrderRule(i, 'min_total', Number(e.target.value))}
                      min="0"
                      step="1000"
                      placeholder="0"
                      style={{ ...inputStyle, width: '140px' }}
                    />
                    <span style={{ fontSize: '13px' }}>VND — to</span>
                    <input
                      type="number"
                      value={rule.max_total}
                      onChange={(e) => updateOrderRule(i, 'max_total', Number(e.target.value))}
                      min="0"
                      step="1000"
                      placeholder="0 = ∞"
                      style={{ ...inputStyle, width: '140px' }}
                      title="0 = unlimited"
                    />
                    <span style={{ fontSize: '13px' }}>VND</span>
                    <span style={{ fontSize: '13px', color: '#2271b1' }}>→ shipping fee</span>
                    <input
                      type="number"
                      value={rule.shipping_fee}
                      onChange={(e) => updateOrderRule(i, 'shipping_fee', Number(e.target.value))}
                      min="0"
                      step="1000"
                      placeholder="0 = free"
                      style={{ ...inputStyle, width: '140px' }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>VND</span>
                    <button
                      type="button"
                      className="button button-small"
                      onClick={() => removeOrderRule(i)}
                      style={{ color: '#b32d2e' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" className="button button-small" onClick={addOrderRule}>
                  + Add order condition
                </button>
                <p style={descStyle}>
                  The first matching condition (in order) applies.
                  Set 0 in the "to" field for no upper limit.
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <button type="submit" className="button button-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save shipping rate'}
          </button>
          <button type="button" className="button" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
