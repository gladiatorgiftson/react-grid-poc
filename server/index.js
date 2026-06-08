const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'db.sqlite');
const db = new Database(DB_PATH);

// ── Schema migration: drop & recreate if new columns missing ───────────────
const cols = db.prepare("PRAGMA table_info(items)").all().map((c) => c.name);
if (!cols.includes('brand')) {
  db.exec('DROP TABLE IF EXISTS items');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id              TEXT PRIMARY KEY,
    upcGtin         TEXT DEFAULT '',
    sku             TEXT DEFAULT '',
    internalPartNum TEXT DEFAULT '',
    brand           TEXT DEFAULT '',
    modelNum        TEXT DEFAULT '',
    productName     TEXT DEFAULT '',
    category        TEXT DEFAULT '',
    color           TEXT DEFAULT '',
    packageType     TEXT DEFAULT '',
    vendorName      TEXT DEFAULT '',
    vendorPartNum   TEXT DEFAULT '',
    gtsCode         TEXT DEFAULT '',
    eccn            TEXT DEFAULT '',
    country         TEXT DEFAULT '',
    hazmat          TEXT DEFAULT 'N',
    uom             TEXT DEFAULT 'EA',
    weight          REAL DEFAULT 0,
    moq             INTEGER DEFAULT 1,
    leadTimeDays    INTEGER DEFAULT 30,
    qty             INTEGER DEFAULT 1,
    costPrice       REAL DEFAULT 0,
    listPrice       REAL DEFAULT 0,
    mapPrice        REAL DEFAULT 0,
    dutyRate        REAL DEFAULT 0,
    warrantyMonths  INTEGER DEFAULT 12,
    status          TEXT DEFAULT 'incomplete'
  )
