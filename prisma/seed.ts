import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('admin@2905', 10)

  // Create Users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@transitops.com' },
      update: {},
      create: {
        email: 'admin@transitops.com',
        password: hashedPassword,
        name: 'System Admin',
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'fleet@transitops.com' },
      update: {},
      create: {
        email: 'fleet@transitops.com',
        password: hashedPassword,
        name: 'John Fleet',
        role: 'FLEET_MANAGER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'dispatcher@transitops.com' },
      update: {},
      create: {
        email: 'dispatcher@transitops.com',
        password: hashedPassword,
        name: 'Sarah Dispatcher',
        role: 'DISPATCHER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'safety@transitops.com' },
      update: {},
      create: {
        email: 'safety@transitops.com',
        password: hashedPassword,
        name: 'Mike Safety',
        role: 'SAFETY_OFFICER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'finance@transitops.com' },
      update: {},
      create: {
        email: 'finance@transitops.com',
        password: hashedPassword,
        name: 'Lisa Finance',
        role: 'FINANCIAL_ANALYST',
      },
    }),
  ])

  console.log('Users created:', users.length)

  // Create Vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { registrationNumber: 'TRK-001' },
      update: {},
      create: {
        registrationNumber: 'TRK-001',
        model: 'Volvo FH16',
        vehicleType: 'Truck',
        maxCapacity: 25000,
        odometer: 150000,
        acquisitionCost: 120000,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'TRK-002' },
      update: {},
      create: {
        registrationNumber: 'TRK-002',
        model: 'Scania R450',
        vehicleType: 'Truck',
        maxCapacity: 28000,
        odometer: 200000,
        acquisitionCost: 135000,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'TRK-003' },
      update: {},
      create: {
        registrationNumber: 'TRK-003',
        model: 'MAN TGX',
        vehicleType: 'Truck',
        maxCapacity: 22000,
        odometer: 180000,
        acquisitionCost: 110000,
        status: 'ON_TRIP',
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'VAN-001' },
      update: {},
      create: {
        registrationNumber: 'VAN-001',
        model: 'Mercedes Sprinter',
        vehicleType: 'Van',
        maxCapacity: 3500,
        odometer: 80000,
        acquisitionCost: 45000,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'VAN-002' },
      update: {},
      create: {
        registrationNumber: 'VAN-002',
        model: 'Ford Transit',
        vehicleType: 'Van',
        maxCapacity: 4000,
        odometer: 65000,
        acquisitionCost: 42000,
        status: 'IN_SHOP',
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'TRK-004' },
      update: {},
      create: {
        registrationNumber: 'TRK-004',
        model: 'DAF XF',
        vehicleType: 'Truck',
        maxCapacity: 26000,
        odometer: 175000,
        acquisitionCost: 125000,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'TRK-005' },
      update: {},
      create: {
        registrationNumber: 'TRK-005',
        model: 'Renault T',
        vehicleType: 'Truck',
        maxCapacity: 24000,
        odometer: 120000,
        acquisitionCost: 115000,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'VAN-003' },
      update: {},
      create: {
        registrationNumber: 'VAN-003',
        model: 'Iveco Daily',
        vehicleType: 'Van',
        maxCapacity: 3800,
        odometer: 95000,
        acquisitionCost: 38000,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'TRK-006' },
      update: {},
      create: {
        registrationNumber: 'TRK-006',
        model: 'Actros MP5',
        vehicleType: 'Truck',
        maxCapacity: 30000,
        odometer: 50000,
        acquisitionCost: 145000,
        status: 'RETIRED',
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'VAN-004' },
      update: {},
      create: {
        registrationNumber: 'VAN-004',
        model: 'Peugeot Boxer',
        vehicleType: 'Van',
        maxCapacity: 4200,
        odometer: 45000,
        acquisitionCost: 35000,
        status: 'AVAILABLE',
      },
    }),
  ])

  console.log('Vehicles created:', vehicles.length)

  // Create Drivers
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-001' },
      update: {},
      create: {
        name: 'Robert Johnson',
        licenseNumber: 'LIC-001',
        category: 'Heavy Vehicle',
        expiryDate: new Date('2026-12-31'),
        phone: '+1234567890',
        safetyScore: 95,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-002' },
      update: {},
      create: {
        name: 'Michael Williams',
        licenseNumber: 'LIC-002',
        category: 'Heavy Vehicle',
        expiryDate: new Date('2027-06-30'),
        phone: '+1234567891',
        safetyScore: 88,
        status: 'ON_TRIP',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-003' },
      update: {},
      create: {
        name: 'David Brown',
        licenseNumber: 'LIC-003',
        category: 'Light Vehicle',
        expiryDate: new Date('2025-12-31'),
        phone: '+1234567892',
        safetyScore: 92,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-004' },
      update: {},
      create: {
        name: 'James Davis',
        licenseNumber: 'LIC-004',
        category: 'Heavy Vehicle',
        expiryDate: new Date('2026-03-31'),
        phone: '+1234567893',
        safetyScore: 78,
        status: 'OFF_DUTY',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-005' },
      update: {},
      create: {
        name: 'William Miller',
        licenseNumber: 'LIC-005',
        category: 'Light Vehicle',
        expiryDate: new Date('2027-09-30'),
        phone: '+1234567894',
        safetyScore: 85,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-006' },
      update: {},
      create: {
        name: 'Richard Wilson',
        licenseNumber: 'LIC-006',
        category: 'Heavy Vehicle',
        expiryDate: new Date('2026-01-31'),
        phone: '+1234567895',
        safetyScore: 90,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-007' },
      update: {},
      create: {
        name: 'Joseph Moore',
        licenseNumber: 'LIC-007',
        category: 'Light Vehicle',
        expiryDate: new Date('2025-08-31'),
        phone: '+1234567896',
        safetyScore: 82,
        status: 'SUSPENDED',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-008' },
      update: {},
      create: {
        name: 'Thomas Taylor',
        licenseNumber: 'LIC-008',
        category: 'Heavy Vehicle',
        expiryDate: new Date('2027-04-30'),
        phone: '+1234567897',
        safetyScore: 94,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-009' },
      update: {},
      create: {
        name: 'Christopher Anderson',
        licenseNumber: 'LIC-009',
        category: 'Light Vehicle',
        expiryDate: new Date('2026-11-30'),
        phone: '+1234567898',
        safetyScore: 87,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-010' },
      update: {},
      create: {
        name: 'Daniel Thomas',
        licenseNumber: 'LIC-010',
        category: 'Heavy Vehicle',
        expiryDate: new Date('2025-02-28'),
        phone: '+1234567899',
        safetyScore: 91,
        status: 'EXPIRED_LICENSE',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-011' },
      update: {},
      create: {
        name: 'Matthew Jackson',
        licenseNumber: 'LIC-011',
        category: 'Light Vehicle',
        expiryDate: new Date('2027-07-31'),
        phone: '+1234567800',
        safetyScore: 89,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-012' },
      update: {},
      create: {
        name: 'Andrew White',
        licenseNumber: 'LIC-012',
        category: 'Heavy Vehicle',
        expiryDate: new Date('2026-05-31'),
        phone: '+1234567801',
        safetyScore: 93,
        status: 'ON_TRIP',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-013' },
      update: {},
      create: {
        name: 'Joshua Harris',
        licenseNumber: 'LIC-013',
        category: 'Light Vehicle',
        expiryDate: new Date('2027-02-28'),
        phone: '+1234567802',
        safetyScore: 86,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-014' },
      update: {},
      create: {
        name: 'Kevin Martin',
        licenseNumber: 'LIC-014',
        category: 'Heavy Vehicle',
        expiryDate: new Date('2026-08-31'),
        phone: '+1234567803',
        safetyScore: 96,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-015' },
      update: {},
      create: {
        name: 'Brian Thompson',
        licenseNumber: 'LIC-015',
        category: 'Light Vehicle',
        expiryDate: new Date('2027-10-31'),
        phone: '+1234567804',
        safetyScore: 84,
        status: 'AVAILABLE',
      },
    }),
  ])

  console.log('Drivers created:', drivers.length)

  // Create Trips
  const trips = await Promise.all([
    prisma.trip.upsert({
      where: { id: 'trip-001' },
      update: {},
      create: {
        id: 'trip-001',
        source: 'New York',
        destination: 'Boston',
        cargoWeight: 15000,
        distance: 340,
        status: 'COMPLETED',
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-002' },
      update: {},
      create: {
        id: 'trip-002',
        source: 'Los Angeles',
        destination: 'San Francisco',
        cargoWeight: 12000,
        distance: 380,
        status: 'COMPLETED',
        vehicleId: vehicles[1].id,
        driverId: drivers[1].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-003' },
      update: {},
      create: {
        id: 'trip-003',
        source: 'Chicago',
        destination: 'Detroit',
        cargoWeight: 18000,
        distance: 280,
        status: 'DISPATCHED',
        vehicleId: vehicles[2].id,
        driverId: drivers[2].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-004' },
      update: {},
      create: {
        id: 'trip-004',
        source: 'Miami',
        destination: 'Atlanta',
        cargoWeight: 2000,
        distance: 660,
        status: 'COMPLETED',
        vehicleId: vehicles[3].id,
        driverId: drivers[3].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-005' },
      update: {},
      create: {
        id: 'trip-005',
        source: 'Seattle',
        destination: 'Portland',
        cargoWeight: 2500,
        distance: 175,
        status: 'DRAFT',
        vehicleId: vehicles[5].id,
        driverId: drivers[4].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-006' },
      update: {},
      create: {
        id: 'trip-006',
        source: 'Denver',
        destination: 'Phoenix',
        cargoWeight: 22000,
        distance: 600,
        status: 'COMPLETED',
        vehicleId: vehicles[5].id,
        driverId: drivers[5].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-007' },
      update: {},
      create: {
        id: 'trip-007',
        source: 'Dallas',
        destination: 'Houston',
        cargoWeight: 16000,
        distance: 240,
        status: 'DISPATCHED',
        vehicleId: vehicles[6].id,
        driverId: drivers[7].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-008' },
      update: {},
      create: {
        id: 'trip-008',
        source: 'Philadelphia',
        destination: 'Washington DC',
        cargoWeight: 3000,
        distance: 140,
        status: 'COMPLETED',
        vehicleId: vehicles[7].id,
        driverId: drivers[8].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-009' },
      update: {},
      create: {
        id: 'trip-009',
        source: 'San Diego',
        destination: 'Los Angeles',
        cargoWeight: 3500,
        distance: 120,
        status: 'CANCELLED',
        vehicleId: vehicles[9].id,
        driverId: drivers[10].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-010' },
      update: {},
      create: {
        id: 'trip-010',
        source: 'Boston',
        destination: 'New York',
        cargoWeight: 14000,
        distance: 340,
        status: 'COMPLETED',
        vehicleId: vehicles[0].id,
        driverId: drivers[11].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-011' },
      update: {},
      create: {
        id: 'trip-011',
        source: 'Atlanta',
        destination: 'Nashville',
        cargoWeight: 11000,
        distance: 250,
        status: 'DRAFT',
        vehicleId: vehicles[1].id,
        driverId: drivers[12].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-012' },
      update: {},
      create: {
        id: 'trip-012',
        source: 'Phoenix',
        destination: 'Las Vegas',
        cargoWeight: 19000,
        distance: 300,
        status: 'DISPATCHED',
        vehicleId: vehicles[5].id,
        driverId: drivers[13].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-013' },
      update: {},
      create: {
        id: 'trip-013',
        source: 'Houston',
        destination: 'Austin',
        cargoWeight: 4000,
        distance: 165,
        status: 'COMPLETED',
        vehicleId: vehicles[7].id,
        driverId: drivers[14].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-014' },
      update: {},
      create: {
        id: 'trip-014',
        source: 'Detroit',
        destination: 'Chicago',
        cargoWeight: 17000,
        distance: 280,
        status: 'COMPLETED',
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-015' },
      update: {},
      create: {
        id: 'trip-015',
        source: 'San Francisco',
        destination: 'Los Angeles',
        cargoWeight: 13000,
        distance: 380,
        status: 'DISPATCHED',
        vehicleId: vehicles[1].id,
        driverId: drivers[1].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-016' },
      update: {},
      create: {
        id: 'trip-016',
        source: 'Portland',
        destination: 'Seattle',
        cargoWeight: 2800,
        distance: 175,
        status: 'DRAFT',
        vehicleId: vehicles[3].id,
        driverId: drivers[4].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-017' },
      update: {},
      create: {
        id: 'trip-017',
        source: 'Washington DC',
        destination: 'Philadelphia',
        cargoWeight: 3200,
        distance: 140,
        status: 'COMPLETED',
        vehicleId: vehicles[7].id,
        driverId: drivers[8].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-018' },
      update: {},
      create: {
        id: 'trip-018',
        source: 'Nashville',
        destination: 'Memphis',
        cargoWeight: 15000,
        distance: 210,
        status: 'CANCELLED',
        vehicleId: vehicles[6].id,
        driverId: drivers[7].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-019' },
      update: {},
      create: {
        id: 'trip-019',
        source: 'Las Vegas',
        destination: 'Phoenix',
        cargoWeight: 21000,
        distance: 300,
        status: 'COMPLETED',
        vehicleId: vehicles[5].id,
        driverId: drivers[13].id,
      },
    }),
    prisma.trip.upsert({
      where: { id: 'trip-020' },
      update: {},
      create: {
        id: 'trip-020',
        source: 'Austin',
        destination: 'Dallas',
        cargoWeight: 4500,
        distance: 265,
        status: 'DRAFT',
        vehicleId: vehicles[9].id,
        driverId: drivers[10].id,
      },
    }),
  ])

  console.log('Trips created:', trips.length)

  // Create Maintenance Logs
  const maintenanceLogs = await Promise.all([
    prisma.maintenanceLog.create({
      data: {
        type: 'Oil Change',
        description: 'Regular oil change and filter replacement',
        cost: 150,
        status: 'CLOSED',
        vehicleId: vehicles[0].id,
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        type: 'Brake Repair',
        description: 'Brake pad replacement',
        cost: 450,
        status: 'OPEN',
        vehicleId: vehicles[4].id,
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        type: 'Tire Replacement',
        description: 'All 4 tires replaced',
        cost: 1200,
        status: 'CLOSED',
        vehicleId: vehicles[1].id,
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        type: 'Engine Service',
        description: 'Major engine service',
        cost: 2500,
        status: 'OPEN',
        vehicleId: vehicles[2].id,
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        type: 'AC Repair',
        description: 'Air conditioning system repair',
        cost: 350,
        status: 'CLOSED',
        vehicleId: vehicles[3].id,
      },
    }),
  ])

  console.log('Maintenance logs created:', maintenanceLogs.length)

  // Create Fuel Logs
  const fuelLogs = await Promise.all([
    prisma.fuelLog.create({
      data: {
        date: new Date('2024-01-15'),
        fuel: 150,
        cost: 450,
        distance: 1200,
        efficiency: 8,
        vehicleId: vehicles[0].id,
      },
    }),
    prisma.fuelLog.create({
      data: {
        date: new Date('2024-01-20'),
        fuel: 180,
        cost: 540,
        distance: 1400,
        efficiency: 7.78,
        vehicleId: vehicles[1].id,
      },
    }),
    prisma.fuelLog.create({
      data: {
        date: new Date('2024-01-25'),
        fuel: 45,
        cost: 135,
        distance: 450,
        efficiency: 10,
        vehicleId: vehicles[3].id,
      },
    }),
    prisma.fuelLog.create({
      data: {
        date: new Date('2024-02-01'),
        fuel: 160,
        cost: 480,
        distance: 1280,
        efficiency: 8,
        vehicleId: vehicles[5].id,
      },
    }),
    prisma.fuelLog.create({
      data: {
        date: new Date('2024-02-05'),
        fuel: 50,
        cost: 150,
        distance: 500,
        efficiency: 10,
        vehicleId: vehicles[7].id,
      },
    }),
  ])

  console.log('Fuel logs created:', fuelLogs.length)

  // Create Expenses
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        type: 'Toll Payment',
        amount: 25,
        date: new Date('2024-01-15'),
        description: 'Highway toll charges',
        category: 'TOLL',
        vehicleId: vehicles[0].id,
      },
    }),
    prisma.expense.create({
      data: {
        type: 'Parking Fee',
        amount: 15,
        date: new Date('2024-01-18'),
        description: 'Overnight parking',
        category: 'OTHER',
        vehicleId: vehicles[1].id,
      },
    }),
    prisma.expense.create({
      data: {
        type: 'Wash Service',
        amount: 40,
        date: new Date('2024-01-22'),
        description: 'Vehicle wash and detailing',
        category: 'OTHER',
        vehicleId: vehicles[3].id,
      },
    }),
    prisma.expense.create({
      data: {
        type: 'Toll Payment',
        amount: 30,
        date: new Date('2024-02-01'),
        description: 'Bridge toll',
        category: 'TOLL',
        vehicleId: vehicles[5].id,
      },
    }),
    prisma.expense.create({
      data: {
        type: 'Insurance',
        amount: 200,
        date: new Date('2024-02-05'),
        description: 'Monthly insurance premium',
        category: 'OTHER',
        vehicleId: vehicles[7].id,
      },
    }),
  ])

  console.log('Expenses created:', expenses.length)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
