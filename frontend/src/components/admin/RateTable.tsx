import React from 'react';
import type { ShippingRate, LocationType } from '@/types/shipping.types';

interface RateTableProps {
  rates: ShippingRate[];
  isLoading: boolean;
  onEdit: (rate: ShippingRate) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  province: 'Province',
  district: 'District',
  ward:     'Ward',
  region:   'Region',
};

const WEIGHT_CALC_LABELS: Record<string, string> = {
  replace: 'Replace',
  per_kg:  'Per kg',
};

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export const RateTable: React.FC<RateTableProps> = ({
  rates,
  isLoading,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  if (isLoading) return <p>Loading...</p>;

  if (rates.length === 0) {
    return (
      <div className="notice notice-warning inline" style={{ marginTop: '12px' }}>
        <p>No shipping rates for this location yet.</p>
      </div>
    );
  }

  return (
    <table className="wp-list-table widefat fixed striped" style={{ marginTop: '16px' }}>
      <thead>
        <tr>
          <th style={{ width: '160px' }}>Location</th>
          <th style={{ width: '120px' }}>Base rate</th>
          <th style={{ width: '160px' }}>Weight calc</th>
          <th>Weight tiers</th>
          <th>Order conditions</th>
          <th style={{ width: '60px' }}>Priority</th>
          <th style={{ width: '110px' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rates.map((rate) => (
          <tr key={rate.id}>
            <td>
              <strong>{rate.location_name || rate.location_code}</strong>
              <br />
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '3px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  background: rate.location_type === 'region' ? '#dbeafe' : '#f3f4f6',
                  color: rate.location_type === 'region' ? '#1d4ed8' : '#374151',
                }}
              >
                {LOCATION_TYPE_LABELS[rate.location_type]}
              </span>
            </td>

            <td>{fmtVND(rate.base_rate)}</td>

            <td>
              <span
                style={{
                  fontSize: '12px',
                  color: rate.weight_calc_type === 'per_kg' ? '#059669' : '#6b7280',
                }}
              >
                {WEIGHT_CALC_LABELS[rate.weight_calc_type] ?? rate.weight_calc_type}
              </span>
            </td>

            <td>
              {rate.weight_tiers && rate.weight_tiers.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px' }}>
                  {rate.weight_tiers.map((tier, idx) => (
                    <li key={idx}>
                      {tier.min}–{tier.max > 0 ? `${tier.max}` : '∞'} kg:{' '}
                      {fmtVND(tier.price)}
                      {rate.weight_calc_type === 'per_kg' && '/kg'}
                    </li>
                  ))}
                </ul>
              ) : (
                <em style={{ color: '#9ca3af', fontSize: '12px' }}>—</em>
              )}
            </td>

            <td>
              {rate.order_total_rules && rate.order_total_rules.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px' }}>
                  {rate.order_total_rules.map((rule, idx) => (
                    <li key={idx}>
                      {fmtVND(rule.min_total)}
                      {rule.max_total > 0 ? `–${fmtVND(rule.max_total)}` : '+'}:{' '}
                      {rule.shipping_fee === 0 ? (
                        <strong style={{ color: '#16a34a' }}>Free</strong>
                      ) : (
                        fmtVND(rule.shipping_fee)
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <em style={{ color: '#9ca3af', fontSize: '12px' }}>—</em>
              )}
            </td>

            <td style={{ textAlign: 'center' }}>{rate.priority}</td>

            <td>
              <button
                type="button"
                className="button button-small"
                onClick={() => onEdit(rate)}
                disabled={isDeleting}
                style={{ marginRight: '4px' }}
              >
                Edit
              </button>
              <button
                type="button"
                className="button button-small button-link-delete"
                onClick={() => rate.id && onDelete(rate.id)}
                disabled={isDeleting}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
