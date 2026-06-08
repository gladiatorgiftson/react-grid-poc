import { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeAlpine } from 'ag-grid-community';
import type { CellValueChangedEvent, SelectionChangedEvent } from 'ag-grid-community';
import type { Item } from '../../types';
import { buildColumnDefs } from './columnDefs';
import { GridToolbar } from './GridToolbar';
import { GridFooter } from './GridFooter';
import { SearchFilter } from './SearchFilter';

ModuleRegistry.registerModules([AllCommunityModule]);

const gridTheme = themeAlpine.withParams({
  accentColor: '#1976D2',
  headerBackgroundColor: '#F1F5F9',
  headerTextColor: '#374151',
  rowHeight: 44,
  headerHeight: 44,
  fontSize: 15,
  fontFamily: 'Inter, system-ui, sans-serif',
  borderColor: '#E2E8F0',
  cellHorizontalPaddingScale: 0.9,
});

let _idCounter = 100;
const genId = () => String(++_idCounter);

const BLANK_ROW: Omit<Item, 'id'> = {
  upcGtin: '', sku: '', internalPartNum: '',
  brand: '', modelNum: '', productName: '', category: 'Accessories',
  color: 'Black', packageType: 'Retail Box',
  vendorName: 'Vendor A', vendorPartNum: '',
  gtsCode: '', eccn: 'EAR99', country: 'China', hazmat: 'N',
  uom: 'EA', weight: 0, moq: 1, leadTimeDays: 30,
  qty: 1, costPrice: 0, listPrice: 0, mapPrice: 0, dutyRate: 0,
  warrantyMonths: 12, status: 'incomplete',
};

interface ItemGridProps {
  rows: Item[];
  onRowsChange: (rows: Item[]) => void;
}

export function ItemGrid({ rows, onRowsChange }: ItemGridProps) {
  const gridRef = useRef<AgGridReact<Item>>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [frozenCols, setFrozenCols] = useState(0);
  const [frozenRows, setFrozenRows] = useState(0);
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const columnDefs = useMemo(
    () => buildColumnDefs(hiddenCols, frozenCols, frozenRows),
    [hiddenCols, frozenCols, frozenRows],
  );

  const filteredRows = useMemo(() => {
    if (!filterField || !filterValue) return rows;
    return rows.filter((r) =>
      String(r[filterField as keyof Item] ?? '')
        .toLowerCase()
        .includes(filterValue.toLowerCase()),
    );
  }, [rows, filterField, filterValue]);

  const pinnedTopRowData = useMemo(
    () => (frozenRows > 0 ? filteredRows.slice(0, frozenRows) : undefined),
    [filteredRows, frozenRows],
  );

  const mainRowData = useMemo(
    () => (frozenRows > 0 ? filteredRows.slice(frozenRows) : filteredRows),
    [filteredRows, frozenRows],
  );

  const defaultColDef = useMemo(
    () => ({ resizable: true, sortable: true, suppressHeaderMenuButton: false }),
    [],
  );

  const handleCellValueChanged = useCallback((e: CellValueChangedEvent<Item>) => {
    onRowsChange(rows.map((r) => (r.id === e.data.id ? { ...e.data } : r)));
  }, [rows, onRowsChange]);

  const handleSelectionChanged = useCallback((e: SelectionChangedEvent<Item>) => {
    const ids = new Set(e.api.getSelectedRows().map((r) => r.id));
    setSelectedIds(ids);
  }, []);

  const addRow = useCallback(() => {
    const blank: Item = { id: genId(), ...BLANK_ROW };
    onRowsChange([...rows, blank]);
    setTimeout(() => {
      gridRef.current?.api?.ensureIndexVisible(rows.length, 'bottom');
    }, 50);
  }, [rows, onRowsChange]);

  const duplicateSelected = useCallback(() => {
    const dupes = rows
      .filter((r) => selectedIds.has(r.id))
      .map((r) => ({ ...r, id: genId() }));
    onRowsChange([...rows, ...dupes]);
  }, [rows, selectedIds, onRowsChange]);

  const deleteSelected = useCallback(() => {
    onRowsChange(rows.filter((r) => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  }, [rows, selectedIds, onRowsChange]);

  const exportCsv = useCallback(() => {
    gridRef.current?.api?.exportDataAsCsv({ fileName: 'items.csv' });
  }, []);

  const importCsv = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = () => { /* parse & merge – omitted for POC */ };
    input.click();
  }, []);

  const toggleColumn = useCallback((field: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      next.has(field) ? next.delete(field) : next.add(field);
      return next;
    });
  }, []);

  const handleFilter = useCallback((field: string, value: string) => {
    setFilterField(field);
    setFilterValue(value);
  }, []);

  const handleAddRecord = useCallback((field: string, value: string) => {
    const newRow: Item = { id: genId(), ...BLANK_ROW, [field]: value };
    onRowsChange([...rows, newRow]);
    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRow),
    }).catch(() => {});
    setTimeout(() => {
      gridRef.current?.api?.ensureIndexVisible(rows.length, 'bottom');
    }, 50);
  }, [rows, onRowsChange]);

  return (
    <section className="item-grid-section">
      <GridToolbar
        selectedCount={selectedIds.size}
        hiddenCols={hiddenCols}
        frozenCols={frozenCols}
        frozenRows={frozenRows}
        onAddRow={addRow}
        onDuplicate={duplicateSelected}
        onDeleteSelected={deleteSelected}
        onImport={importCsv}
        onExport={exportCsv}
        onToggleColumn={toggleColumn}
        onSetFrozenCols={setFrozenCols}
        onSetFrozenRows={setFrozenRows}
      />

      <SearchFilter onFilter={handleFilter} onAddRecord={handleAddRecord} />

      <div className="item-grid-wrap">
        <AgGridReact<Item>
          ref={gridRef}
          theme={gridTheme}
          columnDefs={columnDefs}
          rowData={mainRowData}
          pinnedTopRowData={pinnedTopRowData}
          defaultColDef={defaultColDef}
          rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true, enableClickSelection: false }}
          cellSelection={true}
          onCellValueChanged={handleCellValueChanged}
          onSelectionChanged={handleSelectionChanged}
          domLayout="autoHeight"
          animateRows={false}
          stopEditingWhenCellsLoseFocus
          getRowId={(p) => p.data.id}
        />
      </div>

      <GridFooter rows={filteredRows} />
    </section>
  );
}
