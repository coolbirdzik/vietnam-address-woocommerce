import React, { useState } from 'react';
import {
  useShippingRates,
  useSaveShippingRate,
  useDeleteShippingRate,
} from '@/hooks/useShippingRates';
import { useBulkApplyRegionRate } from '@/hooks/useRegions';
import { useRegions } from '@/hooks/useRegions';
import { RateTable } from './RateTable';
import { RateForm } from './RateForm';
import { CSVImportExport } from './CSVImportExport';
import { LocationDrillDown } from './LocationDrillDown';
import { RegionManager } from './RegionManager';
import type { Province } from '@/types/address.types';
import type { Region, ShippingRate, LocationType } from '@/types/shipping.types';

interface ShippingRateManagerProps {
  provinces: Province[];
}

type Tab = 'by_location' | 'by_region' | 'manage_regions';

// ---- Bulk-apply panel ------------------------------------------------------- //

interface BulkApplyPanelProps {
  region: Region;
  provinces: Province[];
  onDone: () => void;
}

const BulkApplyPanel: React.FC<BulkApplyPanelProps> = ({ region, provinces, onDone }) => {
  const { mutate: bulkApply, isPending } = useBulkApplyRegionRate();
  const [result, setResult]             = useState<{ inserted: number; updated: number } | null>(null);

  const provinceMap = React.useMemo(() => {
    const m: Record<string, string> = {};
    provinces.forEach((p) => (m[p.code] = p.name));
    return m;
  }, [provinces]);

  const handleSave = (rateData: Partial<ShippingRate>) => {
    bulkApply(
      { regionCode: region.region_code, rate: rateData },
      {
        onSuccess: (res) => {
          setResult(res);
        },
      }
    );
  };

  if (result) {
    return (
      <div
        style={{
          padding: '20px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '4px',
          margin: '16px 0',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#16a34a' }}>Applied successfully!</h3>
        <p>
          Created <strong>{result.inserted}</strong> rules and updated{' '}
          <strong>{result.updated}</strong> existing rules for{' '}
          <strong>{region.province_codes.length}</strong> provinces/cities in region{' '}
          <strong>{region.region_name}</strong>.
        </p>
        <p style={{ fontSize: '12px', color: '#6b7280' }}>
          Applied provinces/cities:{' '}
          {region.province_codes.map((c) => provinceMap[c] || c).join(', ')}
        </p>
        <button type="button" className="button" onClick={onDone}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="notice notice-info inline" style={{ margin: '0 0 16px' }}>
        <p>
          This rate will apply to <strong>all {region.province_codes.length} provinces/cities</strong> in region{' '}
          <strong>{region.region_name}</strong> as province-level rules. Existing province rules will be updated.
        </p>
      </div>
      <RateForm
        rate={null}
        locationType="province"
        locationCode=""
        locationName={`All of ${region.region_name}`}
        onSave={handleSave}
        onCancel={onDone}
        isSaving={isPending}
      />
    </div>
  );
};

// ---- Tab: By Region --------------------------------------------------------- //

interface ByRegionTabProps {
  provinces: Province[];
}

const ByRegionTab: React.FC<ByRegionTabProps> = ({ provinces }) => {
  const { data: regions = [], isLoading: loadingRegions } = useRegions();

  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showBulkApply, setShowBulkApply]   = useState(false);
  const [editingRate, setEditingRate]       = useState<ShippingRate | null>(null);
  const [showRateForm, setShowRateForm]     = useState(false);

  const { data: rates = [], isLoading: loadingRates, refetch: refetchRates } = useShippingRates(
    selectedRegion ? 'region' : undefined,
    selectedRegion?.region_code
  );
  const { mutate: saveRate,   isPending: isSaving }   = useSaveShippingRate();
  const { mutate: deleteRate, isPending: isDeleting } = useDeleteShippingRate();

  const handleSaveRate = (rateData: Partial<ShippingRate>) => {
    saveRate(rateData, {
      onSuccess: () => {
        setShowRateForm(false);
        setEditingRate(null);
        refetchRates();
      },
    });
  };

  return (
    <div>
      {/* Region selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 600, marginRight: '8px' }}>Select region:</label>
        <select
          value={selectedRegion?.region_code || ''}
          onChange={(e) => {
            const r = regions.find((reg) => reg.region_code === e.target.value) || null;
            setSelectedRegion(r);
            setShowBulkApply(false);
            setShowRateForm(false);
            setEditingRate(null);
          }}
          style={{ minWidth: '220px' }}
          disabled={loadingRegions}
        >
          <option value="">— Select region —</option>
          {regions.map((r) => (
            <option key={r.region_code} value={r.region_code}>
              {r.region_name}
              {r.is_predefined ? '' : ' (custom)'}
            </option>
          ))}
        </select>
        {loadingRegions && <span style={{ marginLeft: '8px', color: '#6b7280' }}>Loading...</span>}
      </div>

      {!selectedRegion && (
        <div className="notice notice-info inline">
          <p>Select a region to view and manage region shipping rates.</p>
        </div>
      )}

      {selectedRegion && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="button button-primary"
              onClick={() => { setEditingRate(null); setShowRateForm(true); setShowBulkApply(false); }}
            >
              + Add rate for this region
            </button>
            <button
              type="button"
              className="button"
              onClick={() => { setShowBulkApply(true); setShowRateForm(false); }}
              style={{ background: '#2271b1', color: '#fff', borderColor: '#2271b1' }}
            >
              ⚡ Bulk apply to provinces/cities
            </button>
          </div>

          {showBulkApply && (
            <BulkApplyPanel
              region={selectedRegion}
              provinces={provinces}
              onDone={() => setShowBulkApply(false)}
            />
          )}

          {showRateForm && !showBulkApply && (
            <RateForm
              rate={editingRate}
              locationType="region"
              locationCode={selectedRegion.region_code}
              locationName={selectedRegion.region_name}
              onSave={handleSaveRate}
              onCancel={() => { setShowRateForm(false); setEditingRate(null); }}
              isSaving={isSaving}
            />
          )}

          <RateTable
            rates={rates}
            isLoading={loadingRates}
            onEdit={(r) => { setEditingRate(r); setShowRateForm(true); setShowBulkApply(false); }}
            onDelete={(id) => {
              if (confirm('Delete this shipping rate?')) {
                deleteRate(id, { onSuccess: () => refetchRates() });
              }
            }}
            isDeleting={isDeleting}
          />
        </>
      )}
    </div>
  );
};

// ---- Tab: By Location ------------------------------------------------------- //

interface ByLocationTabProps {
  provinces: Province[];
}

const ByLocationTab: React.FC<ByLocationTabProps> = ({ provinces }) => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard,     setSelectedWard]     = useState('');
  const [editingRate, setEditingRate]           = useState<ShippingRate | null>(null);
  const [showForm, setShowForm]                 = useState(false);

  const locationType: LocationType | undefined = selectedWard
    ? 'ward'
    : selectedDistrict
    ? 'district'
    : selectedProvince
    ? 'province'
    : undefined;

  const locationCode = selectedWard || selectedDistrict || selectedProvince || undefined;

  const { data: rates = [], isLoading, refetch } = useShippingRates(locationType, locationCode);
  const { mutate: saveRate,   isPending: isSaving }   = useSaveShippingRate();
  const { mutate: deleteRate, isPending: isDeleting } = useDeleteShippingRate();

  const handleSave = (rateData: Partial<ShippingRate>) => {
    saveRate(rateData, {
      onSuccess: () => {
        setShowForm(false);
        setEditingRate(null);
        refetch();
      },
    });
  };

  return (
    <div>
      <LocationDrillDown
        provinces={provinces}
        selectedProvince={selectedProvince}
        selectedDistrict={selectedDistrict}
        selectedWard={selectedWard}
        onProvinceChange={(v) => { setSelectedProvince(v); setSelectedDistrict(''); setSelectedWard(''); }}
        onDistrictChange={(v) => { setSelectedDistrict(v); setSelectedWard(''); }}
        onWardChange={setSelectedWard}
      />

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="button button-primary"
          onClick={() => { setEditingRate(null); setShowForm(true); }}
          disabled={!locationCode}
        >
          + Add shipping rate
        </button>
        <CSVImportExport onImportComplete={refetch} />
      </div>

      {showForm && (
        <RateForm
          rate={editingRate}
          locationType={locationType!}
          locationCode={locationCode!}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingRate(null); }}
          isSaving={isSaving}
        />
      )}

      {locationCode ? (
        <RateTable
          rates={rates}
          isLoading={isLoading}
          onEdit={(r) => { setEditingRate(r); setShowForm(true); }}
          onDelete={(id) => {
            if (confirm('Delete this shipping rate?')) {
              deleteRate(id, { onSuccess: () => refetch() });
            }
          }}
          isDeleting={isDeleting}
        />
      ) : (
        <div className="notice notice-info inline" style={{ marginTop: '12px' }}>
          <p>Please select a location to view and manage shipping rates.</p>
        </div>
      )}
    </div>
  );
};

// ---- Main component --------------------------------------------------------- //

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 20px',
  border: 'none',
  borderBottom: active ? '3px solid #2271b1' : '3px solid transparent',
  background: 'none',
  cursor: 'pointer',
  fontWeight: active ? 600 : 400,
  color: active ? '#2271b1' : '#1d2327',
  fontSize: '14px',
  transition: 'all 0.15s',
});

export const ShippingRateManager: React.FC<ShippingRateManagerProps> = ({ provinces }) => {
  const [tab, setTab] = useState<Tab>('by_location');

  return (
    <div className="wrap">
      <h1>Shipping rate management</h1>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #c3c4c7',
          marginBottom: '24px',
          gap: 0,
        }}
      >
        <button style={tabStyle(tab === 'by_location')} onClick={() => setTab('by_location')}>
          By location
        </button>
        <button style={tabStyle(tab === 'by_region')} onClick={() => setTab('by_region')}>
          By region
        </button>
        <button style={tabStyle(tab === 'manage_regions')} onClick={() => setTab('manage_regions')}>
          Manage regions
        </button>
      </div>

      {tab === 'by_location'    && <ByLocationTab provinces={provinces} />}
      {tab === 'by_region'      && <ByRegionTab   provinces={provinces} />}
      {tab === 'manage_regions' && <RegionManager  provinces={provinces} />}
    </div>
  );
};
