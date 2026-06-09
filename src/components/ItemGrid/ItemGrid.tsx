import { useCallback, useMemo, useState } from 'react';
import type { Item } from '../../types';
import { DATA_COLUMNS } from './columns';
import { GridToolbar } from './GridToolbar';
import { GridFooter } from './GridFooter';
import { SearchFilter } from './SearchFilter';
import { DataGrid } from './DataGrid';

let _id = 100;
const genId = () => String(++_id);

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

interface Props {
  rows: Item[];
  onRowsChange: (rows: Item[]) => void;
}

export function ItemGrid({ rows, onRowsChange }: Props) {
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [hiddenCols,   setHiddenCols]   = useState<Set<string>>(new Set());
  const [frozenCols,   setFrozenCols]   = useState(0);
  const [frozenRows,   setFrozenRows]   = useState(0);
  const [filterField,  setFilterField]  = useState('');
  const [filterValue,  setFilterValue]  = useState('');
  const [columnOrder,  setColumnOrder]  = useState<string[]>(() =>
    ['__num', ...DATA_COLUMNS.map(c => c.id as string)],
  );

  const filteredRows = useMemo(() => {
    if (!filterField || !filterValue) return rows;
    return rows.filter(r =>
      String(r[filterField as keyof Item] ?? '')
        .toLowerCase()
        .includes(filterValue.toLowerCase()),
    );
  }, [rows, filterField, filterValue]);

  const addRow = useCallback(() => {
    onRowsChange([...rows, { id: genId(), ...BLANK_ROW }]);
  }, [rows, onRowsChange]);

  const duplicateSelected = useCallback(() => {
    const dupes = rows
      .filter(r => selectedIds.has(r.id))
      .map(r => ({ ...r, id: genId() }));
    onRowsChange([...rows, ...dupes]);
  }, [rows, selectedIds, onRowsChange]);

  const deleteSelected = useCallback(() => {
    onRowsChange(rows.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  }, [rows, selectedIds, onRowsChange]);

  const exportCsv = useCallback(() => {
    const headers = Object.keys(rows[0] ?? {}).join(',');
    const body = rows.map(r => Object.values(r).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + body], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'items.csv';
    a.click();
  }, [rows]);

  const importCsv = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = () => { /* parse & merge – omitted for POC */ };
    input.click();
  }, []);

  const toggleColumn = useCallback((field: string) => {
    setHiddenCols(prev => {
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
  }, [rows, onRowsChange]);

  const handleCellChange = useCallback((rowId: string, field: string, value: unknown) => {
    onRowsChange(rows.map(r => r.id === rowId ? { ...r, [field]: value } : r));
  }, [rows, onRowsChange]);

  const handleBatchChange = useCallback((changes: Array<{ rowId: string; field: string; value: unknown }>) => {
    const map = new Map<string, Record<string, unknown>>();
    changes.forEach(({ rowId, field, value }) => {
      if (!map.has(rowId)) map.set(rowId, {});
      map.get(rowId)![field] = value;
    });
    onRowsChange(rows.map(r => {
      const patch = map.get(r.id);
      return patch ? { ...r, ...patch } : r;
    }));
  }, [rows, onRowsChange]);

  return (
    <section className="item-grid-section">
      <GridToolbar
        selectedCount={selectedIds.size}
        hiddenCols={hiddenCols}
        frozenCols={frozenCols}
        frozenRows={frozenRows}
        columnOrder={columnOrder}
        onAddRow={addRow}
        onDuplicate={duplicateSelected}
        onDeleteSelected={deleteSelected}
        onImport={importCsv}
        onExport={exportCsv}
        onToggleColumn={toggleColumn}
        onSetFrozenCols={setFrozenCols}
        onSetFrozenRows={setFrozenRows}
        onColumnOrderChange={setColumnOrder}
      />

      <SearchFilter onFilter={handleFilter} onAddRecord={handleAddRecord} />

      <DataGrid
        rows={filteredRows}
        frozenRows={frozenRows}
        hiddenCols={hiddenCols}
        frozenCols={frozenCols}
        columnOrder={columnOrder}
        onSetFrozenCols={setFrozenCols}
        onColumnOrderChange={setColumnOrder}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onCellChange={handleCellChange}
        onBatchChange={handleBatchChange}
      />

      <GridFooter rows={filteredRows} />
    </section>
  );
}
