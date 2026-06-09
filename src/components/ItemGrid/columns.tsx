import type { ColumnDef } from '@tanstack/react-table';
import type { Item } from '../../types';

export interface ColMeta {
  editable: boolean;
  editorType: 'text' | 'number' | 'searchable';
  searchField?: string;
  formatter?: (v: unknown) => string;
}

const $fmt = (v: unknown) => (v != null ? `$${Number(v).toFixed(2)}` : '');
const pct  = (v: unknown) => (v != null ? `${Number(v).toFixed(1)}%` : '');
const lbs  = (v: unknown) => (v != null ? `${Number(v).toFixed(2)} lb` : '');

function col(
  key: keyof Item,
  header: string,
  size: number,
  meta: Partial<ColMeta> = {},
): ColumnDef<Item, unknown> {
  return {
    id: key,
    accessorKey: key,
    header,
    size,
    minSize: 60,
    meta: { editable: true, editorType: 'text', ...meta } as ColMeta,
  };
}

const srch = (field: string): Partial<ColMeta> => ({ editorType: 'searchable', searchField: field });
const num  = (formatter?: ColMeta['formatter']): Partial<ColMeta> => ({ editorType: 'number', formatter });

// Mirrors the column order used in the toolbar freeze/hide panels
export const ALL_TOGGLE_COLS: { field: string; label: string }[] = [
  { field: 'upcGtin',         label: 'UPC / GTIN'     },
  { field: 'sku',             label: 'SKU'             },
  { field: 'internalPartNum', label: 'Internal Part #' },
  { field: 'brand',           label: 'Brand'           },
  { field: 'modelNum',        label: 'Model #'         },
  { field: 'productName',     label: 'Product Name'    },
  { field: 'category',        label: 'Category'        },
  { field: 'color',           label: 'Color'           },
  { field: 'packageType',     label: 'Package Type'    },
  { field: 'vendorName',      label: 'Vendor Name'     },
  { field: 'vendorPartNum',   label: 'Vendor Part #'   },
  { field: 'gtsCode',         label: 'GTS Code'        },
  { field: 'eccn',            label: 'ECCN'            },
  { field: 'country',         label: 'Country'         },
  { field: 'hazmat',          label: 'Hazmat'          },
  { field: 'uom',             label: 'UOM'             },
  { field: 'weight',          label: 'Weight (lb)'     },
  { field: 'moq',             label: 'MOQ'             },
  { field: 'leadTimeDays',    label: 'Lead Time (d)'   },
  { field: 'qty',             label: 'Qty'             },
  { field: 'costPrice',       label: 'Cost Price'      },
  { field: 'listPrice',       label: 'List Price'      },
  { field: 'mapPrice',        label: 'MAP Price'       },
  { field: 'dutyRate',        label: 'Duty Rate %'     },
  { field: 'warrantyMonths',  label: 'Warranty (mo)'   },
];

export const DATA_COLUMNS: ColumnDef<Item, unknown>[] = [
  col('upcGtin',         'UPC / GTIN ✦',   155),
  col('sku',             'SKU',             120),
  col('internalPartNum', 'Internal Part #', 145),
  col('brand',           'Brand ✦',         120, srch('brand')),
  col('modelNum',        'Model #',         160),
  col('productName',     'Product Name ✦',  260),
  col('category',        'Category ✦',      160, srch('category')),
  col('color',           'Color',           100, srch('color')),
  col('packageType',     'Package Type',    140, srch('packageType')),
  col('vendorName',      'Vendor Name ✦',   160, srch('vendorName')),
  col('vendorPartNum',   'Vendor Part #',   140),
  col('gtsCode',         'GTS Code',        135),
  col('eccn',            'ECCN',             90),
  col('country',         'Country ✦',       110, srch('country')),
  col('hazmat',          'Hazmat',           90, srch('hazmat')),
  col('uom',             'UOM',              80, srch('uom')),
  col('weight',          'Weight (lb)',      105, num(lbs)),
  col('moq',             'MOQ',              75, num()),
  col('leadTimeDays',    'Lead Time (d)',    115, num()),
  col('qty',             'Qty',              70, num()),
  col('costPrice',       'Cost Price',       110, num($fmt)),
  col('listPrice',       'List Price',       110, num($fmt)),
  col('mapPrice',        'MAP Price',        110, num($fmt)),
  col('dutyRate',        'Duty Rate %',      110, num(pct)),
  col('warrantyMonths',  'Warranty (mo)',    120, num()),
];
