/**
 * TransitOps — Prisma Seed Script
 * Populates the database with the default simulation data
 * Run: npx tsx prisma/seed.ts
 */

import prismaClientPkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { PrismaClient } = prismaClientPkg;

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding TransitOps database...\n');

  // ── 1. ROLES ──────────────────────────────────────────────────────────────
  console.log('  → Seeding roles...');
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'Fleet Manager' },
      update: {},
      create: {
        name: 'Fleet Manager',
        description: 'Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency.'
      }
    }),
    prisma.role.upsert({
      where: { name: 'Driver' },
      update: {},
      create: {
        name: 'Driver',
        description: 'Creates trips, assigns vehicles and drivers, and monitors active deliveries.'
      }
    }),
    prisma.role.upsert({
      where: { name: 'Safety Officer' },
      update: {},
      create: {
        name: 'Safety Officer',
        description: 'Ensures driver compliance, tracks license validity, and monitors safety scores.'
      }
    }),
    prisma.role.upsert({
      where: { name: 'Financial Analyst' },
      update: {},
      create: {
        name: 'Financial Analyst',
        description: 'Reviews operational expenses, fuel consumption, maintenance costs, and profitability.'
      }
    }),
  ]);
  console.log(`     ✅ ${roles.length} roles seeded`);

  const roleMap: Record<string, number> = {};
  for (const role of roles) roleMap[role.name] = role.id;

  // ── 2. USERS ──────────────────────────────────────────────────────────────
  console.log('  → Seeding users...');
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'manager@transitops.com' },
      update: { name: 'Rajesh Sharma' },
      create: {
        email: 'manager@transitops.com',
        name: 'Rajesh Sharma',
        password: 'password123',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        roleId: roleMap['Fleet Manager']
      }
    }),
    prisma.user.upsert({
      where: { email: 'driver@transitops.com' },
      update: { name: 'Rajesh Babu' },
      create: {
        email: 'driver@transitops.com',
        name: 'Rajesh Babu',
        password: 'password123',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
        roleId: roleMap['Driver']
      }
    }),
    prisma.user.upsert({
      where: { email: 'safety@transitops.com' },
      update: { name: 'Manish Gupta' },
      create: {
        email: 'safety@transitops.com',
        name: 'Manish Gupta',
        password: 'password123',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
        roleId: roleMap['Safety Officer']
      }
    }),
    prisma.user.upsert({
      where: { email: 'analyst@transitops.com' },
      update: { name: 'Aarav Mehta' },
      create: {
        email: 'analyst@transitops.com',
        name: 'Aarav Mehta',
        password: 'password123',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
        roleId: roleMap['Financial Analyst']
      }
    }),
  ]);
  console.log(`     ✅ ${users.length} users seeded`);

  // ── 3. VEHICLES ───────────────────────────────────────────────────────────
  console.log('  → Seeding vehicles...');
  const vehicleData = [
    {
      registrationNumber: 'VR-912B',
      name: 'The Black Panther',
      type: 'Truck' as const,
      maxCapacity: 15000,
      odometer: 84300,
      acquisitionCost: 120000,
      status: 'Available' as const,
      nickname: 'Black Panther'
    },
    {
      registrationNumber: 'VR-770A',
      name: 'Iron Maiden',
      type: 'Truck' as const,
      maxCapacity: 12000,
      odometer: 142100,
      acquisitionCost: 95000,
      status: 'InShop' as const,
      nickname: 'Iron Maiden'
    },
    {
      registrationNumber: 'VR-440C',
      name: 'Road Runner Express',
      type: 'Van' as const,
      maxCapacity: 3500,
      odometer: 62100,
      acquisitionCost: 45000,
      status: 'OnTrip' as const,
      nickname: 'Road Runner'
    },
    {
      registrationNumber: 'VR-330D',
      name: 'Mini Beast Cargo',
      type: 'Mini' as const,
      maxCapacity: 1200,
      odometer: 12000,
      acquisitionCost: 25000,
      status: 'Available' as const,
      nickname: 'Mini Beast'
    },
    {
      registrationNumber: 'VR-551E',
      name: 'The Goliath Giant',
      type: 'Truck' as const,
      maxCapacity: 20000,
      odometer: 310500,
      acquisitionCost: 140000,
      status: 'Retired' as const,
      nickname: 'Goliath'
    },
    {
      registrationNumber: 'VR-882F',
      name: 'Voyager Hauler',
      type: 'Van' as const,
      maxCapacity: 4000,
      odometer: 95100,
      acquisitionCost: 48000,
      status: 'OnTrip' as const,
      nickname: 'Voyager'
    },
  ];

  for (const v of vehicleData) {
    await prisma.vehicle.upsert({
      where: { registrationNumber: v.registrationNumber },
      update: {},
      create: v
    });
  }
  console.log(`     ✅ ${vehicleData.length} vehicles seeded`);

  // ── 4. DRIVERS ────────────────────────────────────────────────────────────
  console.log('  → Seeding drivers...');
  const driverData = [
    {
      licenseNumber: 'DL-88121',
      name: 'Rajesh Sharma',
      licenseCategory: 'HMV' as const,
      licenseExpiryDate: '2026-11-15',
      contactNumber: '+91 98765 43210',
      safetyScore: 98,
      status: 'Available' as const,
      joinedDate: '2021-03-12'
    },
    {
      licenseNumber: 'DL-22188',
      name: 'Rajesh Babu',
      licenseCategory: 'LMV' as const,
      licenseExpiryDate: '2023-05-10',
      contactNumber: '+91 87654 32109',
      safetyScore: 92,
      status: 'OnTrip' as const,
      joinedDate: '2022-06-15'
    },
    {
      licenseNumber: 'DL-99211',
      name: 'Manish Gupta',
      licenseCategory: 'HMV' as const,
      licenseExpiryDate: '2026-08-20',
      contactNumber: '+91 76543 21098',
      safetyScore: 62,
      status: 'OffDuty' as const,
      joinedDate: '2020-01-10'
    },
    {
      licenseNumber: 'DL-77412',
      name: 'Aarav Mehta',
      licenseCategory: 'HMV' as const,
      licenseExpiryDate: '2027-01-30',
      contactNumber: '+91 65432 10987',
      safetyScore: 45,
      status: 'Suspended' as const,
      joinedDate: '2023-04-01'
    },
    {
      licenseNumber: 'DL-55210',
      name: 'Diljit Singh',
      licenseCategory: 'LMV' as const,
      licenseExpiryDate: '2026-12-01',
      contactNumber: '+91 95432 87654',
      safetyScore: 89,
      status: 'Available' as const,
      joinedDate: '2024-02-15'
    },
  ];

  for (const d of driverData) {
    await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: {
        name: d.name,
        contactNumber: d.contactNumber
      },
      create: d
    });
  }
  console.log(`     ✅ ${driverData.length} drivers seeded`);

  // ── 5. TRIPS ──────────────────────────────────────────────────────────────
  console.log('  → Seeding trips...');
  const tripData = [
    {
      id: 'TR-1001',
      source: 'Houston Depot A',
      destination: 'Dallas North Hub',
      vehicleId: 'VR-440C',
      driverId: 'DL-22188',
      cargoWeight: 2800,
      plannedDistance: 380,
      status: 'Dispatched' as const,
      eta: 'Today, 18:30',
      routeName: 'I-45 Northbound Express',
      revenue: 1500,
      date: '2026-07-11'
    },
    {
      id: 'TR-1002',
      source: 'Chicago Central',
      destination: 'Milwaukee Outpost',
      vehicleId: 'VR-912B',
      driverId: 'DL-88121',
      cargoWeight: 12500,
      plannedDistance: 150,
      status: 'Completed' as const,
      eta: 'Delivered',
      routeName: 'I-94 North Transit',
      revenue: 3200,
      date: '2026-07-10',
      fuelConsumedLiters: 65,
      finalOdometer: 84450
    },
    {
      id: 'TR-1003',
      source: 'Austin South Terminal',
      destination: 'San Antonio Gate 4',
      vehicleId: 'VR-882F',
      driverId: 'DL-55210',
      cargoWeight: 1100,
      plannedDistance: 130,
      status: 'Dispatched' as const,
      eta: 'In 45 minutes',
      routeName: 'I-35 South Fast-track',
      revenue: 850,
      date: '2026-07-11'
    },
    {
      id: 'TR-1004',
      source: 'Austin Depot B',
      destination: 'Houston East Port',
      vehicleId: 'VR-330D',
      driverId: 'DL-88121',
      cargoWeight: 900,
      plannedDistance: 260,
      status: 'Draft' as const,
      eta: 'Pending Dispatch',
      routeName: 'US-290 East Cargo Lane',
      revenue: 1200,
      date: '2026-07-12'
    },
  ];

  for (const t of tripData) {
    await prisma.trip.upsert({
      where: { id: t.id },
      update: {},
      create: t
    });
  }
  console.log(`     ✅ ${tripData.length} trips seeded`);

  // ── 6. MAINTENANCE LOGS ───────────────────────────────────────────────────
  console.log('  → Seeding maintenance logs...');
  const maintData = [
    {
      id: 'MN-2001',
      vehicleId: 'VR-770A',
      serviceType: 'BrakeCheck' as const,
      costEstimate: 450,
      completionDate: '2026-07-15',
      status: 'Active' as const,
      notes: 'Driver reported soft brake pedals on arrival.'
    },
    {
      id: 'MN-2002',
      vehicleId: 'VR-912B',
      serviceType: 'OilChangeFilter' as const,
      costEstimate: 120,
      completionDate: '2026-07-08',
      status: 'Completed' as const,
      notes: 'Routine 10,000 km oil & filter swap.'
    },
    {
      id: 'MN-2003',
      vehicleId: 'VR-770A',
      serviceType: 'EngineOverhaul' as const,
      costEstimate: 2400,
      completionDate: '2026-07-20',
      status: 'Active' as const,
      notes: 'Seal repair and cylinder head inspection.'
    },
    {
      id: 'MN-2004',
      vehicleId: 'VR-440C',
      serviceType: 'TireAlignment' as const,
      costEstimate: 180,
      completionDate: '2026-07-05',
      status: 'Completed' as const,
      notes: 'Front two tires aligned due to vibration.'
    },
  ];

  for (const m of maintData) {
    await prisma.maintenanceLog.upsert({
      where: { id: m.id },
      update: {},
      create: m
    });
  }
  console.log(`     ✅ ${maintData.length} maintenance logs seeded`);

  // ── 7. FUEL LOGS ──────────────────────────────────────────────────────────
  console.log('  → Seeding fuel logs...');
  const fuelData = [
    {
      id: 'FL-3001',
      vehicleId: 'VR-912B',
      liters: 75,
      cost: 225,
      date: '2026-07-10',
      status: 'Approved' as const
    },
    {
      id: 'FL-3002',
      vehicleId: 'VR-440C',
      liters: 45,
      cost: 135,
      date: '2026-07-11',
      status: 'Approved' as const
    },
    {
      id: 'FL-3003',
      vehicleId: 'VR-882F',
      liters: 120,
      cost: 580,
      date: '2026-07-09',
      status: 'Flagged' as const
    },
    {
      id: 'FL-3004',
      vehicleId: 'VR-330D',
      liters: 30,
      cost: 90,
      date: '2026-07-08',
      status: 'Approved' as const
    },
  ];

  for (const f of fuelData) {
    await prisma.fuelLog.upsert({
      where: { id: f.id },
      update: {},
      create: f
    });
  }
  console.log(`     ✅ ${fuelData.length} fuel logs seeded`);

  // ── 8. EXPENSES ───────────────────────────────────────────────────────────
  console.log('  → Seeding expenses...');
  const expenseData = [
    {
      id: 'EX-4001',
      vehicleId: 'VR-440C',
      type: 'Toll' as const,
      amount: 45,
      date: '2026-07-11',
      description: 'I-45 Tollway system tag charge'
    },
    {
      id: 'EX-4002',
      vehicleId: 'VR-912B',
      type: 'Maintenance' as const,
      amount: 120,
      date: '2026-07-08',
      description: 'Routine scheduled oil filter'
    },
    {
      id: 'EX-4003',
      vehicleId: 'VR-882F',
      type: 'Parking' as const,
      amount: 30,
      date: '2026-07-09',
      description: 'Overnight security depot parking'
    },
    {
      id: 'EX-4004',
      vehicleId: 'VR-770A',
      type: 'Other' as const,
      amount: 150,
      date: '2026-07-07',
      description: 'Roadside battery recovery service'
    },
  ];

  for (const e of expenseData) {
    await prisma.expense.upsert({
      where: { id: e.id },
      update: {},
      create: e
    });
  }
  console.log(`     ✅ ${expenseData.length} expenses seeded`);

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  console.log('\n✅ Database seeded successfully!\n');
  console.log('  📊 Summary:');
  console.log(`     Roles:            ${roles.length}`);
  console.log(`     Users:            ${users.length}`);
  console.log(`     Vehicles:         ${vehicleData.length}`);
  console.log(`     Drivers:          ${driverData.length}`);
  console.log(`     Trips:            ${tripData.length}`);
  console.log(`     Maintenance Logs: ${maintData.length}`);
  console.log(`     Fuel Logs:        ${fuelData.length}`);
  console.log(`     Expenses:         ${expenseData.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
