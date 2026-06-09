import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ColMeta } from './columns';

interface Props {
  value: unknown;
  meta: ColMeta;
  options?: string[];
  onCommit: (v: unknown) => void;
  onCancel: () => void;
  onMoveDown: () => void;
  onMoveRight: () => void;
}

function parse(raw: string, meta: ColMeta): unknown {
  if (meta.editorType === 'number') {
    const n = parseFloat(raw);
    return isNaN(n) ? 0 : n;
  }
  return raw;
}

function TextEditor({ value, meta, onCommit, onCancel, onMoveDown, onMoveRight }: Props) {
  const [draft, setDraft] = useState(String(value ?? ''));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.select(); }, []);

  return (
    <input
      ref={ref}
      className="dg-cell-input"
      type={meta.editorType === 'number' ? 'number' : 'text'}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={() => onCommit(parse(draft, meta))}
      onKeyDown={e => {
        if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
        else if (e.key === 'Enter') { e.stopPropagation(); onCommit(parse(draft, meta)); onMoveDown(); }
        else if (e.key === 'Tab') { e.stopPropagation(); e.preventDefault(); onCommit(parse(draft, meta)); onMoveRight(); }
        else e.stopPropagation();
      }}
    />
  );
}

function SearchEditor({ value, meta, options: optionsProp, onCommit, onCancel, onMoveDown, onMoveRight }: Props) {
  const [query,      setQuery]      = useState(String(value ?? ''));
  const [apiOptions, setApiOptions] = useState<string[]>([]);
  const [activeIdx,  setActiveIdx]  = useState(-1);
  const [rect,       setRect]       = useState<DOMRect | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = optionsProp ?? apiOptions;

  useLayoutEffect(() => {
    if (inputRef.current) setRect(inputRef.current.getBoundingClientRect());
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    if (!optionsProp && meta.searchField) {
      fetch(`/api/distinct?field=${meta.searchField}`)
        .then(r => r.json())
        .then(d => setApiOptions(d.values ?? []))
        .catch(() => {});
    }
  }, [meta.searchField, optionsProp]);

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  function commit(val: string) { onCommit(val); }

  return (
    <div className="dg-search-editor">
      <input
        ref={inputRef}
        className="dg-cell-input"
        value={query}
        onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
        onKeyDown={e => {
          if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
          else if (e.key === 'Enter') {
            e.stopPropagation();
            commit(activeIdx >= 0 ? filtered[activeIdx] : query);
            onMoveDown();
          } else if (e.key === 'Tab') {
            e.stopPropagation(); e.preventDefault();
            commit(activeIdx >= 0 ? filtered[activeIdx] : query);
            onMoveRight();
          } else if (e.key === 'ArrowDown') {
            e.preventDefault(); e.stopPropagation();
            setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault(); e.stopPropagation();
            setActiveIdx(i => Math.max(i - 1, 0));
          } else {
            e.stopPropagation();
          }
        }}
      />
      {filtered.length > 0 && rect && createPortal(
        <div
          className="dg-search-editor__list"
          style={{
            position: 'fixed',
            top: rect.bottom,
            left: rect.left,
            width: Math.max(rect.width, 200),
            zIndex: 9999,
          }}
        >
          {filtered.map((opt, i) => (
            <button
              key={opt}
              className={`dg-search-editor__opt${i === activeIdx ? ' dg-search-editor__opt--active' : ''}`}
              onMouseDown={e => { e.preventDefault(); commit(opt); }}
            >
              {opt}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

export function CellEditor(props: Props) {
  if (props.meta.editorType === 'searchable') return <SearchEditor {...props} />;
  return <TextEditor {...props} />;
}
