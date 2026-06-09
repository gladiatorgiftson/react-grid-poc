import { useCallback, useMemo, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type FilterFn,
  type SortingState,
  type ColumnSizingState,
  type VisibilityState,
  type ColumnFiltersState,
  type ColumnOrderState,
} from '@tanstack/react-table';
import type { Item } from '../../types';
import { DATA_COLUMNS, type ColMeta } from './columns';
import { CellEditor } from './CellEditor';
import { ColumnFilterDropdown } from './ColumnFilterDropdown';

// ── Inline icons ──────────────────────────────────────────────────────────────
function FunnelIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M1.5 1.5H10.5L8 5.5V10.5H4V5.5Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg width="11" height="12" viewBox="0 0 12 13" fill="none" aria-hidden="true">
      <rect
        x="2" y="6" width="8" height="6.5" rx="1.5"
        fill={locked ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.4"
      />
      <path
        d="M4 6V4.5A2 2 0 018 4.5V6"
        stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface CellPos { row: number; col: number }

interface Props {
  rows: Item[];
  frozenRows: number;
  hiddenCols: Set<string>;
  frozenCols: number;
  columnOrder: ColumnOrderState;
  onSetFrozenCols: (n: number) => void;
  onColumnOrderChange: (updater: ColumnOrderState | ((prev: ColumnOrderState) => ColumnOrderState)) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onCellChange: (rowId: string, field: string, value: unknown) => void;
  onBatchChange: (changes: Array<{ rowId: string; field: string; value: unknown }>) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const HEADER_H = 44;
const ROW_H    = 44;
const ROWNUM_W = 56;

const STATUS_COLOR: Record<string, string> = {
  error:      '#EF4444',
  incomplete: '#F97316',
  valid:      'transparent',
};

const ROW_NUM_COL: ColumnDef<Item, unknown> = {
  id: '__num',
  header: '#',
  cell: () => null,
  size: ROWNUM_W,
  minSize: ROWNUM_W,
  maxSize: ROWNUM_W,
  enableResizing: false,
  enableSorting:  false,
  meta: { editable: false, editorType: 'text' } as ColMeta,
};

// Filter fn: cell value must be in the selected values array
const inSetFilter: FilterFn<Item> = (row, columnId, value: string[]) => {
  if (!Array.isArray(value) || value.length === 0) return true;
  return value.includes(String(row.getValue(columnId) ?? ''));
};
inSetFilter.autoRemove = (val: unknown) =>
  !val || (Array.isArray(val) && val.length === 0);

// ── Component ─────────────────────────────────────────────────────────────────
export function DataGrid({
  rows, frozenRows, hiddenCols, frozenCols, columnOrder, onSetFrozenCols, onColumnOrderChange,
  selectedIds, onSelectionChange, onCellChange, onBatchChange,
}: Props) {
  const [sorting,       setSorting]       = useState<SortingState>([]);
  const [colSizing,     setColSizing]     = useState<ColumnSizingState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selAnchor, setSelAnchor] = useState<CellPos | null>(null);
  const [selFocus,  setSelFocus]  = useState<CellPos | null>(null);
  const [editCell,  setEditCell]  = useState<CellPos | null>(null);

  const [openFilterCol,    setOpenFilterCol]    = useState<string | null>(null);
  const [filterAnchorRect, setFilterAnchorRect] = useState<DOMRect | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);

  const columnVisibility = useMemo<VisibilityState>(() => {
    const v: VisibilityState = {};
    hiddenCols.forEach(id => { v[id] = false; });
    return v;
  }, [hiddenCols]);

  const columns = useMemo(() => [ROW_NUM_COL, ...DATA_COLUMNS], []);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnSizing: colSizing, columnVisibility, columnFilters, columnOrder },
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    onSortingChange:       setSorting,
    onColumnSizingChange:  setColSizing,
    onColumnFiltersChange: setColumnFilters,
    onColumnOrderChange:   onColumnOrderChange,
    columnResizeMode:      'onChange',
    enableColumnResizing:  true,
    getRowId: r => r.id,
    defaultColumn: { filterFn: inSetFilter },
  });

  const visibleCols = table.getVisibleLeafColumns();
  const tableRows   = table.getRowModel().rows;

  // Unique sorted values per column (from original rows, so filter dropdowns
  // always show all possible values regardless of active filters)
  const colUniqueValues = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const colDef of DATA_COLUMNS) {
      const id = colDef.id as string;
      const vals = new Set<string>();
      for (const row of rows) {
        vals.add(String(row[id as keyof Item] ?? ''));
      }
      map.set(id, Array.from(vals).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ));
    }
    return map;
  }, [rows]);

  // Sticky left offsets — based on visual position, not original column order.
  // This means freeze works correctly after column reordering.
  const stickyLeft = useMemo(() => {
    const map = new Map<string, number>();
    map.set('__num', 0);
    let acc = ROWNUM_W;
    for (let i = 1; i < visibleCols.length; i++) {
      if (i <= frozenCols) {
        map.set(visibleCols[i].id, acc);
        acc += visibleCols[i].getSize();
      }
    }
    return map;
  }, [visibleCols, frozenCols]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  function inRange(r: number, c: number): boolean {
    if (!selAnchor || !selFocus) return false;
    const r0 = Math.min(selAnchor.row, selFocus.row);
    const r1 = Math.max(selAnchor.row, selFocus.row);
    const c0 = Math.min(selAnchor.col, selFocus.col);
    const c1 = Math.max(selAnchor.col, selFocus.col);
    return r >= r0 && r <= r1 && c >= c0 && c <= c1;
  }

  const isFocused = (r: number, c: number) =>
    selFocus?.row === r && selFocus?.col === c;

  // ── Column reorder ─────────────────────────────────────────────────────────
  function moveColLeft(colId: string) {
    onColumnOrderChange(prev => {
      const idx = prev.indexOf(colId);
      if (idx <= 1) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
    setOpenFilterCol(null);
    setFilterAnchorRect(null);
  }

  function moveColRight(colId: string) {
    onColumnOrderChange(prev => {
      const idx = prev.indexOf(colId);
      if (idx <= 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
    setOpenFilterCol(null);
    setFilterAnchorRect(null);
  }

  // ── Copy/paste ─────────────────────────────────────────────────────────────
  const copySelection = useCallback(() => {
    if (!selAnchor || !selFocus) return;
    const r0 = Math.min(selAnchor.row, selFocus.row);
    const r1 = Math.max(selAnchor.row, selFocus.row);
    const c0 = Math.min(selAnchor.col, selFocus.col);
    const c1 = Math.max(selAnchor.col, selFocus.col);
    const lines: string[] = [];
    for (let r = r0; r <= r1; r++) {
      const row = tableRows[r];
      if (!row) continue;
      const cells: string[] = [];
      for (let c = c0; c <= c1; c++) {
        const vc = visibleCols[c];
        if (!vc || vc.id === '__num') continue;
        cells.push(String(row.getValue(vc.id) ?? ''));
      }
      if (cells.length) lines.push(cells.join('\t'));
    }
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
  }, [selAnchor, selFocus, tableRows, visibleCols]);

  const pasteSelection = useCallback(async () => {
    if (!selAnchor) return;
    let text: string;
    try { text = await navigator.clipboard.readText(); }
    catch { return; }
    if (!text.trim()) return;
    const pastedRows = text.trimEnd().split('\n');
    const startRow = selAnchor.row;
    const startCol = Math.max(1, selAnchor.col);
    const changes: Array<{ rowId: string; field: string; value: unknown }> = [];
    pastedRows.forEach((pastedRow, ri) => {
      const row = tableRows[startRow + ri];
      if (!row) return;
      const vals = pastedRow.split('\t');
      let vi = 0;
      for (let c = startCol; c < visibleCols.length && vi < vals.length; c++) {
        const vc = visibleCols[c];
        if (vc.id === '__num') continue;
        const colMeta = vc.columnDef.meta as ColMeta | undefined;
        const raw = vals[vi++].trim();
        const cleaned = raw.replace(/[$,%\s]/g, '');
        const val = colMeta?.editorType === 'number'
          ? (cleaned !== '' && !isNaN(Number(cleaned)) ? Number(cleaned) : 0)
          : raw;
        changes.push({ rowId: row.id, field: vc.id, value: val });
      }
    });
    if (changes.length) onBatchChange(changes);
  }, [selAnchor, tableRows, visibleCols, onBatchChange]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const moveFocus = useCallback((dr: number, dc: number, extend: boolean) => {
    const base = selFocus ?? { row: 0, col: 0 };
    const next: CellPos = {
      row: Math.max(0, Math.min(tableRows.length - 1, base.row + dr)),
      col: Math.max(1, Math.min(visibleCols.length - 1, base.col + dc)),
    };
    if (extend) { setSelFocus(next); }
    else { setSelAnchor(next); setSelFocus(next); setEditCell(null); }
    requestAnimationFrame(() => {
      wrapRef.current
        ?.querySelector<HTMLElement>(`[data-cell="${next.row}-${next.col}"]`)
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }, [selFocus, tableRows.length, visibleCols.length]);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selFocus) return;
    if (editCell) {
      if (e.key === 'Escape') { e.preventDefault(); setEditCell(null); }
      return;
    }
    const meta = visibleCols[selFocus.col]?.columnDef.meta as ColMeta | undefined;
    const shift = e.shiftKey;
    switch (e.key) {
      case 'ArrowUp':    e.preventDefault(); moveFocus(-1,  0, shift); break;
      case 'ArrowDown':  e.preventDefault(); moveFocus( 1,  0, shift); break;
      case 'ArrowLeft':  e.preventDefault(); moveFocus( 0, -1, shift); break;
      case 'ArrowRight': e.preventDefault(); moveFocus( 0,  1, shift); break;
      case 'Tab':        e.preventDefault(); moveFocus(0, shift ? -1 : 1, false); break;
      case 'Enter': case 'F2':
        e.preventDefault();
        if (meta?.editable) setEditCell({ ...selFocus });
        break;
      case 'a': case 'A':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setSelAnchor({ row: 0, col: 0 });
          setSelFocus({ row: tableRows.length - 1, col: visibleCols.length - 1 });
        }
        break;
      case 'c': case 'C':
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) { e.preventDefault(); copySelection(); }
        break;
      case 'v': case 'V':
        if (e.ctrlKey || e.metaKey) { e.preventDefault(); pasteSelection(); }
        break;
    }
  }, [selFocus, editCell, visibleCols, moveFocus, tableRows.length, copySelection, pasteSelection]);

  // ── Mouse ──────────────────────────────────────────────────────────────────
  const handleCellDown = useCallback((e: React.MouseEvent, r: number, c: number, colId: string) => {
    if (colId === '__num') return;
    if (e.shiftKey && selAnchor) {
      setSelFocus({ row: r, col: c });
    } else {
      const alreadyFocused = !editCell && selFocus?.row === r && selFocus?.col === c;
      setSelAnchor({ row: r, col: c });
      setSelFocus({ row: r, col: c });
      if (editCell && (editCell.row !== r || editCell.col !== c)) setEditCell(null);
      if (alreadyFocused) {
        const colMeta = visibleCols[c]?.columnDef.meta as ColMeta | undefined;
        if (colMeta?.editable) setEditCell({ row: r, col: c });
      }
    }
    wrapRef.current?.focus();
    e.preventDefault();
  }, [selAnchor, selFocus, editCell, visibleCols]);

  const handleCellDblClick = useCallback((r: number, c: number) => {
    const meta = visibleCols[c]?.columnDef.meta as ColMeta | undefined;
    if (meta?.editable) {
      setSelAnchor({ row: r, col: c });
      setSelFocus({ row: r, col: c });
      setEditCell({ row: r, col: c });
    }
  }, [visibleCols]);

  const handleRowNumDown = useCallback((e: React.MouseEvent, rowId: string, rowIdx: number) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (e.shiftKey) {
      const ids = tableRows.map(r => r.id);
      const lastSelected = ids.findLastIndex(id => next.has(id));
      if (lastSelected >= 0) {
        const lo = Math.min(lastSelected, rowIdx);
        const hi = Math.max(lastSelected, rowIdx);
        for (let i = lo; i <= hi; i++) next.add(ids[i]);
      } else { next.add(rowId); }
    } else {
      next.has(rowId) ? next.delete(rowId) : next.add(rowId);
    }
    onSelectionChange(next);
  }, [selectedIds, tableRows, onSelectionChange]);

  function handleFilterBtnClick(e: React.MouseEvent, colId: string) {
    e.stopPropagation();
    if (openFilterCol === colId) {
      setOpenFilterCol(null); setFilterAnchorRect(null);
    } else {
      setOpenFilterCol(colId);
      setFilterAnchorRect((e.currentTarget as HTMLElement).getBoundingClientRect());
    }
  }

  // Pin click: freeze up to this column's visual index; click again → unfreeze
  function handlePinClick(e: React.MouseEvent, visualIdx: number) {
    e.stopPropagation();
    onSetFrozenCols(frozenCols === visualIdx ? 0 : visualIdx);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const tableWidth = useMemo(
    () => visibleCols.reduce((s, c) => s + c.getSize(), 0),
    [visibleCols],
  );

  return (
    <div
      ref={wrapRef}
      className="dg-wrap"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseDown={e => {
        if (e.target === wrapRef.current) { setSelAnchor(null); setSelFocus(null); }
      }}
    >
      <table className="dg" style={{ width: tableWidth, minWidth: tableWidth }}>
        <colgroup>
          {visibleCols.map(vc => <col key={vc.id} style={{ width: vc.getSize() }} />)}
        </colgroup>

        <thead className="dg__head">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map((header, ci) => {
                const left         = stickyLeft.get(header.column.id);
                const isSticky     = left !== undefined;
                const canSort      = header.column.getCanSort();
                const sorted       = header.column.getIsSorted();
                const isNum        = header.column.id === '__num';
                const isFrozen     = !isNum && ci > 0 && ci <= frozenCols;
                const isFreezeEdge = !isNum && ci === frozenCols && frozenCols > 0;
                const isFiltered   = !isNum &&
                  Array.isArray(header.column.getFilterValue()) &&
                  (header.column.getFilterValue() as string[]).length <
                    (colUniqueValues.get(header.column.id)?.length ?? Infinity);

                return (
                  <th
                    key={header.id}
                    className={[
                      'dg__th',
                      isSticky     ? 'dg__th--sticky'      : '',
                      isFrozen     ? 'dg__th--frozen'      : '',
                      isFreezeEdge ? 'dg__th--freeze-edge' : '',
                    ].filter(Boolean).join(' ')}
                    style={{ width: header.getSize(), ...(isSticky ? { left } : {}) }}
                    data-col={ci}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div className="dg__th-inner">
                      <span className="dg__th-label">
                        {isNum ? '#' : String(header.column.columnDef.header ?? '')}
                        {sorted === 'asc'  && <span className="dg__sort-icon"> ↑</span>}
                        {sorted === 'desc' && <span className="dg__sort-icon"> ↓</span>}
                      </span>
                      {!isNum && (
                        <>
                          <button
                            className={`dg__filter-btn${isFiltered ? ' dg__filter-btn--active' : ''}`}
                            onClick={e => handleFilterBtnClick(e, header.column.id)}
                            data-tooltip={isFiltered ? 'Filter active' : 'Filter'}
                          >
                            <FunnelIcon filled={isFiltered} />
                          </button>
                          <button
                            className={`dg__pin-btn${isFrozen ? ' dg__pin-btn--active' : ''}`}
                            onClick={e => handlePinClick(e, ci)}
                            data-tooltip={
                              isFreezeEdge ? 'Unfreeze' :
                              isFrozen     ? 'Reduce freeze' :
                                             'Freeze column'
                            }
                          >
                            <LockIcon locked={isFrozen} />
                          </button>
                        </>
                      )}
                    </div>
                    {header.column.getCanResize() && (
                      <div
                        className="dg__resize-handle"
                        onMouseDown={e => { e.stopPropagation(); header.getResizeHandler()(e); }}
                        onClick={e => e.stopPropagation()}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {tableRows.map((row, ri) => {
            const isPinned    = ri < frozenRows;
            const topOffset   = isPinned ? HEADER_H + ri * ROW_H : undefined;
            const statusColor = STATUS_COLOR[row.original.status ?? 'valid'];
            const isRowSel    = selectedIds.has(row.id);

            return (
              <tr
                key={row.id}
                className={[
                  'dg__tr',
                  isPinned ? 'dg__tr--pinned'  : '',
                  isRowSel ? 'dg__tr--row-sel' : '',
                ].filter(Boolean).join(' ')}
                style={isPinned ? { top: topOffset } : undefined}
              >
                {visibleCols.map((vc, ci) => {
                  const meta          = vc.columnDef.meta as ColMeta | undefined;
                  const left          = stickyLeft.get(vc.id);
                  const isSticky      = left !== undefined;
                  const selected      = inRange(ri, ci);
                  const focused       = isFocused(ri, ci);
                  const isEditing     = editCell?.row === ri && editCell?.col === ci;
                  const isNum         = vc.id === '__num';
                  const isFreezeEdge  = !isNum && ci === frozenCols && frozenCols > 0;
                  const rawVal        = isNum ? ri + 1 : row.getValue(vc.id);
                  const displayVal    = !isNum && meta?.formatter
                    ? meta.formatter(rawVal)
                    : String(rawVal ?? '');

                  return (
                    <td
                      key={vc.id}
                      data-cell={`${ri}-${ci}`}
                      className={[
                        'dg__td',
                        isSticky     ? 'dg__td--sticky'      : '',
                        isFreezeEdge ? 'dg__td--freeze-edge' : '',
                        selected     ? 'dg__td--sel'         : '',
                        focused      ? 'dg__td--focus'       : '',
                        isNum        ? 'dg__td--num'         : '',
                        vc.id === 'hazmat' && rawVal === 'Y' ? 'dg__td--hazmat' : '',
                      ].filter(Boolean).join(' ')}
                      style={{
                        width: vc.getSize(),
                        ...(isSticky ? { left } : {}),
                        ...(isNum ? { borderLeft: `3px solid ${statusColor}` } : {}),
                      }}
                      onMouseDown={isNum
                        ? e => handleRowNumDown(e, row.id, ri)
                        : e => handleCellDown(e, ri, ci, vc.id)
                      }
                      onDoubleClick={isNum ? undefined : () => handleCellDblClick(ri, ci)}
                    >
                      {isNum ? (
                        <span className="dg__rownum">{ri + 1}</span>
                      ) : isEditing ? (
                        <CellEditor
                          value={rawVal}
                          meta={meta ?? { editable: true, editorType: 'text' }}
                          options={colUniqueValues.get(vc.id)}
                          onCommit={v => { onCellChange(row.id, vc.id, v); setEditCell(null); }}
                          onCancel={() => setEditCell(null)}
                          onMoveDown={() => moveFocus(1, 0, false)}
                          onMoveRight={() => moveFocus(0, 1, false)}
                        />
                      ) : (
                        <span className="dg__cell-val">{displayVal}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Column filter dropdown — portal-rendered to avoid overflow clipping */}
      {openFilterCol && filterAnchorRect && (() => {
        const col  = table.getColumn(openFilterCol);
        const vals = colUniqueValues.get(openFilterCol) ?? [];
        if (!col || vals.length === 0) return null;
        const orderIdx    = columnOrder.indexOf(openFilterCol);
        const canMoveLeft  = orderIdx > 1;
        const canMoveRight = orderIdx > 0 && orderIdx < columnOrder.length - 1;
        return (
          <ColumnFilterDropdown
            column={col}
            allValues={vals}
            anchorRect={filterAnchorRect}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            onMoveLeft={() => moveColLeft(openFilterCol)}
            onMoveRight={() => moveColRight(openFilterCol)}
            onClose={() => { setOpenFilterCol(null); setFilterAnchorRect(null); }}
          />
        );
      })()}
    </div>
  );
}
