import type { Item } from '../../types';

interface GridFooterProps {
  rows: Item[];
}

const LEGEND = [
  { label: 'Mandatory Field',      color: '#EF4444', type: 'dot'  },
  { label: 'Incomplete Data',      color: '#F97316', type: 'bar'  },
  { label: 'Validation Error',     color: '#EF4444', type: 'bar'  },
  { label: 'Successful Data',      color: '#22C55E', type: 'bar'  },
] as const;

export function GridFooter({ rows }: GridFooterProps) {
  const totalWeight = rows.reduce((sum, r) => sum + (r.weight ?? 0) * (r.qty ?? 1), 0);
  const totalPrice = rows.reduce((sum, r) => sum + (r.listPrice ?? 0) * (r.qty ?? 1), 0);

  return (
    <div className="grid-footer">
      <div className="grid-footer__legend">
        {LEGEND.map(({ label, color, type }) => (
          <span key={label} className="legend-item">
            {type === 'dot'
              ? <span className="legend-item__dot" style={{ background: color }} />
              : <span className="legend-item__bar" style={{ background: color }} />
            }
            <span className="legend-item__label">{label}</span>
          </span>
        ))}
      </div>

      <div className="grid-footer__totals">
        <span>
          Total Weight: <strong>{totalWeight.toFixed(2)} LB</strong>
        </span>
        <span className="grid-footer__sep">|</span>
        <span>
          Total List Price: <strong>${totalPrice.toFixed(2)}</strong>
        </span>
      </div>
    </div>
  );
}
