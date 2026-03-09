import React, { useState, useEffect } from 'react';
import { useDistricts } from '@/hooks/useAddressData';
import type { Province, District } from '@/types/address.types';

interface AddressPanelProps {
  prefix: 'billing' | 'shipping';
  label: string;
  provinces: Province[];
  initialProvince?: string;
  initialDistrict?: string;
  onProvinceChange: (v: string) => void;
  onDistrictChange: (v: string) => void;
}

const AddressPanel: React.FC<AddressPanelProps> = ({
  prefix,
  label,
  provinces,
  initialProvince = '',
  initialDistrict = '',
  onProvinceChange,
  onDistrictChange,
}) => {
  const [province, setProvince] = useState(initialProvince);
  const [district, setDistrict] = useState(initialDistrict);

  const { data: districts = [], isLoading } = useDistricts(province || null);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvince(e.target.value);
    setDistrict('');
    onProvinceChange(e.target.value);
    onDistrictChange('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistrict(e.target.value);
    onDistrictChange(e.target.value);
  };

  // Reset district when province changes and districts reload
  useEffect(() => {
    if (!districts.find((d: District) => d.maqh === district)) {
      setDistrict('');
    }
  }, [districts]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="order_data_column">
      <h3>{label}</h3>
      <div className="address">
        <p className="form-field form-field-wide">
          <label htmlFor={`${prefix}_state_select`}>Province/City:</label>
          <select
            id={`${prefix}_state_select`}
            value={province}
            onChange={handleProvinceChange}
            className="select short"
          >
            <option value="">Select province/city</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </p>
        <p className="form-field form-field-wide">
          <label htmlFor={`${prefix}_city_select`}>District:</label>
          <select
            id={`${prefix}_city_select`}
            value={district}
            onChange={handleDistrictChange}
            disabled={!province || isLoading}
            className="select short"
          >
            <option value="">
              {isLoading ? 'Loading...' : 'Select district'}
            </option>
            {districts.map((d: District) => (
              <option key={d.maqh} value={d.maqh}>
                {d.name}
              </option>
            ))}
          </select>
        </p>
      </div>
    </div>
  );
};

interface OrderAddressEditorProps {
  provinces: Province[];
  initialBillingState?: string;
  initialBillingCity?: string;
  initialShippingState?: string;
  initialShippingCity?: string;
}

export const OrderAddressEditor: React.FC<OrderAddressEditorProps> = ({
  provinces,
  initialBillingState = '',
  initialBillingCity = '',
  initialShippingState = '',
  initialShippingCity = '',
}) => {
  const [billingState, setBillingState] = useState(initialBillingState);
  const [billingCity, setBillingCity] = useState(initialBillingCity);
  const [shippingState, setShippingState] = useState(initialShippingState);
  const [shippingCity, setShippingCity] = useState(initialShippingCity);

  // Sync with hidden input fields for WordPress to save
  useEffect(() => {
    const el = document.getElementById('_billing_state') as HTMLInputElement | null;
    if (el) el.value = billingState;
  }, [billingState]);

  useEffect(() => {
    const el = document.getElementById('_billing_city') as HTMLInputElement | null;
    if (el) el.value = billingCity;
  }, [billingCity]);

  useEffect(() => {
    const el = document.getElementById('_shipping_state') as HTMLInputElement | null;
    if (el) el.value = shippingState;
  }, [shippingState]);

  useEffect(() => {
    const el = document.getElementById('_shipping_city') as HTMLInputElement | null;
    if (el) el.value = shippingCity;
  }, [shippingCity]);

  return (
    <div className="coolbirdzik-admin-order-address">
      <AddressPanel
        prefix="billing"
        label="Billing address"
        provinces={provinces}
        initialProvince={initialBillingState}
        initialDistrict={initialBillingCity}
        onProvinceChange={setBillingState}
        onDistrictChange={setBillingCity}
      />
      <AddressPanel
        prefix="shipping"
        label="Shipping address"
        provinces={provinces}
        initialProvince={initialShippingState}
        initialDistrict={initialShippingCity}
        onProvinceChange={setShippingState}
        onDistrictChange={setShippingCity}
      />
    </div>
  );
};
