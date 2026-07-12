'use server'

import { prisma } from '@/lib/db'
import { vehicleSchema, vehicleUpdateSchema } from '@/schemas'
import { revalidatePath } from 'next/cache'
import { handleApiError, handleSuccess } from '@/lib/error-handler'

export async function getVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: vehicles }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getVehicle(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: true,
        maintenanceLogs: true,
        fuelLogs: true,
        expenses: true,
      },
    })
    if (!vehicle) {
      return { error: 'Vehicle not found' }
    }
    return { success: true, data: vehicle }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function createVehicle(data: unknown) {
  try {
    const validated = vehicleSchema.parse(data)
    
    // Check if registration number already exists
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: validated.registrationNumber },
    })
    
    if (existing) {
      return { error: 'Registration number already exists' }
    }
    
    const vehicle = await prisma.vehicle.create({
      data: validated,
    })
    
    revalidatePath('/vehicles')
    revalidatePath('/dashboard')
    return handleSuccess('Vehicle created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function updateVehicle(id: string, data: unknown) {
  try {
    const validated = vehicleUpdateSchema.parse(data)
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    })
    
    if (!vehicle) {
      return { error: 'Vehicle not found' }
    }
    
    // Prevent updating retired vehicles
    if (vehicle.status === 'RETIRED') {
      return { error: 'Cannot update retired vehicles' }
    }
    
    // Check if registration number is being changed and if it already exists
    if (validated.registrationNumber && validated.registrationNumber !== vehicle.registrationNumber) {
      const existing = await prisma.vehicle.findUnique({
        where: { registrationNumber: validated.registrationNumber },
      })
      
      if (existing) {
        return { error: 'Registration number already exists' }
      }
    }
    
    const updated = await prisma.vehicle.update({
      where: { id },
      data: validated,
    })
    
    revalidatePath('/vehicles')
    revalidatePath('/dashboard')
    return handleSuccess('Vehicle updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteVehicle(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: true,
      },
    })
    
    if (!vehicle) {
      return { error: 'Vehicle not found' }
    }
    
    // Prevent deleting vehicles with active trips
    const activeTrips = vehicle.trips.filter(t => t.status === 'DISPATCHED')
    if (activeTrips.length > 0) {
      return { error: 'Cannot delete vehicle with active trips' }
    }
    
    await prisma.vehicle.delete({
      where: { id },
    })
    
    revalidatePath('/vehicles')
    revalidatePath('/dashboard')
    return handleSuccess('Vehicle deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