`);

const rowCount = db.prepare('SELECT COUNT(*) as n FROM items').get();
if (rowCount.n === 0) {
  const ins = db.prepare(`
    INSERT INTO items VALUES (
      @id, @upcGtin, @sku, @internalPartNum,
      @brand, @modelNum, @productName, @category, @color, @packageType,
      @vendorName, @vendorPartNum,
      @gtsCode, @eccn, @country, @hazmat,
      @uom, @weight, @moq, @leadTimeDays,
      @qty, @costPrice, @listPrice, @mapPrice, @dutyRate, @warrantyMonths,
      @status
    )
  `);
  const seedAll = db.transaction((rows) => { for (const r of rows) ins.run(r); });
  seedAll([
    { id: '1',  upcGtin: '013803532140', sku: 'SKU-CAM001', internalPartNum: 'CB-EOS-R50',    brand: 'Canon',     modelNum: 'EOS R50',                    productName: 'EOS R50 Mirrorless Camera',                      category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'EOW0532140',    gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 1.25, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 245.00,  listPrice: 470.99,  mapPrice: 400.34,  dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '2',  upcGtin: '013803611580', sku: 'SKU-CAM002', internalPartNum: 'CB-EOS-R6II',   brand: 'Canon',     modelNum: 'EOS R6 Mark II',             productName: 'EOS R6 Mark II Mirrorless Camera',               category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'EOS-R6M2',      gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 2.00, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 1300.00, listPrice: 2499.00, mapPrice: 2124.15, dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '3',  upcGtin: '013803617612', sku: 'SKU-CAM003', internalPartNum: 'CB-EOS-R5II',   brand: 'Canon',     modelNum: 'EOS R5 Mark II',             productName: 'EOS R5 Mark II Mirrorless Camera',               category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'EOS-R5M2',      gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 2.25, moq: 1,  leadTimeDays: 30, qty: 1, costPrice: 2235.00, listPrice: 4299.00, mapPrice: 3654.15, dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '4',  upcGtin: '013803603141', sku: 'SKU-CAM004', internalPartNum: 'CB-EOS-R8',     brand: 'Canon',     modelNum: 'EOS R8',                     productName: 'EOS R8 Full-Frame Mirrorless Camera',            category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'EOS-R8',        gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 1.40, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 676.00,  listPrice: 1299.00, mapPrice: 1104.15, dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '5',  upcGtin: '013803305632', sku: 'SKU-CAM005', internalPartNum: 'CB-1DX3',       brand: 'Canon',     modelNum: 'EOS-1D X Mark III',          productName: 'EOS-1D X Mark III DSLR Camera Body',             category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: '1DX-MK3',       gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 6.40, moq: 1,  leadTimeDays: 45, qty: 1, costPrice: 3380.00, listPrice: 6499.00, mapPrice: 5524.15, dutyRate: 0,   warrantyMonths: 12, status: 'incomplete' },
    { id: '6',  upcGtin: '013803303638', sku: 'SKU-LNS001', internalPartNum: 'LN-RF2470-28',  brand: 'Canon',     modelNum: 'RF 24-70mm f/2.8L IS USM',   productName: 'RF 24-70mm f/2.8L IS USM Lens',                  category: 'Lenses',             color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'RF-2470-28L',   gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 2.80, moq: 1,  leadTimeDays: 30, qty: 1, costPrice: 1195.00, listPrice: 2299.00, mapPrice: 1954.15, dutyRate: 2.4, warrantyMonths: 12, status: 'valid'      },
    { id: '7',  upcGtin: '013803303577', sku: 'SKU-LNS002', internalPartNum: 'LN-RF70200-28', brand: 'Canon',     modelNum: 'RF 70-200mm f/2.8L IS USM',  productName: 'RF 70-200mm f/2.8L IS USM Lens',                 category: 'Lenses',             color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'RF-70200-28L',  gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 3.62, moq: 1,  leadTimeDays: 30, qty: 1, costPrice: 1402.00, listPrice: 2699.00, mapPrice: 2294.15, dutyRate: 2.4, warrantyMonths: 12, status: 'valid'      },
    { id: '8',  upcGtin: '013803219045', sku: 'SKU-LNS003', internalPartNum: 'LN-RF50-12',    brand: 'Canon',     modelNum: 'RF 50mm f/1.2L USM',         productName: 'RF 50mm f/1.2L USM Lens',                        category: 'Lenses',             color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'RF-50-12L',     gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 2.13, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 1196.00, listPrice: 2299.00, mapPrice: 1954.15, dutyRate: 2.4, warrantyMonths: 12, status: 'valid'      },
    { id: '9',  upcGtin: '013803523004', sku: 'SKU-LNS004', internalPartNum: 'LN-RF16-28',    brand: 'Canon',     modelNum: 'RF 16mm f/2.8 STM',          productName: 'RF 16mm f/2.8 STM Lens',                         category: 'Lenses',             color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'RF-16-28S',     gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Taiwan',  hazmat: 'N', uom: 'EA', weight: 0.44, moq: 1,  leadTimeDays: 14, qty: 1, costPrice: 155.00,  listPrice: 299.00,  mapPrice: 254.15,  dutyRate: 2.4, warrantyMonths: 12, status: 'valid'      },
    { id: '10', upcGtin: '013803303010', sku: 'SKU-LNS005', internalPartNum: 'LN-RF24105-4',  brand: 'Canon',     modelNum: 'RF 24-105mm f/4L IS USM',    productName: 'RF 24-105mm f/4L IS USM Lens',                   category: 'Lenses',             color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'RF-24105-4L',   gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 1.62, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 572.00,  listPrice: 1099.00, mapPrice: 934.15,  dutyRate: 2.4, warrantyMonths: 12, status: 'valid'      },
    { id: '11', upcGtin: '013803523043', sku: 'SKU-BAT001', internalPartNum: 'LP-E6NH',       brand: 'Canon',     modelNum: 'LP-E6NH',                    productName: 'Battery Pack LP-E6NH',                           category: 'Batteries',          color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'LP-E6NH',       gtsCode: '8507.60.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'Y', uom: 'EA', weight: 0.37, moq: 6,  leadTimeDays: 14, qty: 1, costPrice: 46.00,   listPrice: 89.99,   mapPrice: 76.49,   dutyRate: 2.7, warrantyMonths: 12, status: 'valid'      },
    { id: '12', upcGtin: '013803314867', sku: 'SKU-BAT002', internalPartNum: 'LP-E17',        brand: 'Canon',     modelNum: 'LP-E17',                     productName: 'Battery Pack LP-E17',                            category: 'Batteries',          color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'LP-617',        gtsCode: '8507.60.0000', eccn: 'EAR99', country: 'China',   hazmat: 'Y', uom: 'EA', weight: 0.19, moq: 6,  leadTimeDays: 14, qty: 1, costPrice: 34.00,   listPrice: 64.99,   mapPrice: 55.24,   dutyRate: 2.7, warrantyMonths: 12, status: 'valid'      },
    { id: '13', upcGtin: '013803524867', sku: 'SKU-CHG001', internalPartNum: 'LC-E17',        brand: 'Canon',     modelNum: 'LC-E17',                     productName: 'Battery Charger LC-E17',                         category: 'Chargers',           color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'LC-E17',        gtsCode: '8504.40.9550', eccn: 'EAR99', country: 'China',   hazmat: 'N', uom: 'EA', weight: 0.20, moq: 6,  leadTimeDays: 14, qty: 1, costPrice: 29.00,   listPrice: 55.00,   mapPrice: 46.75,   dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '14', upcGtin: '013803524886', sku: 'SKU-ACC001', internalPartNum: 'EW-S2',         brand: 'Canon',     modelNum: 'EW-S2',                      productName: 'Lens Hood EW-S2',                                category: 'Accessories',        color: 'Black',  packageType: 'Bulk Pak',     vendorName: 'Vendor B', vendorPartNum: 'EW-S2',         gtsCode: '9006.91.0000', eccn: 'EAR99', country: 'China',   hazmat: 'N', uom: 'EA', weight: 0.06, moq: 12, leadTimeDays: 14, qty: 1, costPrice: 7.00,    listPrice: 14.99,   mapPrice: 12.74,   dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '15', upcGtin: '013803523042', sku: 'SKU-GRP001', internalPartNum: 'BG-R10',        brand: 'Canon',     modelNum: 'BG-R10',                     productName: 'Battery Grip BG-R10',                            category: 'Accessories',        color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor C', vendorPartNum: 'BG-R10',        gtsCode: '8537.10.9160', eccn: 'EAR99', country: 'Taiwan',  hazmat: 'N', uom: 'EA', weight: 0.69, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 166.00,  listPrice: 319.99,  mapPrice: 271.99,  dutyRate: 0,   warrantyMonths: 12, status: 'incomplete' },
    { id: '16', upcGtin: '027242924741', sku: 'SKU-CAM006', internalPartNum: 'CB-A7IV',       brand: 'Sony',      modelNum: 'Alpha a7 IV',                productName: 'Alpha a7 IV Full-Frame Mirrorless Camera',        category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor A', vendorPartNum: 'ILCE-7M4/B',    gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 2.10, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 1299.00, listPrice: 2498.00, mapPrice: 2123.30, dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '17', upcGtin: '027242933606', sku: 'SKU-CAM007', internalPartNum: 'CB-A7RV',       brand: 'Sony',      modelNum: 'Alpha a7R V',                productName: 'Alpha a7R V Full-Frame Mirrorless Camera',        category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor A', vendorPartNum: 'ILCE-7RM5/B',   gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 2.27, moq: 1,  leadTimeDays: 30, qty: 1, costPrice: 2027.00, listPrice: 3898.00, mapPrice: 3313.30, dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '18', upcGtin: '027242924406', sku: 'SKU-CAM008', internalPartNum: 'CB-ZVE10',      brand: 'Sony',      modelNum: 'ZV-E10',                     productName: 'ZV-E10 APS-C Mirrorless Camera Body',            category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor A', vendorPartNum: 'ZVE10/B',       gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'China',   hazmat: 'N', uom: 'EA', weight: 1.10, moq: 1,  leadTimeDays: 14, qty: 1, costPrice: 389.00,  listPrice: 748.00,  mapPrice: 635.80,  dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '19', upcGtin: '027242921511', sku: 'SKU-LNS006', internalPartNum: 'LN-FE2470GM2', brand: 'Sony',      modelNum: 'FE 24-70mm f/2.8 GM II',     productName: 'FE 24-70mm f/2.8 GM II Lens',                    category: 'Lenses',             color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor A', vendorPartNum: 'SEL2470GM2',    gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 1.65, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 1195.00, listPrice: 2298.00, mapPrice: 1953.30, dutyRate: 2.4, warrantyMonths: 12, status: 'valid'      },
    { id: '20', upcGtin: '027242906693', sku: 'SKU-LNS007', internalPartNum: 'LN-FE85-14GM', brand: 'Sony',      modelNum: 'FE 85mm f/1.4 GM',           productName: 'FE 85mm f/1.4 GM Lens',                          category: 'Lenses',             color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor A', vendorPartNum: 'SEL85F14GM',    gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 2.00, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 935.00,  listPrice: 1798.00, mapPrice: 1528.30, dutyRate: 2.4, warrantyMonths: 12, status: 'valid'      },
    { id: '21', upcGtin: '027242917064', sku: 'SKU-LNS008', internalPartNum: 'LN-FE200600',  brand: 'Sony',      modelNum: 'FE 200-600mm f/5.6-6.3 G',   productName: 'FE 200-600mm f/5.6-6.3 G OSS Lens',             category: 'Lenses',             color: 'White',  packageType: 'Retail Box',   vendorName: 'Vendor A', vendorPartNum: 'SEL200600G',    gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 4.52, moq: 1,  leadTimeDays: 30, qty: 1, costPrice: 1039.00, listPrice: 1998.00, mapPrice: 1698.30, dutyRate: 2.4, warrantyMonths: 12, status: 'error'      },
    { id: '22', upcGtin: '027242906891', sku: 'SKU-BAT003', internalPartNum: 'NP-FZ100',      brand: 'Sony',      modelNum: 'NP-FZ100',                   productName: 'NP-FZ100 Rechargeable Battery',                  category: 'Batteries',          color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor A', vendorPartNum: 'NP-FZ100',      gtsCode: '8507.60.0000', eccn: 'EAR99', country: 'China',   hazmat: 'Y', uom: 'EA', weight: 0.26, moq: 6,  leadTimeDays: 14, qty: 1, costPrice: 41.00,   listPrice: 78.00,   mapPrice: 66.30,   dutyRate: 2.7, warrantyMonths: 12, status: 'valid'      },
    { id: '23', upcGtin: '027242913448', sku: 'SKU-CHG002', internalPartNum: 'BC-QZ1',        brand: 'Sony',      modelNum: 'BC-QZ1',                     productName: 'BC-QZ1 Battery Charger',                         category: 'Chargers',           color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor A', vendorPartNum: 'BC-QZ1',        gtsCode: '8504.40.9550', eccn: 'EAR99', country: 'China',   hazmat: 'N', uom: 'EA', weight: 0.28, moq: 6,  leadTimeDays: 14, qty: 1, costPrice: 29.00,   listPrice: 55.00,   mapPrice: 46.75,   dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '24', upcGtin: '018208017805', sku: 'SKU-CAM009', internalPartNum: 'CB-NIKZ8',      brand: 'Nikon',     modelNum: 'Z8',                         productName: 'Nikon Z8 Full-Frame Mirrorless Camera',          category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor M', vendorPartNum: 'NIK-Z8-BODY',   gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 3.18, moq: 1,  leadTimeDays: 30, qty: 1, costPrice: 2078.00, listPrice: 3997.00, mapPrice: 3397.45, dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '25', upcGtin: '018208017843', sku: 'SKU-CAM010', internalPartNum: 'CB-NIKZ6III',   brand: 'Nikon',     modelNum: 'Z6 III',                     productName: 'Nikon Z6 III Full-Frame Mirrorless Camera',      category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor M', vendorPartNum: 'NIK-Z6III',     gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 2.17, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 1298.00, listPrice: 2497.00, mapPrice: 2122.45, dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '26', upcGtin: '018208020980', sku: 'SKU-LNS009', internalPartNum: 'LN-NIKZ2470',   brand: 'Nikon',     modelNum: 'Z 24-70mm f/2.8 S',          productName: 'NIKKOR Z 24-70mm f/2.8 S Lens',                  category: 'Lenses',             color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor M', vendorPartNum: 'NIK-24-70-28S', gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 2.43, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 1195.00, listPrice: 2297.00, mapPrice: 1952.45, dutyRate: 2.4, warrantyMonths: 12, status: 'valid'      },
    { id: '27', upcGtin: '018208020843', sku: 'SKU-LNS010', internalPartNum: 'LN-NIKZ50-12',  brand: 'Nikon',     modelNum: 'Z 50mm f/1.2 S',             productName: 'NIKKOR Z 50mm f/1.2 S Lens',                     category: 'Lenses',             color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor M', vendorPartNum: 'NIK-50-12S',    gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 2.16, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 519.00,  listPrice: 997.00,  mapPrice: 847.45,  dutyRate: 2.4, warrantyMonths: 12, status: 'valid'      },
    { id: '28', upcGtin: '018208272419', sku: 'SKU-BAT004', internalPartNum: 'EN-EL15C',      brand: 'Nikon',     modelNum: 'EN-EL15c',                   productName: 'EN-EL15c Rechargeable Battery',                  category: 'Batteries',          color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor M', vendorPartNum: 'NIK-ENEL15C',   gtsCode: '8507.60.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'Y', uom: 'EA', weight: 0.20, moq: 6,  leadTimeDays: 14, qty: 1, costPrice: 30.00,   listPrice: 56.95,   mapPrice: 48.41,   dutyRate: 2.7, warrantyMonths: 12, status: 'valid'      },
    { id: '29', upcGtin: '018208272457', sku: 'SKU-CHG003', internalPartNum: 'MH-25A',        brand: 'Nikon',     modelNum: 'MH-25a',                     productName: 'MH-25a Battery Charger',                         category: 'Chargers',           color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor M', vendorPartNum: 'NIK-MH25A',     gtsCode: '8504.40.9550', eccn: 'EAR99', country: 'China',   hazmat: 'N', uom: 'EA', weight: 0.18, moq: 6,  leadTimeDays: 14, qty: 1, costPrice: 21.00,   listPrice: 39.95,   mapPrice: 33.96,   dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '30', upcGtin: '018208020034', sku: 'SKU-ADP001', internalPartNum: 'FTZ-II',        brand: 'Nikon',     modelNum: 'FTZ II',                     productName: 'FTZ II Mount Adapter',                           category: 'Accessories',        color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor M', vendorPartNum: 'NIK-FTZII',     gtsCode: '9002.90.9000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 0.45, moq: 2,  leadTimeDays: 21, qty: 1, costPrice: 130.00,  listPrice: 249.95,  mapPrice: 212.46,  dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '31', upcGtin: '074101026221', sku: 'SKU-CAM011', internalPartNum: 'CB-FXT5',       brand: 'Fujifilm',  modelNum: 'X-T5',                       productName: 'Fujifilm X-T5 APS-C Mirrorless Camera Body',     category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor F', vendorPartNum: 'FUJ-XT5-BLK',   gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 1.62, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 883.00,  listPrice: 1699.00, mapPrice: 1444.15, dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '32', upcGtin: '074101026238', sku: 'SKU-CAM012', internalPartNum: 'CB-FXSL',       brand: 'Fujifilm',  modelNum: 'X-S20',                      productName: 'Fujifilm X-S20 APS-C Camera Body',               category: 'Cameras',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor F', vendorPartNum: 'FUJ-XS20-BLK',  gtsCode: '8525.89.3000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 1.30, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 676.00,  listPrice: 1299.00, mapPrice: 1104.15, dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '33', upcGtin: '074101022025', sku: 'SKU-LNS011', internalPartNum: 'LN-XF56-12',    brand: 'Fujifilm',  modelNum: 'XF 56mm f/1.2 R WR',         productName: 'XF 56mm f/1.2 R WR Lens',                        category: 'Lenses',             color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor F', vendorPartNum: 'FUJ-XF56-12WR', gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 0.73, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 520.00,  listPrice: 999.00,  mapPrice: 849.15,  dutyRate: 2.4, warrantyMonths: 12, status: 'valid'      },
    { id: '34', upcGtin: '074101020236', sku: 'SKU-LNS012', internalPartNum: 'LN-XF1855',     brand: 'Fujifilm',  modelNum: 'XF 18-55mm f/2.8-4 R LM OIS',productName: 'XF 18-55mm f/2.8-4 R LM OIS Lens',               category: 'Lenses',             color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor F', vendorPartNum: 'FUJ-XF1855',    gtsCode: '9002.11.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 0.67, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 364.00,  listPrice: 699.00,  mapPrice: 594.15,  dutyRate: 2.4, warrantyMonths: 12, status: 'incomplete' },
    { id: '35', upcGtin: '074101013970', sku: 'SKU-BAT005', internalPartNum: 'NP-W235',       brand: 'Fujifilm',  modelNum: 'NP-W235',                    productName: 'NP-W235 Rechargeable Battery',                   category: 'Batteries',          color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor F', vendorPartNum: 'FUJ-NPW235',    gtsCode: '8507.60.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'Y', uom: 'EA', weight: 0.22, moq: 6,  leadTimeDays: 14, qty: 1, costPrice: 29.00,   listPrice: 54.95,   mapPrice: 46.71,   dutyRate: 2.7, warrantyMonths: 12, status: 'valid'      },
    { id: '36', upcGtin: '719821440007', sku: 'SKU-TRP001', internalPartNum: 'MAN-055CF',     brand: 'Manfrotto', modelNum: '055CXPRO3',                  productName: 'Manfrotto 055 Carbon Fiber Tripod 3-Section',     category: 'Tripods & Supports', color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor D', vendorPartNum: 'MAN-055CXPRO3', gtsCode: '9620.00.0000', eccn: 'EAR99', country: 'Italy',   hazmat: 'N', uom: 'EA', weight: 3.95, moq: 1,  leadTimeDays: 30, qty: 1, costPrice: 260.00,  listPrice: 499.00,  mapPrice: 424.15,  dutyRate: 0,   warrantyMonths: 36, status: 'valid'      },
    { id: '37', upcGtin: '719821386039', sku: 'SKU-TRP002', internalPartNum: 'MAN-BH496',     brand: 'Manfrotto', modelNum: 'MHXPRO-BHQ2',                productName: 'Manfrotto XPRO Ball Head with 200PL Plate',       category: 'Tripods & Supports', color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor D', vendorPartNum: 'MAN-BHQ2',      gtsCode: '9620.00.0000', eccn: 'EAR99', country: 'Italy',   hazmat: 'N', uom: 'EA', weight: 1.44, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 88.00,   listPrice: 169.00,  mapPrice: 143.65,  dutyRate: 0,   warrantyMonths: 24, status: 'valid'      },
    { id: '38', upcGtin: '719821440101', sku: 'SKU-TRP003', internalPartNum: 'MAN-QRP77',     brand: 'Manfrotto', modelNum: '200PL-PRO',                  productName: 'Manfrotto 200PL-PRO Quick Release Plate',         category: 'Tripods & Supports', color: 'Silver', packageType: 'Bulk Pak',     vendorName: 'Vendor D', vendorPartNum: 'MAN-200PLPRO',  gtsCode: '9620.00.0000', eccn: 'EAR99', country: 'Italy',   hazmat: 'N', uom: 'EA', weight: 0.15, moq: 6,  leadTimeDays: 14, qty: 1, costPrice: 20.00,   listPrice: 39.95,   mapPrice: 33.96,   dutyRate: 0,   warrantyMonths: 24, status: 'valid'      },
    { id: '39', upcGtin: '056035446320', sku: 'SKU-BAG001', internalPartNum: 'LP-PT450AW',    brand: 'Lowepro',   modelNum: 'ProTactic 450 AW II',         productName: 'Lowepro ProTactic 450 AW II Camera Backpack',     category: 'Bags & Cases',       color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor L', vendorPartNum: 'LP-PT450AW',    gtsCode: '4202.92.3020', eccn: 'EAR99', country: 'China',   hazmat: 'N', uom: 'EA', weight: 3.97, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 104.00,  listPrice: 199.95,  mapPrice: 169.96,  dutyRate: 7.5, warrantyMonths: 24, status: 'valid'      },
    { id: '40', upcGtin: '056035446115', sku: 'SKU-BAG002', internalPartNum: 'LP-SE250',      brand: 'Lowepro',   modelNum: 'Slingshot Edge 250 AW',       productName: 'Lowepro Slingshot Edge 250 AW Camera Bag',        category: 'Bags & Cases',       color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor L', vendorPartNum: 'LP-SE250AW',    gtsCode: '4202.92.3020', eccn: 'EAR99', country: 'China',   hazmat: 'N', uom: 'EA', weight: 1.85, moq: 1,  leadTimeDays: 21, qty: 1, costPrice: 42.00,   listPrice: 79.95,   mapPrice: 67.96,   dutyRate: 7.5, warrantyMonths: 24, status: 'valid'      },
    { id: '41', upcGtin: '818373023027', sku: 'SKU-STR001', internalPartNum: 'PD-SL-BK',      brand: 'Peak Design', modelNum: 'Slide',                   productName: 'Peak Design Slide Camera Strap',                  category: 'Accessories',        color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor B', vendorPartNum: 'PD-SL-BK-3',    gtsCode: '6307.90.9889', eccn: 'EAR99', country: 'China',   hazmat: 'N', uom: 'EA', weight: 0.50, moq: 2,  leadTimeDays: 14, qty: 1, costPrice: 42.00,   listPrice: 79.95,   mapPrice: 67.96,   dutyRate: 3.7, warrantyMonths: 12, status: 'valid'      },
    { id: '42', upcGtin: '813658022022', sku: 'SKU-FLS001', internalPartNum: 'GDX-TT685II',   brand: 'Godox',     modelNum: 'TT685 II',                   productName: 'Godox TT685 II Camera Flash Speedlite',           category: 'Lighting',           color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor B', vendorPartNum: 'GDX-TT685C2',   gtsCode: '9405.42.8000', eccn: 'EAR99', country: 'China',   hazmat: 'Y', uom: 'EA', weight: 0.78, moq: 2,  leadTimeDays: 14, qty: 1, costPrice: 57.00,   listPrice: 109.00,  mapPrice: 92.65,   dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '43', upcGtin: '813658020820', sku: 'SKU-FLS002', internalPartNum: 'GDX-AD200PRO',  brand: 'Godox',     modelNum: 'AD200Pro',                   productName: 'Godox AD200Pro Pocket Flash Unit',                category: 'Lighting',           color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor B', vendorPartNum: 'GDX-AD200PRO',  gtsCode: '9405.42.8000', eccn: 'EAR99', country: 'China',   hazmat: 'Y', uom: 'EA', weight: 1.72, moq: 1,  leadTimeDays: 14, qty: 1, costPrice: 156.00,  listPrice: 299.00,  mapPrice: 254.15,  dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '44', upcGtin: '049383064719', sku: 'SKU-FLT001', internalPartNum: 'TIF-UV77',      brand: 'Tiffen',    modelNum: '77UVP',                      productName: '77mm UV Protection Filter',                       category: 'Filters',            color: 'Silver', packageType: 'Blister Pack', vendorName: 'Vendor B', vendorPartNum: 'TIF-77UVEP',    gtsCode: '9002.19.0000', eccn: 'EAR99', country: 'USA',     hazmat: 'N', uom: 'EA', weight: 0.09, moq: 12, leadTimeDays: 7,  qty: 1, costPrice: 16.00,   listPrice: 29.99,   mapPrice: 25.49,   dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '45', upcGtin: '049383064726', sku: 'SKU-FLT002', internalPartNum: 'TIF-CP77',      brand: 'Tiffen',    modelNum: '77CP',                       productName: '77mm Circular Polarizer Filter',                  category: 'Filters',            color: 'Silver', packageType: 'Blister Pack', vendorName: 'Vendor B', vendorPartNum: 'TIF-77CP',      gtsCode: '9002.19.0000', eccn: 'EAR99', country: 'USA',     hazmat: 'N', uom: 'EA', weight: 0.12, moq: 12, leadTimeDays: 7,  qty: 1, costPrice: 31.00,   listPrice: 59.99,   mapPrice: 50.99,   dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '46', upcGtin: '024066558770', sku: 'SKU-FLT003', internalPartNum: 'HOY-UV67',      brand: 'Hoya',      modelNum: 'HMC UV 67mm',                productName: '67mm HMC UV Filter',                             category: 'Filters',            color: 'Silver', packageType: 'Blister Pack', vendorName: 'Vendor B', vendorPartNum: 'HOY-HMC67UV',   gtsCode: '9002.19.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 0.08, moq: 12, leadTimeDays: 14, qty: 1, costPrice: 13.00,   listPrice: 24.99,   mapPrice: 21.24,   dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '47', upcGtin: '024066558787', sku: 'SKU-FLT004', internalPartNum: 'HOY-ND64-77',   brand: 'Hoya',      modelNum: 'Variable ND 77mm',           productName: '77mm Variable ND Filter 3-400x',                  category: 'Filters',            color: 'Black',  packageType: 'Retail Box',   vendorName: 'Vendor B', vendorPartNum: 'HOY-VND77',     gtsCode: '9002.19.0000', eccn: 'EAR99', country: 'Japan',   hazmat: 'N', uom: 'EA', weight: 0.16, moq: 6,  leadTimeDays: 14, qty: 1, costPrice: 40.00,   listPrice: 79.99,   mapPrice: 67.99,   dutyRate: 0,   warrantyMonths: 12, status: 'incomplete' },
    { id: '48', upcGtin: '619659185695', sku: 'SKU-MEM001', internalPartNum: 'SD-64G',        brand: 'SanDisk',   modelNum: 'Extreme PRO 64GB',           productName: '64GB Extreme PRO SD Memory Card',                 category: 'Memory & Storage',   color: 'Silver', packageType: 'Blister Pack', vendorName: 'Vendor B', vendorPartNum: 'SD-64E',        gtsCode: '8523.51.0000', eccn: 'EAR99', country: 'Taiwan',  hazmat: 'N', uom: 'EA', weight: 0.05, moq: 12, leadTimeDays: 7,  qty: 2, costPrice: 16.00,   listPrice: 29.99,   mapPrice: 25.49,   dutyRate: 0,   warrantyMonths: 12, status: 'error'      },
    { id: '49', upcGtin: '619659185701', sku: 'SKU-MEM002', internalPartNum: 'SD-128G',       brand: 'SanDisk',   modelNum: 'Extreme PRO 128GB',          productName: '128GB Extreme PRO SD Memory Card',                category: 'Memory & Storage',   color: 'Silver', packageType: 'Blister Pack', vendorName: 'Vendor B', vendorPartNum: 'SD-128E',       gtsCode: '8523.51.0000', eccn: 'EAR99', country: 'Taiwan',  hazmat: 'N', uom: 'EA', weight: 0.05, moq: 12, leadTimeDays: 7,  qty: 2, costPrice: 28.00,   listPrice: 49.99,   mapPrice: 42.49,   dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '50', upcGtin: '619659199081', sku: 'SKU-MEM003', internalPartNum: 'CFX-256B',      brand: 'SanDisk',   modelNum: 'Extreme PRO CFexpress 256GB', productName: '256GB Extreme PRO CFexpress Type B Card',        category: 'Memory & Storage',   color: 'Silver', packageType: 'Retail Box',   vendorName: 'Vendor B', vendorPartNum: 'CFX-256B',      gtsCode: '8523.51.0000', eccn: 'EAR99', country: 'USA',     hazmat: 'N', uom: 'EA', weight: 0.06, moq: 6,  leadTimeDays: 7,  qty: 1, costPrice: 104.00,  listPrice: 199.99,  mapPrice: 169.99,  dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '51', upcGtin: '049383048016', sku: 'SKU-CLN001', internalPartNum: 'CLN-KIT-PRO',   brand: 'Tiffen',    modelNum: 'Lens Care Kit',              productName: 'Professional Lens & Sensor Cleaning Kit',         category: 'Accessories',        color: 'N/A',    packageType: 'Retail Box',   vendorName: 'Vendor B', vendorPartNum: 'TIF-LENSCARE',  gtsCode: '3407.00.0000', eccn: 'EAR99', country: 'USA',     hazmat: 'N', uom: 'PK', weight: 0.35, moq: 6,  leadTimeDays: 7,  qty: 1, costPrice: 13.00,   listPrice: 24.99,   mapPrice: 21.24,   dutyRate: 0,   warrantyMonths: 12, status: 'valid'      },
    { id: '52', upcGtin: '013803524734', sku: 'SKU-RMT001', internalPartNum: 'RS-60E3',       brand: 'Canon',     modelNum: 'RS-60E3',                    productName: 'Remote Switch RS-60E3',                          category: 'Accessories',        color: 'Black',  packageType: 'Bulk Pak',     vendorName: 'Vendor F', vendorPartNum: 'RS-60E3',       gtsCode: '8543.70.9650', eccn: 'EAR99', country: 'China',   hazmat: 'N', uom: 'EA', weight: 0.08, moq: 6,  leadTimeDays: 14, qty: 1, costPrice: 15.00,   listPrice: 28.99,   mapPrice: 24.64,   dutyRate: 0,   warrantyMonths: 12, status: 'error'      },
  ]);
  console.log('Seeded 52 items');
}

const ALLOWED_FIELDS = new Set([
  'upcGtin', 'sku', 'internalPartNum', 'brand', 'modelNum',
  'productName', 'category', 'color', 'packageType',
  'vendorName', 'vendorPartNum', 'gtsCode', 'eccn', 'country',
  'hazmat', 'uom',
]);

app.get('/api/distinct', (req, res) => {
  const field = String(req.query.field ?? '');
  if (!ALLOWED_FIELDS.has(field)) return res.status(400).json({ error: 'Invalid field' });
  const rows = db.prepare(
    `SELECT DISTINCT ${field} AS val FROM items WHERE ${field} != '' ORDER BY ${field}`
  ).all();
  res.json({ values: rows.map((r) => r.val) });
});

app.get('/api/items', (_req, res) => {
  res.json(db.prepare('SELECT * FROM items ORDER BY rowid').all());
});

app.get('/api/search', (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const field = String(req.query.field ?? 'productName');

  if (!ALLOWED_FIELDS.has(field)) return res.status(400).json({ error: 'Invalid field' });
  if (q.length < 2) return res.json({ matches: [], exactMatch: false });

  const rows = db.prepare(
    `SELECT DISTINCT ${field} AS val FROM items
     WHERE ${field} LIKE ? AND ${field} != ''
     ORDER BY ${field} LIMIT 20`
  ).all(`%${q}%`);

  const matches = rows.map((r) => r.val);
  const exactMatch = matches.some((v) => v.toLowerCase() === q.toLowerCase());
  res.json({ matches, exactMatch });
});

app.post('/api/items', (req, res) => {
  const item = req.body;
  if (!item.id) item.id = String(Date.now());
  try {
    db.prepare(`
      INSERT INTO items VALUES (
        @id, @upcGtin, @sku, @internalPartNum,
        @brand, @modelNum, @productName, @category, @color, @packageType,
        @vendorName, @vendorPartNum,
        @gtsCode, @eccn, @country, @hazmat,
        @uom, @weight, @moq, @leadTimeDays,
        @qty, @costPrice, @listPrice, @mapPrice, @dutyRate, @warrantyMonths,
        @status
      )
    `).run({
      id: item.id,
      upcGtin: item.upcGtin ?? '',         sku: item.sku ?? '',
      internalPartNum: item.internalPartNum ?? '',
      brand: item.brand ?? '',             modelNum: item.modelNum ?? '',
      productName: item.productName ?? '', category: item.category ?? '',
      color: item.color ?? '',             packageType: item.packageType ?? '',
      vendorName: item.vendorName ?? '',   vendorPartNum: item.vendorPartNum ?? '',
      gtsCode: item.gtsCode ?? '',         eccn: item.eccn ?? '',
      country: item.country ?? '',         hazmat: item.hazmat ?? 'N',
      uom: item.uom ?? 'EA',
      weight: item.weight ?? 0,            moq: item.moq ?? 1,
      leadTimeDays: item.leadTimeDays ?? 30,
      qty: item.qty ?? 1,
      costPrice: item.costPrice ?? 0,      listPrice: item.listPrice ?? 0,
      mapPrice: item.mapPrice ?? 0,        dutyRate: item.dutyRate ?? 0,
      warrantyMonths: item.warrantyMonths ?? 12,
      status: item.status ?? 'incomplete',
    });
    res.json({ success: true, item });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API server → http://localhost:${PORT}`));
