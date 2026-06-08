import { useState } from 'react';
import { Button } from '../ui/Button';
import { ALL_TOGGLE_COLS } from './columnDefs';

interface GridToolbarProps {
  selectedCount: number;
  hiddenCols: Set<string>;
  frozenCols: number;
  frozenRows: number;
  onAddRow: () => void;
  onDuplicate: () => void;
  onDeleteSelected: () => void;
  onImport: () => void;
  onExport: () => void;
  onToggleColumn: (field: string) => void;
  onSetFrozenCols: (n: number) => void;
  onSetFrozenRows: (n: number) => void;
}

export function GridToolbar({
  selectedCount,
  hiddenCols,
  frozenCols,
  frozenRows,
  onAddRow,
  onDuplicate,
  onDeleteSelected,
  onImport,
  onExport,
  onToggleColumn,
  onSetFrozenCols,
  onSetFrozenRows,
}: GridToolbarProps) {
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const [freezePanelOpen, setFreezePanelOpen] = useState(false);

  return (
    <div className="grid-toolbar">
      <div className="grid-toolbar__section-label">Item Details</div>

      <div className="grid-toolbar__left">
        <Button variant="primary" size="sm" onClick={onAddRow}>
          + Add Row
        </Button>
        <div className="grid-toolbar__sep" />
        <Button variant="ghost" size="sm" disabled={selectedCount === 0} onClick={onDuplicate}>
          ⧉ Duplicate Row
        </Button>
        <Button variant="ghost" size="sm" disabled={selectedCount === 0} onClick={onDeleteSelected} className="btn--delete">
          🗑 Delete Row
        </Button>
        <div className="grid-toolbar__sep" />
        <Button variant="ghost" size="sm" onClick={onImport}>
          ↑ Import
        </Button>
        <Button variant="ghost" size="sm" onClick={onExport}>
          ↓ Export
        </Button>
      </div>

      <div className="grid-toolbar__right">
        {/* Show / Hide Columns */}
        <div className="grid-toolbar__dropdown-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setColPanelOpen((v) => !v); setFreezePanelOpen(false); }}
          >
            ⊞ Show / Hide Columns
          </Button>
          {colPanelOpen && (
            <div className="col-panel">
              <div className="col-panel__title">Columns</div>
              {ALL_TOGGLE_COLS.map(({ field, label }) => (
                <label key={field} className="col-panel__item">
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

        {/* Freeze Panes */}
        <div className="grid-toolbar__dropdown-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setFreezePanelOpen((v) => !v); setColPanelOpen(false); }}
          >
            ☰ Freeze Panes
          </Button>
          {freezePanelOpen && (
            <div className="col-panel col-panel--freeze">
              <div className="col-panel__title">Freeze Panes</div>

              <label className="col-panel__item">
                <input
                  type="radio"
                  name="freeze-col"
                  checked={frozenCols === 0 && frozenRows === 0}
                  onChange={() => { onSetFrozenCols(0); onSetFrozenRows(0); setFreezePanelOpen(false); }}
                />
                Unfreeze All
              </label>

              <div className="col-panel__group-label">Freeze Row</div>
              <label className="col-panel__item">
                <input
                  type="checkbox"
                  checked={frozenRows > 0}
                  onChange={() => onSetFrozenRows(frozenRows > 0 ? 0 : 1)}
                />
                Freeze top row
              </label>

              <div className="col-panel__group-label">Freeze Column</div>
              <label className="col-panel__item">
                <input
                  type="radio"
                  name="freeze-col"
                  checked={frozenCols === 0}
                  onChange={() => { onSetFrozenCols(0); setFreezePanelOpen(false); }}
                />
                None
              </label>
              {ALL_TOGGLE_COLS.map(({ field, label }, idx) => (
                <label key={field} className="col-panel__item">
                  <input
                    type="radio"
                    name="freeze-col"
                    checked={frozenCols === idx + 1}
                    onChange={() => { onSetFrozenCols(idx + 1); setFreezePanelOpen(false); }}
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
