import { createElement } from 'react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import type { Item } from '../../types';
import { SearchableCellEditor } from './SearchableCellEditor';

const STATUS_COLORS: Record<string, string> = {
  error: '#EF4444',
  incomplete: '#F97316',
  valid: 'transparent',
};

interface RowNumParams extends ICellRendererParams<Item> {
  frozenRows?: number;
}

function RowNumRenderer(params: RowNumParams) {
  const color = STATUS_COLORS[params.data?.status ?? 'valid'];
  const isPinned = params.node?.rowPinned === 'top';
  const idx = params.node?.rowIndex ?? 0;
  const rowNum = isPinned ? idx + 1 : idx + 1 + (params.frozenRows ?? 0);
  return createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      borderLeft: `3px solid ${color}`,
      paddingLeft: 6,
      fontSize: 14,
      color: '#64748B',
    },
  }, rowNum);
}

function searchableEditor(searchField: string): Partial<ColDef> {
  return {
    cellEditor: SearchableCellEditor,
    cellEditorPopup: true,
    cellEditorPopupPosition: 'under',
    cellEditorParams: { searchField },
  };
}

const currency = (p: { value: unknown }) =>
  p.value != null ? `$${Number(p.value).toFixed(2)}` : '';

export function buildColumnDefs(hiddenCols: Set<string>, frozenCols: number, frozenRows: number): ColDef<Item>[] {
  const pin = (idx: number): 'left' | undefined => (idx < frozenCols ? 'left' : undefined);
  const hide = (f: string) => hiddenCols.has(f);

  return [
    // ── Always-pinned row number ───────────────────────────────────────────
    {
      headerName: '#',
      valueGetter: (p) => (p.node?.rowIndex ?? 0) + 1,
      cellRenderer: RowNumRenderer,
      cellRendererParams: { frozenRows },
      width: 56, minWidth: 56, maxWidth: 56,
      pinned: 'left', resizable: false,
      suppressHeaderMenuButton: true, lockPosition: true,
    },
    // ── Identification ────────────────────────────────────────────────────
    { field: 'upcGtin',        headerName: 'UPC / GTIN ✦',   editable: true, width: 155, pinned: pin(0),  hide: hide('upcGtin')        },
    { field: 'sku',            headerName: 'SKU',             editable: true, width: 120, pinned: pin(1),  hide: hide('sku')             },
    { field: 'internalPartNum',headerName: 'Internal Part #', editable: true, width: 145, pinned: pin(2),  hide: hide('internalPartNum') },
    // ── Product ───────────────────────────────────────────────────────────
    { field: 'brand',          headerName: 'Brand ✦',         editable: true, width: 120, pinned: pin(3),  hide: hide('brand'),          ...searchableEditor('brand')       },
    { field: 'modelNum',       headerName: 'Model #',         editable: true, width: 160, pinned: pin(4),  hide: hide('modelNum')        },
    { field: 'productName',    headerName: 'Product Name ✦',  editable: true, width: 260, pinned: pin(5),  hide: hide('productName')     },
    { field: 'category',       headerName: 'Category ✦',      editable: true, width: 160, pinned: pin(6),  hide: hide('category'),       ...searchableEditor('category')    },
    { field: 'color',          headerName: 'Color',           editable: true, width: 100, pinned: pin(7),  hide: hide('color'),          ...searchableEditor('color')       },
    { field: 'packageType',    headerName: 'Package Type',    editable: true, width: 140, pinned: pin(8),  hide: hide('packageType'),    ...searchableEditor('packageType') },
    // ── Vendor ────────────────────────────────────────────────────────────
    { field: 'vendorName',     headerName: 'Vendor Name ✦',   editable: true, width: 160, pinned: pin(9),  hide: hide('vendorName'),     ...searchableEditor('vendorName')  },
    { field: 'vendorPartNum',  headerName: 'Vendor Part #',   editable: true, width: 140, pinned: pin(10), hide: hide('vendorPartNum')   },
    // ── Classification ────────────────────────────────────────────────────
    { field: 'gtsCode',        headerName: 'GTS Code',        editable: true, width: 135, pinned: pin(11), hide: hide('gtsCode')         },
    { field: 'eccn',           headerName: 'ECCN',            editable: true, width: 90,  pinned: pin(12), hide: hide('eccn')            },
    { field: 'country',        headerName: 'Country ✦',       editable: true, width: 110, pinned: pin(13), hide: hide('country'),        ...searchableEditor('country')     },
    {
      field: 'hazmat', headerName: 'Hazmat', editable: true, width: 90, pinned: pin(14), hide: hide('hazmat'),
      ...searchableEditor('hazmat'),
      cellStyle: (p) => p.value === 'Y' ? { color: '#DC2626', fontWeight: 700 } : null,
    },
    // ── Logistics ─────────────────────────────────────────────────────────
    { field: 'uom',            headerName: 'UOM',             editable: true, width: 80,  pinned: pin(15), hide: hide('uom'),            ...searchableEditor('uom')         },
    {
      field: 'weight', headerName: 'Weight (lb)', editable: true, width: 105, pinned: pin(16), hide: hide('weight'),
      valueFormatter: (p) => p.value != null ? `${Number(p.value).toFixed(2)} lb` : '',
      type: 'numericColumn',
    },
    { field: 'moq',            headerName: 'MOQ',             editable: true, width: 75,  pinned: pin(17), hide: hide('moq'),            type: 'numericColumn' },
    { field: 'leadTimeDays',   headerName: 'Lead Time (d)',   editable: true, width: 115, pinned: pin(18), hide: hide('leadTimeDays'),   type: 'numericColumn' },
    // ── Pricing ───────────────────────────────────────────────────────────
    { field: 'qty',            headerName: 'Qty',             editable: true, width: 70,  pinned: pin(19), hide: hide('qty'),            type: 'numericColumn' },
    {
      field: 'costPrice', headerName: 'Cost Price', editable: true, width: 110, pinned: pin(20), hide: hide('costPrice'),
      valueFormatter: currency, cellClass: 'cell--price', type: 'numericColumn',
    },
    {
      field: 'listPrice', headerName: 'List Price', editable: true, width: 110, pinned: pin(21), hide: hide('listPrice'),
      valueFormatter: currency, cellClass: 'cell--price', type: 'numericColumn',
    },
    {
      field: 'mapPrice', headerName: 'MAP Price', editable: true, width: 110, pinned: pin(22), hide: hide('mapPrice'),
      valueFormatter: currency, cellClass: 'cell--price', type: 'numericColumn',
    },
    {
      field: 'dutyRate', headerName: 'Duty Rate %', editable: true, width: 110, pinned: pin(23), hide: hide('dutyRate'),
      valueFormatter: (p) => p.value != null ? `${Number(p.value).toFixed(1)}%` : '',
      type: 'numericColumn',
    },
    { field: 'warrantyMonths', headerName: 'Warranty (mo)',  editable: true, width: 120, pinned: pin(24), hide: hide('warrantyMonths'), type: 'numericColumn' },
  ];
}

