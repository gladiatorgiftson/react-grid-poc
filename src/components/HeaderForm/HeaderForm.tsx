import { useState } from 'react';
import { Toggle } from '../ui/Toggle';
import type { HeaderFormData } from '../../types';

interface HeaderFormProps {
  data: HeaderFormData;
  onChange: (field: keyof HeaderFormData, value: string | boolean) => void;
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}

function Field({ label, children, required }: FieldProps) {
  return (
    <div className="hf-field">
      <label className="hf-field__label">
        {label}
        {required && <span className="hf-field__required">*</span>}
      </label>
      <div className="hf-field__control">{children}</div>
    </div>
  );
}

export function HeaderForm({ data, onChange }: HeaderFormProps) {
  const [expanded, setExpanded] = useState(true);
  const [docs, setDocs] = useState<File[]>([]);

  function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setDocs(prev => [...prev, ...Array.from(e.target.files!)]);
    e.target.value = '';
  }

  function removeDoc(idx: number) {
    setDocs(prev => prev.filter((_, i) => i !== idx));
  }

  return (
    <section className="header-form">
      <button
        className="header-form__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className={`header-form__chevron ${expanded ? 'header-form__chevron--open' : ''}`}>›</span>
        <span className="header-form__section-title">Header Information</span>
      </button>

      {expanded && (
        <div className="header-form__body">
          <div className="hf-row">
            <Field label="Country" required>
              <select className="hf-select" value={data.country} onChange={(e) => onChange('country', e.target.value)}>
                <option>USA</option>
                <option>China</option>
                <option>Japan</option>
                <option>Taiwan</option>
              </select>
            </Field>

            <Field label="Buy Cost #" required>
              <input className="hf-input" value={data.buyCost} onChange={(e) => onChange('buyCost', e.target.value)} />
            </Field>

            <Field label="Manufacturer 1" required>
              <div className="hf-combo">
                <input className="hf-input" value={data.manufacturer1} onChange={(e) => onChange('manufacturer1', e.target.value)} />
                <button className="hf-combo__clear">✕</button>
              </div>
            </Field>

            <Field label="Brand" required>
              <div className="hf-combo">
                <input className="hf-input" value={data.brand} onChange={(e) => onChange('brand', e.target.value)} />
                <button className="hf-combo__clear">✕</button>
              </div>
            </Field>

            <Field label="Currency" required>
              <select className="hf-select" value={data.currency} onChange={(e) => onChange('currency', e.target.value)}>
                <option>USD – US Dollar</option>
                <option>EUR – Euro</option>
                <option>GBP – British Pound</option>
              </select>
            </Field>
          </div>

          <div className="hf-row">
            <Field label="Vendor Item Source">
              <input className="hf-input" value={data.vendorItemSource} placeholder="Select…" onChange={(e) => onChange('vendorItemSource', e.target.value)} />
            </Field>

            <Field label="Weight Unit">
              <select className="hf-select hf-select--sm" value={data.weightUnit} onChange={(e) => onChange('weightUnit', e.target.value)}>
                <option>LB</option>
                <option>KG</option>
              </select>
            </Field>

            <Field label="Company">
              <select className="hf-select" value={data.company} onChange={(e) => onChange('company', e.target.value)}>
                <option>China</option>
                <option>USA</option>
                <option>Japan</option>
              </select>
            </Field>

            <Field label="Default Country">
              <select className="hf-select" value={data.defaultCountry} onChange={(e) => onChange('defaultCountry', e.target.value)}>
                <option>China</option>
                <option>USA</option>
                <option>Japan</option>
                <option>Taiwan</option>
              </select>
            </Field>

            <Field label="Target Launch Date">
              <input className="hf-input" value={data.targetLaunchDate} onChange={(e) => onChange('targetLaunchDate', e.target.value)} />
            </Field>

            <Field label="Rush">
              <Toggle checked={data.rush} onChange={(v) => onChange('rush', v)} />
            </Field>

            <Field label="Notes">
              <input className="hf-input hf-input--wide" value={data.notes} placeholder="Enter notes…" onChange={(e) => onChange('notes', e.target.value)} />
            </Field>

            <button className="hf-edit-btn" data-tooltip="Edit header">✏</button>
          </div>

          <div className="hf-row">
            <div className="hf-field hf-field--wide">
              <label className="hf-field__label">Vendor Documents</label>
              <div className="hf-field__control">
                <div className="hf-upload">
                  <label className="hf-upload__trigger">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.png,.jpg"
                      hidden
                      onChange={handleDocChange}
                    />
                    + Attach Files
                  </label>
                  {docs.map((f, i) => (
                    <span key={i} className="hf-upload__chip">
                      <span className="hf-upload__chip-name">{f.name}</span>
                      <button className="hf-upload__remove" onClick={() => removeDoc(i)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
