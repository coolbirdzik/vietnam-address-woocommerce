import React from 'react';
import { useDistricts, useWards } from '@/hooks/useAddressData';
import type { Province } from '@/types/address.types';

interface LocationDrillDownProps {
  provinces: Province[];
  selectedProvince: string;
  selectedDistrict: string;
  selectedWard: string;
  onProvinceChange: (code: string) => void;
  onDistrictChange: (code: string) => void;
  onWardChange: (code: string) => void;
}

export const LocationDrillDown: React.FC<LocationDrillDownProps> = ({
  provinces,
  selectedProvince,
  selectedDistrict,
  selectedWard,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
}) => {
  const { data: districts = [], isLoading: loadingDistricts } = useDistricts(selectedProvince);
  const { data: wards = [], isLoading: loadingWards } = useWards(selectedDistrict);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onProvinceChange(value);
    onDistrictChange('');
    onWardChange('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onDistrictChange(value);
    onWardChange('');
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onWardChange(e.target.value);
  };

  return (
    <div className="coolbirdzik-location-drilldown" style={{ marginBottom: '20px' }}>
      <div className="coolbirdzik-location-breadcrumb">
        <select
          value={selectedProvince}
          onChange={handleProvinceChange}
          className="chosen_select"
          style={{ minWidth: '200px', marginRight: '10px' }}
        >
          <option value="">-- Select province/city --</option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>

        {selectedProvince && (
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="chosen_select"
            style={{ minWidth: '200px', marginRight: '10px' }}
            disabled={loadingDistricts}
          >
            <option value="">
              {loadingDistricts ? 'Loading...' : '-- Select district --'}
            </option>
            {districts.map((district) => (
              <option key={district.maqh} value={district.maqh}>
                {district.name}
              </option>
            ))}
          </select>
        )}

        {selectedDistrict && (
          <select
            value={selectedWard}
            onChange={handleWardChange}
            className="chosen_select"
            style={{ minWidth: '200px' }}
            disabled={loadingWards}
          >
            <option value="">
              {loadingWards ? 'Loading...' : '-- Select ward/commune/town --'}
            </option>
            {wards.map((ward) => (
              <option key={ward.xaid} value={ward.xaid}>
                {ward.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
