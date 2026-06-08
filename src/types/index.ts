export type ItemStatus = 'valid' | 'incomplete' | 'error';

export interface Item {
  id: string;
  // Identification
  upcGtin: string;
  sku: string;
  internalPartNum: string;
  // Product
  brand: string;
  modelNum: string;
  productName: string;
  category: string;
  color: string;
  packageType: string;
  // Vendor
  vendorName: string;
  vendorPartNum: string;
  // Classification
  gtsCode: string;
  eccn: string;
  country: string;
  hazmat: string;
  // Logistics
  uom: string;
  weight: number;
  moq: number;
  leadTimeDays: number;
  // Pricing
  qty: number;
  costPrice: number;
  listPrice: number;
  mapPrice: number;
  dutyRate: number;
  warrantyMonths: number;
  // Status
  status: ItemStatus;
}

export interface HeaderFormData {
  country: string;
  buyCost: string;
  manufacturer1: string;
  brand: string;
  currency: string;
  vendorItemSource: string;
  weightUnit: string;
  company: string;
  defaultCountry: string;
  targetLaunchDate: string;
  rush: boolean;
  notes: string;
}
