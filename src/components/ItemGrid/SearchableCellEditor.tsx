import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { ICellEditorParams } from 'ag-grid-community';

interface Params extends ICellEditorParams {
  searchField?: string;
}

export const SearchableCellEditor = forwardRef((props: Params, ref) => {
  const { value: initialValue, searchField = 'vendorName', stopEditing } = props;
  const [value, setValue] = useState<string>(String(initialValue ?? ''));
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
    isPopup: () => true,
    popupPosition: 'under',
  }));

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
    fetch(`/api/distinct?field=${searchField}`)
      .then((r) => r.json())
      .then((d) => setAllOptions(d.values ?? []))
      .catch(() => {});
  }, [searchField]);

  const filtered = value.trim()
    ? allOptions.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
    : allOptions;

  useEffect(() => { setActiveIdx(0); }, [filtered.length]);

  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  function commit(v: string) {
    setValue(v);
    stopEditing();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        setActiveIdx((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        if (filtered[activeIdx]) commit(filtered[activeIdx]);
        else stopEditing();
        break;
      case 'Escape':
        e.stopPropagation();
        stopEditing(true);
        break;
      case 'Tab':
        if (filtered[activeIdx]) setValue(filtered[activeIdx]);
        stopEditing();
        break;
    }
  }

  return (
    <div className="cell-editor-search">
      <div className="cell-editor-search__header">
        <span className="cell-editor-search__icon">🔍</span>
        <input
          ref={inputRef}
          className="cell-editor-search__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type to filter…"
        />
      </div>
      <div ref={listRef} className="cell-editor-search__list">
        {filtered.length === 0 ? (
          <div className="cell-editor-search__empty">No matches for "{value}"</div>
        ) : (
          filtered.map((opt, i) => (
            <div
              key={opt}
              className={`cell-editor-search__item${i === activeIdx ? ' cell-editor-search__item--active' : ''}`}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseDown={(e) => { e.preventDefault(); commit(opt); }}
            >
              {highlightMatch(opt, value)}
            </div>
          ))
        )}
      </div>
      <div className="cell-editor-search__hint">↑↓ navigate · Enter select · Esc cancel</div>
    </div>
  );
});

SearchableCellEditor.displayName = 'SearchableCellEditor';

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="cell-editor-search__highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
