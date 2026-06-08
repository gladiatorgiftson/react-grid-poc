import { useCallback, useState } from 'react';
import { TopNav } from './components/TopNav/TopNav';
import { PageHeader } from './components/PageHeader/PageHeader';
import { HeaderForm } from './components/HeaderForm/HeaderForm';
import { ItemGrid } from './components/ItemGrid/ItemGrid';
import { BottomBar } from './components/BottomBar/BottomBar';
import { mockItems, defaultHeaderForm } from './data/mockItems';
import type { HeaderFormData, Item } from './types';
import './index.css';

const BREADCRUMBS = [
  { label: 'My Queue', href: '#' },
  { label: 'New Item Entry' },
];

export default function App() {
  const [rows, setRows] = useState<Item[]>(mockItems);
  const [headerForm, setHeaderForm] = useState<HeaderFormData>(defaultHeaderForm);

  const handleHeaderChange = useCallback(
    (field: keyof HeaderFormData, value: string | boolean) => {
      setHeaderForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  return (
    <div className="app">
      <TopNav activeTab="My Queue" />

      <main className="app__content">
        <PageHeader
          breadcrumbs={BREADCRUMBS}
          title="New Item Entry"
          statusLabel="Draft"
          authoredAt="Authorized 3 min ago"
          description="Enter item in the grid below. Save draft or validate items before submission."
        />

        <HeaderForm data={headerForm} onChange={handleHeaderChange} />

        <ItemGrid rows={rows} onRowsChange={setRows} />
      </main>

      <BottomBar />
    </div>
  );
}
