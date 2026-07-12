export type Role = 'Fleet Manager' | 'Driver' | 'Safety Officer' | 'Financial Analyst';

export interface Vehicle {
  registrationNumber: string; // unique
  name: string;
  type: 'Van' | 'Truck' | 'Mini';
  maxCapacity: number; // in kg
  odometer: number; // in km
  acquisitionCost: number;
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
  nickname?: string;
}

export interface Driver {
  licenseNumber: string; // unique
  name: string;
  licenseCategory: 'HMV' | 'LMV';
  licenseExpiryDate: string; // YYYY-MM-DD
  contactNumber: string;
  safetyScore: number; // 0-100
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
  joinedDate: string;
}

export interface Trip {
  id: string; // #TR-xxxx
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number; // kg
  plannedDistance: number; // km
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
  eta: string;
  routeName: string;
  fuelConsumedLiters?: number;
  finalOdometer?: number;
  revenue: number; // Used for ROI calculation
  date: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType: 'Oil Change' | 'Brake Check' | 'Engine Repair' | 'Tire Replacement' | 'Routine Inspection' | 'Oil Change & Filter' | 'Engine Overhaul' | 'Tire Alignment';
  costEstimate: number;
  completionDate: string;
  status: 'Active' | 'Completed';
  notes?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
  status: 'Approved' | 'Flagged';
}

export interface Expense {
  id: string;
  vehicleId: string;
  type: 'Toll' | 'Parking' | 'Maintenance' | 'Other';
  amount: number;
  date: string;
  description: string;
}

export interface User {
  email: string;
  role: Role;
  name: string;
  avatarUrl: string;
  password?: string;
}
