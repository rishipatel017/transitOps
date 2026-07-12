import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Role, User } from './types';

export const AVAILABLE_ROLES: Role[] = [
  'Fleet Manager',
  'Driver',
  'Safety Officer',
  'Financial Analyst'
];

export const SYSTEM_USERS: User[] = [
  { email: "manager@transitops.com", role: "Fleet Manager", name: "Rajesh Sharma", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256", status: "Active" },
  { email: "driver@transitops.com", role: "Driver", name: "Rajesh Babu", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256", status: "Active" },
  { email: "safety@transitops.com", role: "Safety Officer", name: "Manish Gupta", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256", status: "Active" },
  { email: "analyst@transitops.com", role: "Financial Analyst", name: "Aarav Mehta", avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256", status: "Active" },
  { email: "dispatch@transitops.com", role: "Fleet Manager", name: "Neha Patil", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256", status: "Active" },
  { email: "driver2@transitops.com", role: "Driver", name: "Amit Kumar", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256", status: "Active" },
  { email: "safety2@transitops.com", role: "Safety Officer", name: "Priya Desai", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256", status: "Active" },
  { email: "analyst2@transitops.com", role: "Financial Analyst", name: "Karan Johar", avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256", status: "Active" },
  { email: "hr@transitops.com", role: "Fleet Manager", name: "Sneha Reddy", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256", status: "Active" },
  { email: "maintenance@transitops.com", role: "Safety Officer", name: "Ravi Teja", avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=256", status: "Active" },
];

export const DEFAULT_VEHICLES: Vehicle[] = [
  { registrationNumber: "VR-912B", name: "The Black Panther", type: "Truck", maxCapacity: 15000, odometer: 84300, acquisitionCost: 120000, status: "Available", nickname: "Black Panther" },
  { registrationNumber: "VR-770A", name: "Iron Maiden", type: "Truck", maxCapacity: 12000, odometer: 142100, acquisitionCost: 95000, status: "In Shop", nickname: "Iron Maiden" },
  { registrationNumber: "VR-440C", name: "Road Runner Express", type: "Van", maxCapacity: 3500, odometer: 62100, acquisitionCost: 45000, status: "On Trip", nickname: "Road Runner" },
  { registrationNumber: "VR-330D", name: "Mini Beast Cargo", type: "Mini", maxCapacity: 1200, odometer: 12000, acquisitionCost: 25000, status: "Available", nickname: "Mini Beast" },
  { registrationNumber: "VR-551E", name: "The Goliath Giant", type: "Truck", maxCapacity: 20000, odometer: 310500, acquisitionCost: 140000, status: "Retired", nickname: "Goliath" },
  { registrationNumber: "VR-882F", name: "Voyager Hauler", type: "Van", maxCapacity: 4000, odometer: 95100, acquisitionCost: 48000, status: "On Trip", nickname: "Voyager" },
  { registrationNumber: "VR-111G", name: "Desert Storm", type: "Truck", maxCapacity: 18000, odometer: 45000, acquisitionCost: 110000, status: "Available", nickname: "Storm" },
  { registrationNumber: "VR-222H", name: "Urban Sprinter", type: "Van", maxCapacity: 3000, odometer: 21000, acquisitionCost: 40000, status: "Available", nickname: "Sprinter" },
  { registrationNumber: "VR-333I", name: "City Hopper", type: "Mini", maxCapacity: 1000, odometer: 8500, acquisitionCost: 20000, status: "On Trip", nickname: "Hopper" },
  { registrationNumber: "VR-444J", name: "Highway King", type: "Truck", maxCapacity: 25000, odometer: 150000, acquisitionCost: 160000, status: "In Shop", nickname: "King" },
];

export const DEFAULT_DRIVERS: Driver[] = [
  { licenseNumber: "DL-88121", name: "Rajesh Sharma", licenseCategory: "HMV", licenseExpiryDate: "2026-11-15", contactNumber: "+91 98765 43210", safetyScore: 98, status: "Available", joinedDate: "2021-03-12" },
  { licenseNumber: "DL-22188", name: "Rajesh Babu", licenseCategory: "LMV", licenseExpiryDate: "2023-05-10", contactNumber: "+91 87654 32109", safetyScore: 92, status: "On Trip", joinedDate: "2022-06-15" },
  { licenseNumber: "DL-99211", name: "Manish Gupta", licenseCategory: "HMV", licenseExpiryDate: "2026-08-20", contactNumber: "+91 76543 21098", safetyScore: 62, status: "Off Duty", joinedDate: "2020-01-10" },
  { licenseNumber: "DL-77412", name: "Aarav Mehta", licenseCategory: "HMV", licenseExpiryDate: "2027-01-30", contactNumber: "+91 65432 10987", safetyScore: 45, status: "Suspended", joinedDate: "2023-04-01" },
  { licenseNumber: "DL-55210", name: "Diljit Singh", licenseCategory: "LMV", licenseExpiryDate: "2026-12-01", contactNumber: "+91 95432 87654", safetyScore: 89, status: "Available", joinedDate: "2024-02-15" },
  { licenseNumber: "DL-11111", name: "Amit Kumar", licenseCategory: "HMV", licenseExpiryDate: "2028-05-10", contactNumber: "+91 81234 56789", safetyScore: 95, status: "Available", joinedDate: "2020-11-20" },
  { licenseNumber: "DL-22222", name: "Suresh Pillai", licenseCategory: "LMV", licenseExpiryDate: "2025-08-22", contactNumber: "+91 71234 56789", safetyScore: 88, status: "On Trip", joinedDate: "2021-09-14" },
  { licenseNumber: "DL-33333", name: "Ramesh Yadav", licenseCategory: "HMV", licenseExpiryDate: "2027-03-15", contactNumber: "+91 91234 56789", safetyScore: 76, status: "Off Duty", joinedDate: "2019-05-11" },
  { licenseNumber: "DL-44444", name: "Arun Patel", licenseCategory: "LMV", licenseExpiryDate: "2026-10-30", contactNumber: "+91 61234 56789", safetyScore: 99, status: "Available", joinedDate: "2023-08-01" },
  { licenseNumber: "DL-55555", name: "Vikram Singh", licenseCategory: "HMV", licenseExpiryDate: "2024-12-31", contactNumber: "+91 98888 77777", safetyScore: 82, status: "On Trip", joinedDate: "2022-01-25" },
];

export const DEFAULT_TRIPS: Trip[] = [
  { id: "TR-1001", source: "Mumbai Port", destination: "Pune Hub", vehicleId: "VR-440C", driverId: "DL-22188", cargoWeight: 2800, plannedDistance: 150, status: "Dispatched", eta: "Today, 18:30", routeName: "Expressway", revenue: 15000, date: "2026-07-11", currentProgress: 45, estimatedDurationHrs: 3.5 },
  { id: "TR-1002", source: "Delhi Central", destination: "Jaipur Outpost", vehicleId: "VR-912B", driverId: "DL-88121", cargoWeight: 12500, plannedDistance: 280, status: "Completed", eta: "Delivered", routeName: "NH48 Transit", revenue: 32000, date: "2026-07-10", fuelConsumedLiters: 65, finalOdometer: 84450, currentProgress: 100, estimatedDurationHrs: 5.0 },
  { id: "TR-1003", source: "Bangalore South", destination: "Chennai Gate 4", vehicleId: "VR-882F", driverId: "DL-55210", cargoWeight: 1100, plannedDistance: 350, status: "Dispatched", eta: "In 45 minutes", routeName: "NH44 Fast-track", revenue: 28500, date: "2026-07-11", currentProgress: 85, estimatedDurationHrs: 6.2 },
  { id: "TR-1004", source: "Kolkata Depot B", destination: "Patna East Port", vehicleId: "VR-330D", driverId: "DL-88121", cargoWeight: 900, plannedDistance: 580, status: "Draft", eta: "Pending Dispatch", routeName: "NH19 Cargo Lane", revenue: 42000, date: "2026-07-12", currentProgress: 0, estimatedDurationHrs: 10.5 },
  { id: "TR-1005", source: "Ahmedabad Hub", destination: "Surat Port", vehicleId: "VR-111G", driverId: "DL-11111", cargoWeight: 15000, plannedDistance: 260, status: "Completed", eta: "Delivered", routeName: "NE1 Highway", revenue: 25000, date: "2026-07-09", fuelConsumedLiters: 50, finalOdometer: 45260, currentProgress: 100, estimatedDurationHrs: 4.5 },
  { id: "TR-1006", source: "Hyderabad Depot", destination: "Vijayawada Hub", vehicleId: "VR-222H", driverId: "DL-22222", cargoWeight: 2500, plannedDistance: 275, status: "Dispatched", eta: "Today, 21:00", routeName: "NH65", revenue: 18000, date: "2026-07-12", currentProgress: 12, estimatedDurationHrs: 5.5 },
  { id: "TR-1007", source: "Lucknow Central", destination: "Kanpur Hub", vehicleId: "VR-333I", driverId: "DL-44444", cargoWeight: 800, plannedDistance: 90, status: "Assigned", eta: "Pending Acceptance", routeName: "", revenue: 8000, date: "2026-07-13", currentProgress: 0, estimatedDurationHrs: 2.0 },
  { id: "TR-1008", source: "Indore Terminal", destination: "Bhopal Hub", vehicleId: "VR-444J", driverId: "DL-55555", cargoWeight: 18000, plannedDistance: 190, status: "Completed", eta: "Delivered", routeName: "NH52", revenue: 22000, date: "2026-07-08", fuelConsumedLiters: 45, finalOdometer: 150190, currentProgress: 100, estimatedDurationHrs: 3.5 },
  { id: "TR-1009", source: "Nagpur Depot", destination: "Raipur Hub", vehicleId: "VR-912B", driverId: "DL-88121", cargoWeight: 14000, plannedDistance: 285, status: "Dispatched", eta: "Tomorrow, 10:00", routeName: "NH53", revenue: 31000, date: "2026-07-12", currentProgress: 60, estimatedDurationHrs: 5.2 },
  { id: "TR-1010", source: "Chandigarh Hub", destination: "Amritsar Depot", vehicleId: "VR-770A", driverId: "DL-11111", cargoWeight: 11000, plannedDistance: 225, status: "Assigned", eta: "Pending Acceptance", routeName: "", revenue: 21000, date: "2026-07-14", currentProgress: 0, estimatedDurationHrs: 4.0 },
];

export const DEFAULT_MAINTENANCE: MaintenanceLog[] = [
  { id: "MN-2001", vehicleId: "VR-770A", serviceType: "Brake Check", costEstimate: 4500, completionDate: "2026-07-15", status: "Active", notes: "Driver reported soft brake pedals on arrival." },
  { id: "MN-2002", vehicleId: "VR-912B", serviceType: "Oil Change & Filter", costEstimate: 1200, completionDate: "2026-07-08", status: "Completed", notes: "Routine 10,000 km oil & filter swap." },
  { id: "MN-2003", vehicleId: "VR-770A", serviceType: "Engine Overhaul", costEstimate: 24000, completionDate: "2026-07-20", status: "Active", notes: "Seal repair and cylinder head inspection." },
  { id: "MN-2004", vehicleId: "VR-440C", serviceType: "Tire Alignment", costEstimate: 1800, completionDate: "2026-07-05", status: "Completed", notes: "Front two tires aligned due to vibration." },
  { id: "MN-2005", vehicleId: "VR-111G", serviceType: "Routine Inspection", costEstimate: 6000, completionDate: "2026-07-10", status: "Completed", notes: "Old battery died. Replaced with Exide." },
  { id: "MN-2006", vehicleId: "VR-222H", serviceType: "Engine Repair", costEstimate: 3500, completionDate: "2026-07-16", status: "Active", notes: "AC blowing warm air." },
  { id: "MN-2007", vehicleId: "VR-333I", serviceType: "Routine Inspection", costEstimate: 400, completionDate: "2026-07-01", status: "Completed", notes: "Replaced due to monsoon." },
  { id: "MN-2008", vehicleId: "VR-444J", serviceType: "Oil Change", costEstimate: 2500, completionDate: "2026-07-18", status: "Active", notes: "Low fluid level warning." },
  { id: "MN-2009", vehicleId: "VR-551E", serviceType: "Routine Inspection", costEstimate: 8000, completionDate: "2026-07-12", status: "Completed", notes: "Rear shocks replaced." },
  { id: "MN-2010", vehicleId: "VR-882F", serviceType: "Routine Inspection", costEstimate: 600, completionDate: "2026-07-14", status: "Active", notes: "Left headlight fused." },
];

export const DEFAULT_FUEL: FuelLog[] = [
  { id: "FL-3001", vehicleId: "VR-912B", liters: 75, cost: 7125, date: "2026-07-10", status: "Approved" },
  { id: "FL-3002", vehicleId: "VR-440C", liters: 45, cost: 4275, date: "2026-07-11", status: "Approved" },
  { id: "FL-3003", vehicleId: "VR-882F", liters: 120, cost: 15600, date: "2026-07-09", status: "Flagged" },
  { id: "FL-3004", vehicleId: "VR-330D", liters: 30, cost: 2850, date: "2026-07-08", status: "Approved" },
  { id: "FL-3005", vehicleId: "VR-111G", liters: 90, cost: 8550, date: "2026-07-11", status: "Approved" },
  { id: "FL-3006", vehicleId: "VR-222H", liters: 40, cost: 3800, date: "2026-07-10", status: "Approved" },
  { id: "FL-3007", vehicleId: "VR-333I", liters: 20, cost: 1900, date: "2026-07-12", status: "Approved" },
  { id: "FL-3008", vehicleId: "VR-444J", liters: 150, cost: 14250, date: "2026-07-07", status: "Approved" },
  { id: "FL-3009", vehicleId: "VR-770A", liters: 100, cost: 13000, date: "2026-07-09", status: "Flagged" },
  { id: "FL-3010", vehicleId: "VR-551E", liters: 60, cost: 5700, date: "2026-07-10", status: "Approved" },
];

export const DEFAULT_EXPENSES: Expense[] = [
  { id: "EX-4001", vehicleId: "VR-440C", type: "Toll", amount: 450, date: "2026-07-11", description: "Bandra-Worli Sea Link" },
  { id: "EX-4002", vehicleId: "VR-912B", type: "Maintenance", amount: 1200, date: "2026-07-08", description: "Routine scheduled oil filter" },
  { id: "EX-4003", vehicleId: "VR-882F", type: "Parking", amount: 300, date: "2026-07-09", description: "Overnight security depot parking" },
  { id: "EX-4004", vehicleId: "VR-770A", type: "Other", amount: 1500, date: "2026-07-07", description: "Roadside battery recovery service" },
  { id: "EX-4005", vehicleId: "VR-111G", type: "Toll", amount: 650, date: "2026-07-10", description: "Yamuna Expressway Toll" },
  { id: "EX-4006", vehicleId: "VR-222H", type: "Parking", amount: 200, date: "2026-07-11", description: "Airport Cargo Parking" },
  { id: "EX-4007", vehicleId: "VR-333I", type: "Maintenance", amount: 800, date: "2026-07-12", description: "Washing and interior cleaning" },
  { id: "EX-4008", vehicleId: "VR-444J", type: "Toll", amount: 1200, date: "2026-07-08", description: "NH48 Toll Plaza Multi-axle" },
  { id: "EX-4009", vehicleId: "VR-551E", type: "Other", amount: 500, date: "2026-07-09", description: "Traffic Challan - Over speeding" },
  { id: "EX-4010", vehicleId: "VR-912B", type: "Parking", amount: 400, date: "2026-07-10", description: "City Hub night halt" },
];

export function getInitialState() {
  // Auto-migration: force reload if cached data has fewer than 10 records
  const cachedDrivers = localStorage.getItem('transitops_drivers');
  if (cachedDrivers) {
    try {
      const parsed = JSON.parse(cachedDrivers);
      if (Array.isArray(parsed) && parsed.length < 10) {
        localStorage.removeItem('transitops_vehicles');
        localStorage.removeItem('transitops_drivers');
        localStorage.removeItem('transitops_trips');
        localStorage.removeItem('transitops_maintenance');
        localStorage.removeItem('transitops_fuel');
        localStorage.removeItem('transitops_expenses');
        localStorage.removeItem('transitops_users');
      }
    } catch(e) {}
  }

  // Auto-migration: force reload trips if they lack the new tracking fields
  const cachedTrips = localStorage.getItem('transitops_trips');
  if (cachedTrips) {
    try {
      const parsed = JSON.parse(cachedTrips);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].estimatedDurationHrs === undefined) {
        localStorage.removeItem('transitops_trips');
      }
    } catch(e) {}
  }

  const load = <T,>(key: string, fallback: T): T => {
    const data = localStorage.getItem(`transitops_${key}`);
    if (data && data !== 'null' && data !== 'undefined') {
      try { 
        const parsed = JSON.parse(data);
        if (parsed !== null && parsed !== undefined) {
          return parsed;
        }
      } catch(e) {}
    }
    return fallback;
  };

  const defaultUsersWithPasswords = SYSTEM_USERS.map(u => ({
    ...u,
    password: "password123"
  }));

  const loadedUsers = load<User[]>('users', defaultUsersWithPasswords);

  const savedCurrentUser = sessionStorage.getItem('transitops_currentUser');
  let currentUser = loadedUsers[0];
  if (savedCurrentUser) {
    try {
      currentUser = JSON.parse(savedCurrentUser);
    } catch (e) {}
  }

  return {
    vehicles: load('vehicles', DEFAULT_VEHICLES),
    drivers: load('drivers', DEFAULT_DRIVERS),
    trips: load('trips', DEFAULT_TRIPS),
    maintenance: load('maintenance', DEFAULT_MAINTENANCE),
    fuel: load('fuel', DEFAULT_FUEL),
    expenses: load('expenses', DEFAULT_EXPENSES),
    users: loadedUsers,
    currentUser
  };
}

export function saveState(state: any) {
  Object.keys(state).forEach(key => {
    if (key === 'currentUser') {
      sessionStorage.setItem('transitops_currentUser', JSON.stringify(state[key]));
    } else {
      localStorage.setItem(`transitops_${key}`, JSON.stringify(state[key]));
    }
  });
}
