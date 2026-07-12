import { z } from 'zod'

// User schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Vehicle schemas
export const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  model: z.string().min(1, 'Model is required'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  maxCapacity: z.number().min(1, 'Capacity must be greater than 0'),
  odometer: z.number().min(0, 'Odometer cannot be negative'),
  acquisitionCost: z.number().min(0, 'Acquisition cost cannot be negative'),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']),
})

export const vehicleUpdateSchema = vehicleSchema.partial()

// Driver schemas
export const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  category: z.string().min(1, 'Category is required'),
  expiryDate: z.string().refine((date) => {
    const expiry = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return expiry > today
  }, 'License must not be expired'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  safetyScore: z.number().min(0, 'Score must be at least 0').max(100, 'Score must be at most 100'),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED', 'EXPIRED_LICENSE']),
})

export const driverUpdateSchema = driverSchema.partial()

// Trip schemas
export const tripSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  cargoWeight: z.number().min(0, 'Cargo weight cannot be negative'),
  distance: z.number().min(0, 'Distance cannot be negative'),
  status: z.enum(['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED']),
})

export const tripDispatchSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
})

export const tripCompleteSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
})

export const tripCancelSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
})

// Maintenance schemas
export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
  cost: z.number().min(0, 'Cost cannot be negative'),
  status: z.enum(['OPEN', 'CLOSED']),
})

export const maintenanceUpdateSchema = maintenanceSchema.partial()

// Fuel schemas
export const fuelSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  date: z.string().min(1, 'Date is required'),
  fuel: z.number().min(0, 'Fuel amount cannot be negative'),
  cost: z.number().min(0, 'Cost cannot be negative'),
  distance: z.number().min(0, 'Distance cannot be negative'),
})

// Expense schemas
export const expenseSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  type: z.string().min(1, 'Type is required'),
  amount: z.number().min(0, 'Amount cannot be negative'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['FUEL', 'MAINTENANCE', 'TOLL', 'OTHER']),
})

export const expenseUpdateSchema = expenseSchema.partial()
