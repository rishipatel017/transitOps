import prismaClientPkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { 
  DEFAULT_VEHICLES, 
  DEFAULT_DRIVERS, 
  DEFAULT_TRIPS, 
  DEFAULT_MAINTENANCE, 
  DEFAULT_FUEL, 
  DEFAULT_EXPENSES, 
  SYSTEM_USERS,
  AVAILABLE_ROLES
} from '../src/data';

// Load environment variables
dotenv.config();

const { PrismaClient } = prismaClientPkg;

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding TransitOps database...\n');

  // 1. ROLES
  console.log('  → Seeding roles...');
  const roles = await Promise.all(
    AVAILABLE_ROLES.map(roleName => 
      prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: {
          name: roleName,
          description: `System role for ${roleName}`
        }
      })
    )
  );
  console.log(`     ✅ ${roles.length} roles seeded`);

  const roleMap: Record<string, number> = {};
  for (const role of roles) roleMap[role.name] = role.id;

  // 2. USERS
  console.log('  → Seeding users...');
  for (const u of SYSTEM_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, avatarUrl: u.avatarUrl },
      create: {
        email: u.email,
        name: u.name,
        password: 'password123',
        avatarUrl: u.avatarUrl,
        roleId: roleMap[u.role]
      }
    });
  }
  console.log(`     ✅ ${SYSTEM_USERS.length} users seeded`);

  // 3. VEHICLES
  console.log('  → Seeding vehicles...');
  for (const v of DEFAULT_VEHICLES) {
    await prisma.vehicle.upsert({
      where: { registrationNumber: v.registrationNumber },
      update: { name: v.name, nickname: v.nickname, status: v.status.replace(" ", "") as any },
      create: {
        ...v,
        status: v.status.replace(" ", "") as any
      }
    });
  }
  console.log(`     ✅ ${DEFAULT_VEHICLES.length} vehicles seeded`);

  // 4. DRIVERS
  console.log('  → Seeding drivers...');
  for (const d of DEFAULT_DRIVERS) {
    await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: {
        name: d.name,
        contactNumber: d.contactNumber,
        safetyScore: d.safetyScore,
        status: d.status.replace(" ", "") as any
      },
      create: {
        ...d,
        status: d.status.replace(" ", "") as any
      }
    });
  }
  console.log(`     ✅ ${DEFAULT_DRIVERS.length} drivers seeded`);

  // 5. TRIPS
  console.log('  → Seeding trips...');
  for (const t of DEFAULT_TRIPS) {
    await prisma.trip.upsert({
      where: { id: t.id },
      update: { status: t.status, revenue: t.revenue },
      create: {
        ...t,
        fuelConsumedLiters: t.fuelConsumedLiters || null,
        finalOdometer: t.finalOdometer || null
      }
    });
  }
  console.log(`     ✅ ${DEFAULT_TRIPS.length} trips seeded`);

  // 6. MAINTENANCE
  console.log('  → Seeding maintenance logs...');
  
  function getServiceType(typeStr: string): any {
    const clean = typeStr.replace(/ \& /g, "").replace(/ /g, "");
    const validTypes = ["OilChange", "BrakeCheck", "EngineRepair", "TireReplacement", "RoutineInspection", "OilChangeFilter", "EngineOverhaul", "TireAlignment"];
    if (validTypes.includes(clean)) return clean;
    return "RoutineInspection";
  }

  for (const m of DEFAULT_MAINTENANCE) {
    await prisma.maintenanceLog.upsert({
      where: { id: m.id },
      update: { status: m.status },
      create: {
        ...m,
        serviceType: getServiceType(m.serviceType)
      }
    });
  }
  console.log(`     ✅ ${DEFAULT_MAINTENANCE.length} maintenance logs seeded`);

  // 7. FUEL
  console.log('  → Seeding fuel logs...');
  for (const f of DEFAULT_FUEL) {
    await prisma.fuelLog.upsert({
      where: { id: f.id },
      update: { status: f.status },
      create: f
    });
  }
  console.log(`     ✅ ${DEFAULT_FUEL.length} fuel logs seeded`);

  // 8. EXPENSES
  console.log('  → Seeding expenses...');
  for (const e of DEFAULT_EXPENSES) {
    await prisma.expense.upsert({
      where: { id: e.id },
      update: {},
      create: e
    });
  }
  console.log(`     ✅ ${DEFAULT_EXPENSES.length} expenses seeded`);

  console.log('\n✅ Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
