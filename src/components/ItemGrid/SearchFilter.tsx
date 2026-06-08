import { useEffect, useRef, useState } from 'react';

const SEARCHABLE_FIELDS = [
  { field: 'productName',    label: 'Product Name'    },
  { field: 'brand',          label: 'Brand'           },
  { field: 'vendorName',     label: 'Vendor Name'     },
  { field: 'category',       label: 'Category'        },
  { field: 'sku',            label: 'SKU'             },
  { field: 'upcGtin',        label: 'UPC / GTIN'      },
  { field: 'internalPartNum',label: 'Internal Part #' },
  { field: 'vendorPartNum',  label: 'Vendor Part #'   },
  { field: 'modelNum',       label: 'Model #'         },
  { field: 'color',          label: 'Color'           },
  { field: 'packageType',    label: 'Package Type'    },
  { field: 'country',        label: 'Country'         },
  { field: 'gtsCode',        label: 'GTS Code'        },
  { field: 'eccn',           label: 'ECCN'            },
  { field: 'hazmat',         label: 'Hazmat'          },
  { field: 'uom',            label: 'UOM'             },
];

interface Props {
  onFilter: (field: string, value: string) => void;
  onAddRecord: (field: string, value: string) => void;
}

export function SearchFilter({ onFilter, onAddRecord }: Props) {
  const [field, setField] = useState('productName');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setNotFound(false);
      setOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&field=${field}`);
        const data: { matches: string[] } = await res.json();
        setSuggestions(data.matches);
        setNotFound(data.matches.length === 0);
        setOpen(true);
      } catch {
        // server offline — show nothing
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, field]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function applyFilter(value: string) {
    setQuery(value);
    setActive(true);
    onFilter(field, value);
    setOpen(false);
  }

  function clearFilter() {
    setQuery('');
    setActive(false);
    setSuggestions([]);
    setNotFound(false);
    setOpen(false);
    onFilter('', '');
  }

  function handleFieldChange(f: string) {
    setField(f);
    setQuery('');
    setSuggestions([]);
    setNotFound(false);
    setOpen(false);
    if (active) { setActive(false); onFilter('', ''); }
  }

  function handleAddRecord() {
    onAddRecord(field, query.trim());
    clearFilter();
  }

  return (
    <div className="search-filter" ref={wrapRef}>
      <span className="search-filter__label">Filter by</span>

      <select
        className="search-filter__field-select"
        value={field}
        onChange={(e) => handleFieldChange(e.target.value)}
      >
        {SEARCHABLE_FIELDS.map(({ field: f, label }) => (
          <option key={f} value={f}>{label}</option>
        ))}
      </select>

      <div className="search-filter__input-wrap">
        <span className="search-filter__icon">🔍</span>
        <input
          className="search-filter__input"
          placeholder="Type to search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => (suggestions.length > 0 || notFound) && setOpen(true)}
        />
        {active && (
          <button className="search-filter__clear" onClick={clearFilter} title="Clear filter">×</button>
        )}

        {open && (suggestions.length > 0 || notFound) && (
          <div className="search-filter__dropdown">
            {suggestions.map((s) => (
              <button key={s} className="search-filter__option" onClick={() => applyFilter(s)}>
                {s}
              </button>
            ))}
            {notFound && (
              <div className="search-filter__not-found">
                <span className="search-filter__not-found-text">
                  "{query.trim()}" — not in database
                </span>
                <button className="search-filter__add-btn" onClick={handleAddRecord}>
                  + Add as new record
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {active && (
        <span className="search-filter__active-badge">
          {SEARCHABLE_FIELDS.find((f) => f.field === field)?.label}: <strong>{query}</strong>
        </span>
      )}
    </div>
  );
}
