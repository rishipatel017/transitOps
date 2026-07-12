import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Role, User } from './types';

export const DEFAULT_VEHICLES: Vehicle[] = [
  {
    registrationNumber: "VR-912B",
    name: "The Black Panther",
    type: "Truck",
    maxCapacity: 15000,
    odometer: 84300,
    acquisitionCost: 120000,
    status: "Available",
    nickname: "Black Panther"
  },
  {
    registrationNumber: "VR-770A",
    name: "Iron Maiden",
    type: "Truck",
    maxCapacity: 12000,
    odometer: 142100,
    acquisitionCost: 95000,
    status: "In Shop",
    nickname: "Iron Maiden"
  },
  {
    registrationNumber: "VR-440C",
    name: "Road Runner Express",
    type: "Van",
    maxCapacity: 3500,
    odometer: 62100,
    acquisitionCost: 45000,
    status: "On Trip",
    nickname: "Road Runner"
  },
  {
    registrationNumber: "VR-330D",
    name: "Mini Beast Cargo",
    type: "Mini",
    maxCapacity: 1200,
    odometer: 12000,
    acquisitionCost: 25000,
    status: "Available",
    nickname: "Mini Beast"
  },
  {
    registrationNumber: "VR-551E",
    name: "The Goliath Giant",
    type: "Truck",
    maxCapacity: 20000,
    odometer: 310500,
    acquisitionCost: 140000,
    status: "Retired",
    nickname: "Goliath"
  },
  {
    registrationNumber: "VR-882F",
    name: "Voyager Hauler",
    type: "Van",
    maxCapacity: 4000,
    odometer: 95100,
    acquisitionCost: 48000,
    status: "On Trip",
    nickname: "Voyager"
  }
];

export const DEFAULT_DRIVERS: Driver[] = [
  {
    licenseNumber: "DL-88121",
    name: "Rajesh Sharma",
    licenseCategory: "HMV",
    licenseExpiryDate: "2026-11-15",
    contactNumber: "+91 98765 43210",
    safetyScore: 98,
    status: "Available",
    joinedDate: "2021-03-12"
  },
  {
    licenseNumber: "DL-22188",
    name: "Rajesh Babu",
    licenseCategory: "LMV",
    licenseExpiryDate: "2023-05-10", // EXPIRED for safety check demo!
    contactNumber: "+91 87654 32109",
    safetyScore: 92,
    status: "On Trip",
    joinedDate: "2022-06-15"
  },
  {
    licenseNumber: "DL-99211",
    name: "Manish Gupta",
    licenseCategory: "HMV",
    licenseExpiryDate: "2026-08-20",
    contactNumber: "+91 76543 21098",
    safetyScore: 62, // Poor score
    status: "Off Duty",
    joinedDate: "2020-01-10"
  },
  {
    licenseNumber: "DL-77412",
    name: "Aarav Mehta",
    licenseCategory: "HMV",
    licenseExpiryDate: "2027-01-30",
    contactNumber: "+91 65432 10987",
    safetyScore: 45, // Critical Suspended demo
    status: "Suspended",
    joinedDate: "2023-04-01"
  },
  {
    licenseNumber: "DL-55210",
    name: "Diljit Singh",
    licenseCategory: "LMV",
    licenseExpiryDate: "2026-12-01",
    contactNumber: "+91 95432 87654",
    safetyScore: 89,
    status: "Available",
    joinedDate: "2024-02-15"
  }
];

export const DEFAULT_TRIPS: Trip[] = [
  {
    id: "TR-1001",
    source: "Houston Depot A",
    destination: "Dallas North Hub",
    vehicleId: "VR-440C",
    driverId: "DL-22188",
    cargoWeight: 2800,
    plannedDistance: 380,
    status: "Dispatched",
    eta: "Today, 18:30",
    routeName: "I-45 Northbound Express",
    revenue: 1500,
    date: "2026-07-11"
  },
  {
    id: "TR-1002",
    source: "Chicago Central",
    destination: "Milwaukee Outpost",
    vehicleId: "VR-912B",
    driverId: "DL-88121",
    cargoWeight: 12500,
    plannedDistance: 150,
    status: "Completed",
    eta: "Delivered",
    routeName: "I-94 North Transit",
    revenue: 3200,
    date: "2026-07-10",
    fuelConsumedLiters: 65,
    finalOdometer: 84450
  },
  {
    id: "TR-1003",
    source: "Austin South Terminal",
    destination: "San Antonio Gate 4",
    vehicleId: "VR-882F",
    driverId: "DL-55210",
    cargoWeight: 1100,
    plannedDistance: 130,
    status: "Dispatched",
    eta: "In 45 minutes",
    routeName: "I-35 South Fast-track",
    revenue: 850,
    date: "2026-07-11"
  },
  {
    id: "TR-1004",
    source: "Austin Depot B",
    destination: "Houston East Port",
    vehicleId: "VR-330D",
    driverId: "DL-88121",
    cargoWeight: 900,
    plannedDistance: 260,
    status: "Draft",
    eta: "Pending Dispatch",
    routeName: "US-290 East Cargo Lane",
    revenue: 1200,
    date: "2026-07-12"
  }
];

