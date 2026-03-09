import React, { useRef, useState } from 'react';
import { useImportRatesCSV } from '@/hooks/useShippingRates';
import { exportRatesCSV } from '@/api/shippingApi';

interface CSVImportExportProps {
  onImportComplete?: () => void;
}

export const CSVImportExport: React.FC<CSVImportExportProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);

  const { mutate: importCSV } = useImportRatesCSV();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    importCSV(file, {
      onSuccess: (result) => {
        setImportResult(result);
        setImporting(false);
        onImportComplete?.();

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (error: any) => {
        alert(error.message || 'Failed to import CSV');
        setImporting(false);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  const handleExportClick = async () => {
    setExporting(true);
    try {
      await exportRatesCSV();
    } catch (error: any) {
      alert(error.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="coolbirdzik-csv-actions" style={{ display: 'inline-block', marginLeft: '10px' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        className="button"
        onClick={handleImportClick}
        disabled={importing}
      >
        {importing ? 'Importing...' : '📤 Import CSV'}
      </button>{' '}

      <button
        type="button"
        className="button"
        onClick={handleExportClick}
        disabled={exporting}
      >
        {exporting ? 'Exporting...' : '📥 Export CSV'}
      </button>

      {importResult && (
        <div className="notice notice-success" style={{ marginTop: '10px' }}>
          <p>
            <strong>Import results:</strong>
            <br />
            Succeeded: {importResult.success} rows
            <br />
            Failed: {importResult.failed} rows
          </p>
          {importResult.errors.length > 0 && (
            <div>
              <strong>Errors:</strong>
              <ul>
                {importResult.errors.map((error, idx) => (
                  <li key={idx}>
                    Row {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