export const ALL_TOGGLE_COLS: { field: string; label: string }[] = [
  { field: 'upcGtin',        label: 'UPC / GTIN'      },
  { field: 'sku',            label: 'SKU'              },
  { field: 'internalPartNum',label: 'Internal Part #'  },
  { field: 'brand',          label: 'Brand'            },
  { field: 'modelNum',       label: 'Model #'          },
  { field: 'productName',    label: 'Product Name'     },
  { field: 'category',       label: 'Category'         },
  { field: 'color',          label: 'Color'            },
  { field: 'packageType',    label: 'Package Type'     },
  { field: 'vendorName',     label: 'Vendor Name'      },
  { field: 'vendorPartNum',  label: 'Vendor Part #'    },
  { field: 'gtsCode',        label: 'GTS Code'         },
  { field: 'eccn',           label: 'ECCN'             },
  { field: 'country',        label: 'Country'          },
  { field: 'hazmat',         label: 'Hazmat'           },
  { field: 'uom',            label: 'UOM'              },
  { field: 'weight',         label: 'Weight (lb)'      },
  { field: 'moq',            label: 'MOQ'              },
  { field: 'leadTimeDays',   label: 'Lead Time (d)'    },
  { field: 'qty',            label: 'Qty'              },
  { field: 'costPrice',      label: 'Cost Price'       },
  { field: 'listPrice',      label: 'List Price'       },
  { field: 'mapPrice',       label: 'MAP Price'        },
  { field: 'dutyRate',       label: 'Duty Rate %'      },
  { field: 'warrantyMonths', label: 'Warranty (mo)'    },
];