export const DEFAULT_MAINTENANCE: MaintenanceLog[] = [
  {
    id: "MN-2001",
    vehicleId: "VR-770A",
    serviceType: "Brake Check",
    costEstimate: 450,
    completionDate: "2026-07-15",
    status: "Active",
    notes: "Driver reported soft brake pedals on arrival."
  },
  {
    id: "MN-2002",
    vehicleId: "VR-912B",
    serviceType: "Oil Change & Filter",
    costEstimate: 120,
    completionDate: "2026-07-08",
    status: "Completed",
    notes: "Routine 10,000 km oil & filter swap."
  },
  {
    id: "MN-2003",
    vehicleId: "VR-770A",
    serviceType: "Engine Overhaul",
    costEstimate: 2400,
    completionDate: "2026-07-20",
    status: "Active",
    notes: "Seal repair and cylinder head inspection."
  },
  {
    id: "MN-2004",
    vehicleId: "VR-440C",
    serviceType: "Tire Alignment",
    costEstimate: 180,
    completionDate: "2026-07-05",
    status: "Completed",
    notes: "Front two tires aligned due to vibration."
  }
];

export const DEFAULT_FUEL: FuelLog[] = [
  {
    id: "FL-3001",
    vehicleId: "VR-912B",
    liters: 75,
    cost: 225,
    date: "2026-07-10",
    status: "Approved"
  },
  {
    id: "FL-3002",
    vehicleId: "VR-440C",
    liters: 45,
    cost: 135,
    date: "2026-07-11",
    status: "Approved"
  },
  {
    id: "FL-3003",
    vehicleId: "VR-882F",
    liters: 120,
    cost: 580, // Flagged because cost/liter is very high ($4.83 vs normal $3.00)
    date: "2026-07-09",
    status: "Flagged"
  },
  {
    id: "FL-3004",
    vehicleId: "VR-330D",
    liters: 30,
    cost: 90,
    date: "2026-07-08",
    status: "Approved"
  }
];

export const DEFAULT_EXPENSES: Expense[] = [
  {
    id: "EX-4001",
    vehicleId: "VR-440C",
    type: "Toll",
    amount: 45,
    date: "2026-07-11",
    description: "I-45 Tollway system tag charge"
  },
  {
    id: "EX-4002",
    vehicleId: "VR-912B",
    type: "Maintenance",
    amount: 120,
    date: "2026-07-08",
    description: "Routine scheduled oil filter"
  },
  {
    id: "EX-4003",
    vehicleId: "VR-882F",
    type: "Parking",
    amount: 30,
    date: "2026-07-09",
    description: "Overnight security depot parking"
  },
  {
    id: "EX-4004",
    vehicleId: "VR-770A",
    type: "Other",
    amount: 150,
    date: "2026-07-07",
    description: "Roadside battery recovery service"
  }
];

export const AVAILABLE_ROLES: Role[] = [
  "Fleet Manager",
  "Driver",
  "Safety Officer",
  "Financial Analyst"
];

export const SYSTEM_USERS: User[] = [
  {
    email: "manager@transitops.com",
    role: "Fleet Manager",
    name: "Rajesh Sharma",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
  },
  {
    email: "driver@transitops.com",
    role: "Driver",
    name: "Rajesh Babu",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256"
  },
  {
    email: "safety@transitops.com",
    role: "Safety Officer",
    name: "Manish Gupta",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256"
  },
  {
    email: "analyst@transitops.com",
    role: "Financial Analyst",
    name: "Aarav Mehta",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256"
  }
];

export function getInitialState() {
  // Auto-migration: if local cache has old data, clear it so new Indian default profiles load instantly
  const cachedDrivers = localStorage.getItem('transitops_drivers');
  if (cachedDrivers && (cachedDrivers.includes('Jameson Vance') || cachedDrivers.includes('+1 (555)'))) {
    localStorage.clear();
  }

  const load = <T>(key: string, fallback: T): T => {
    const data = localStorage.getItem(`transitops_${key}`);
    if (data) {
      try { return JSON.parse(data); } catch(e) { return fallback; }
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
