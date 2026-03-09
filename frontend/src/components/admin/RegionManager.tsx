import React, { useState } from 'react';
import { useRegions, useSaveRegion, useDeleteRegion } from '@/hooks/useRegions';
import type { Province } from '@/types/address.types';
import type { Region } from '@/types/shipping.types';

interface RegionManagerProps {
  provinces: Province[];
}

// ---- Region Form (create / edit) ------------------------------------------ //

interface RegionFormProps {
  region: Partial<Region> | null;
  provinces: Province[];
  onSave: (data: Partial<Region>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const RegionForm: React.FC<RegionFormProps> = ({
  region,
  provinces,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [name, setName]             = useState(region?.region_name || '');
  const [code, setCode]             = useState(region?.region_code || '');
  const [selected, setSelected]     = useState<string[]>(region?.province_codes || []);

  const toggleProvince = (pCode: string) => {
    setSelected((prev) =>
      prev.includes(pCode) ? prev.filter((c) => c !== pCode) : [...prev, pCode]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: region?.id,
      region_name: name,
      region_code: code,
      province_codes: selected,
    });
  };

  const isEdit = !!region?.id;

  return (
    <div className="coolbirdzik-region-form" style={{ margin: '20px 0', padding: '16px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3 style={{ marginTop: 0 }}>{isEdit ? 'Edit region' : 'Add new region'}</h3>
      <form onSubmit={handleSubmit}>
        <table className="form-table" style={{ marginBottom: '12px' }}>
          <tbody>
            <tr>
              <th style={{ width: '140px' }}><label>Region name</label></th>
              <td>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '300px' }}
                  placeholder="e.g. Northern Vietnam"
                />
              </td>
            </tr>
            <tr>
              <th><label>Region code</label></th>
              <td>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                  required
                  disabled={isEdit}
                  style={{ width: '200px', fontFamily: 'monospace' }}
                  placeholder="VD: mien_bac"
                />
                {!isEdit && (
                  <p className="description" style={{ margin: '4px 0 0' }}>
                    Use lowercase letters, numbers, and underscores only.
                  </p>
                )}
              </td>
            </tr>
            <tr>
              <th style={{ verticalAlign: 'top', paddingTop: '8px' }}>
                <label>Province/City</label>
                <p className="description" style={{ fontWeight: 'normal', marginTop: '4px' }}>
                  {selected.length} selected
                </p>
              </th>
              <td>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '6px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  background: '#fff',
                }}>
                  {provinces.map((p) => (
                    <label
                      key={p.code}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(p.code)}
                        onChange={() => toggleProvince(p.code)}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="button button-small"
                    onClick={() => setSelected(provinces.map((p) => p.code))}
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    className="button button-small"
                    onClick={() => setSelected([])}
                  >
                    Clear all
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" className="button button-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save region'}
          </button>
          <button type="button" className="button" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// ---- Main RegionManager ---------------------------------------------------- //

export const RegionManager: React.FC<RegionManagerProps> = ({ provinces }) => {
  const { data: regions = [], isLoading, refetch } = useRegions();
  const { mutate: saveRegion, isPending: isSaving }     = useSaveRegion();
  const { mutate: deleteRegion, isPending: isDeleting } = useDeleteRegion();

  const [showForm, setShowForm]       = useState(false);
  const [editingRegion, setEditing]   = useState<Partial<Region> | null>(null);
  const [expanded, setExpanded]       = useState<Set<string>>(new Set());

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (region: Region) => {
    setEditing(region);
    setShowForm(true);
  };

  const handleDelete = (region: Region) => {
    if (!confirm(`Delete region "${region.region_name}"? This action cannot be undone.`)) return;
    deleteRegion(region.id!, { onSuccess: () => refetch() });
  };

  const handleSave = (data: Partial<Region>) => {
    saveRegion(data, {
      onSuccess: () => {
        setShowForm(false);
        setEditing(null);
        refetch();
      },
    });
  };

  const toggleExpand = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const provinceMap = React.useMemo(() => {
    const m: Record<string, string> = {};
    provinces.forEach((p) => (m[p.code] = p.name));
    return m;
  }, [provinces]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p className="description" style={{ margin: 0 }}>
          Group provinces/cities into regions to apply shared shipping rates.
          Predefined regions (Northern Vietnam, Central Vietnam, Southern Vietnam) are view-only.
        </p>
        <button type="button" className="button button-primary" onClick={handleAdd}>
          + Add new region
        </button>
      </div>

      {showForm && (
        <RegionForm
          region={editingRegion}
          provinces={provinces}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          isSaving={isSaving}
        />
      )}

      {isLoading && <p>Loading...</p>}

      {!isLoading && regions.length === 0 && (
        <div className="notice notice-info"><p>No regions yet.</p></div>
      )}

      {!isLoading && regions.length > 0 && (
        <table className="wp-list-table widefat fixed striped" style={{ marginTop: '8px' }}>
          <thead>
            <tr>
              <th style={{ width: '200px' }}>Region name</th>
              <th style={{ width: '140px', fontFamily: 'monospace' }}>Region code</th>
              <th>Province/City</th>
              <th style={{ width: '120px' }}>Type</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => {
              const isOpen = expanded.has(region.region_code);
              return (
                <tr key={region.region_code}>
                  <td><strong>{region.region_name}</strong></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{region.region_code}</td>
                  <td>
                    <button
                      type="button"
                      className="button button-small"
                      onClick={() => toggleExpand(region.region_code)}
                      style={{ marginBottom: isOpen ? '8px' : 0 }}
                    >
                      {isOpen ? '▲ Hide' : `▼ ${region.province_codes.length} provinces/cities`}
                    </button>
                    {isOpen && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        maxWidth: '500px',
                      }}>
                        {region.province_codes.map((code) => (
                          <span
                            key={code}
                            style={{
                              background: '#e5e7eb',
                              borderRadius: '12px',
                              padding: '2px 8px',
                              fontSize: '12px',
                            }}
                          >
                            {provinceMap[code] || code}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {region.is_predefined ? (
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Predefined</span>
                    ) : (
                      <span style={{ color: '#16a34a', fontSize: '12px' }}>Custom</span>
                    )}
                  </td>
                  <td>
                    {!region.is_predefined && (
                      <>
                        <button
                          type="button"
                          className="button button-small"
                          onClick={() => handleEdit(region)}
                          disabled={isDeleting}
                          style={{ marginRight: '4px' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button button-small button-link-delete"
                          onClick={() => handleDelete(region)}
                          disabled={isDeleting}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {region.is_predefined && (
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
