import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { ALL_TOGGLE_COLS } from './columns';

interface GridToolbarProps {
  selectedCount: number;
  hiddenCols: Set<string>;
  frozenCols: number;
  frozenRows: number;
  columnOrder: string[];
  onAddRow: () => void;
  onDuplicate: () => void;
  onDeleteSelected: () => void;
  onImport: () => void;
  onExport: () => void;
  onToggleColumn: (field: string) => void;
  onSetFrozenCols: (n: number) => void;
  onSetFrozenRows: (n: number) => void;
  onColumnOrderChange: (newOrder: string[]) => void;
}

function GripIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="2.5" r="1.2" /><circle cx="7" cy="2.5" r="1.2" />
      <circle cx="3" cy="7"   r="1.2" /><circle cx="7" cy="7"   r="1.2" />
      <circle cx="3" cy="11.5" r="1.2" /><circle cx="7" cy="11.5" r="1.2" />
    </svg>
  );
}

export function GridToolbar({
  selectedCount,
  hiddenCols,
  frozenCols,
  frozenRows,
  columnOrder,
  onAddRow,
  onDuplicate,
  onDeleteSelected,
  onImport,
  onExport,
  onToggleColumn,
  onSetFrozenCols,
  onSetFrozenRows,
  onColumnOrderChange,
}: GridToolbarProps) {
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const [dragId,       setDragId]       = useState<string | null>(null);
  const [overId,       setOverId]       = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setColPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const labelMap = Object.fromEntries(ALL_TOGGLE_COLS.map(c => [c.field, c.label]));

  const orderedCols = columnOrder
    .filter(id => id !== '__num' && labelMap[id])
    .map(id => ({ field: id, label: labelMap[id] }));

  function handleDragStart(e: React.DragEvent, colId: string) {
    setDragId(colId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (colId !== overId) setOverId(colId);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    const order = ['__num', ...orderedCols.map(c => c.field)];
    const fromIdx = order.indexOf(dragId);
    const toIdx   = order.indexOf(targetId);
    const next = [...order];
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, dragId);
    onColumnOrderChange(next);
    setDragId(null);
    setOverId(null);
  }

  function handleDragEnd() {
    setDragId(null);
    setOverId(null);
  }

  return (
    <div className="grid-toolbar" ref={toolbarRef}>
      <div className="grid-toolbar__section-label">Item Details</div>

      <div className="grid-toolbar__left">
        <Button variant="primary" size="sm" onClick={onAddRow}>+ Add Row</Button>
        <div className="grid-toolbar__sep" />
        <Button variant="ghost" size="sm" disabled={selectedCount === 0} onClick={onDuplicate}>
          ⧉ Duplicate Row
        </Button>
        <Button variant="ghost" size="sm" disabled={selectedCount === 0} onClick={onDeleteSelected} className="btn--delete">
          🗑 Delete Row
        </Button>
        <div className="grid-toolbar__sep" />
        <Button variant="ghost" size="sm" onClick={onImport}>↑ Import</Button>
        <Button variant="ghost" size="sm" onClick={onExport}>↓ Export</Button>
      </div>

      <div className="grid-toolbar__right">
        {frozenCols > 0 && (
          <button
            className="grid-toolbar__freeze-chip"
            onClick={() => onSetFrozenCols(0)}
            data-tooltip="Unfreeze all columns"
          >
            🔒 {frozenCols} col{frozenCols !== 1 ? 's' : ''} frozen &nbsp;✕
          </button>
        )}
        <Button
          variant={frozenRows > 0 ? 'outline' : 'ghost'}
          size="sm"
          onClick={() => onSetFrozenRows(frozenRows > 0 ? 0 : 1)}
          data-tooltip={frozenRows > 0 ? 'Unpin top row' : 'Pin first row while scrolling'}
        >
          📌 {frozenRows > 0 ? 'Row Pinned' : 'Pin Top Row'}
        </Button>

        <div className="grid-toolbar__sep" />

        <div className="grid-toolbar__dropdown-wrap">
          <Button variant="ghost" size="sm" onClick={() => setColPanelOpen(v => !v)}>
            ⊞ Columns
          </Button>
          {colPanelOpen && (
            <div className="col-panel">
              <div className="col-panel__title">Show / Hide · Drag to Reorder</div>
              {orderedCols.map(({ field, label }) => (
                <label
                  key={field}
                  className={[
                    'col-panel__item',
                    dragId === field ? 'col-panel__item--dragging' : '',
                    overId === field && dragId !== field ? 'col-panel__item--drag-over' : '',
                  ].filter(Boolean).join(' ')}
                  draggable
                  onDragStart={e => handleDragStart(e, field)}
                  onDragOver={e => handleDragOver(e, field)}
                  onDrop={e => handleDrop(e, field)}
                  onDragEnd={handleDragEnd}
                >
                  <span className="col-panel__grip" data-tooltip="Drag to reorder">
                    <GripIcon />
                  </span>
                  <input
                    type="checkbox"
                    checked={!hiddenCols.has(field)}
                    onChange={() => onToggleColumn(field)}
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
