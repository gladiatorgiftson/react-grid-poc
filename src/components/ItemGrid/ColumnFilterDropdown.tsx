import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import type { Column } from '@tanstack/react-table';
import type { Item } from '../../types';

interface Props {
  column: Column<Item, unknown>;
  allValues: string[];
  anchorRect: DOMRect;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onClose: () => void;
}

export function ColumnFilterDropdown({
  column, allValues, anchorRect,
  canMoveLeft, canMoveRight, onMoveLeft, onMoveRight,
  onClose,
}: Props) {
  const currentFilter = column.getFilterValue() as string[] | undefined;

  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<Set<string>>(() =>
    currentFilter && currentFilter.length < allValues.length
      ? new Set(currentFilter)
      : new Set(allValues),
  );

  const ref = useRef<HTMLDivElement>(null);

  const visible = search
    ? allValues.filter(v => v.toLowerCase().includes(search.toLowerCase()))
    : allValues;

  const allVisibleChecked  = visible.length > 0 && visible.every(v => selected.has(v));
  const someVisibleChecked = visible.some(v => selected.has(v));

  function commit(next: Set<string>) {
    setSelected(next);
    if (next.size === 0 || next.size >= allValues.length) {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue(Array.from(next));
    }
  }

  function toggle(val: string) {
    const next = new Set(selected);
    next.has(val) ? next.delete(val) : next.add(val);
    commit(next);
  }

  function toggleAll() {
    const next = new Set(selected);
    if (allVisibleChecked) { visible.forEach(v => next.delete(v)); }
    else                   { visible.forEach(v => next.add(v)); }
    commit(next);
  }

  function clearFilter() {
    setSelected(new Set(allValues));
    column.setFilterValue(undefined);
  }

  // Close on outside click or any scroll
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onScroll() { onClose(); }
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [onClose]);

  const PANEL_W = 260;
  const left = Math.min(anchorRect.left, window.innerWidth - PANEL_W - 8);
  const top  = anchorRect.bottom + 4;

  const isFiltered = selected.size < allValues.length;

  return createPortal(
    <div ref={ref} className="cfd" style={{ position: 'fixed', top, left, width: PANEL_W }}>

      {/* Column move actions */}
      <div className="cfd__actions">
        <button
          className="cfd__move-btn"
          disabled={!canMoveLeft}
          onClick={onMoveLeft}
          title="Move this column one position to the left"
        >
          ← Move Left
        </button>
        <button
          className="cfd__move-btn"
          disabled={!canMoveRight}
          onClick={onMoveRight}
          title="Move this column one position to the right"
        >
          Move Right →
        </button>
      </div>

      {/* Search */}
      <div className="cfd__search-wrap">
        <svg className="cfd__search-icon" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          className="cfd__search"
          placeholder="Search values…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        {search && (
          <button className="cfd__search-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* Select All */}
      <label className="cfd__select-all">
        <input
          type="checkbox"
          className="cfd__cb"
          checked={allVisibleChecked}
          ref={el => {
            if (el) el.indeterminate = !allVisibleChecked && someVisibleChecked;
          }}
          onChange={toggleAll}
        />
        <span className="cfd__select-all-label">Select All</span>
        <span className="cfd__count">{selected.size} / {allValues.length}</span>
      </label>

      <div className="cfd__divider" />

      {/* Value list */}
      <div className="cfd__list">
        {visible.length === 0 ? (
          <div className="cfd__empty">No matching values</div>
        ) : (
          visible.map(val => (
            <label key={val} className="cfd__item">
              <input
                type="checkbox"
                className="cfd__cb"
                checked={selected.has(val)}
                onChange={() => toggle(val)}
              />
              <span className="cfd__val">{val === '' ? '(blank)' : val}</span>
            </label>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="cfd__footer">
        {isFiltered
          ? <button className="cfd__clear-btn" onClick={clearFilter}>Clear Filter</button>
          : <span className="cfd__no-filter-hint">No filter active</span>
        }
        <button className="cfd__close-btn" onClick={onClose}>Done</button>
      </div>
    </div>,
    document.body,
  );
}
