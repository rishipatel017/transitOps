'use server'

import { prisma } from '@/lib/db'
import { fuelSchema } from '@/schemas'
import { revalidatePath } from 'next/cache'
import { handleApiError, handleSuccess } from '@/lib/error-handler'

export async function getFuelLogs() {
  try {
    const logs = await prisma.fuelLog.findMany({
      include: {
        vehicle: true,
      },
      orderBy: { date: 'desc' },
    })
    return { success: true, data: logs }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getFuelLog(id: string) {
  try {
    const log = await prisma.fuelLog.findUnique({
      where: { id },
      include: {
        vehicle: true,
      },
    })
    if (!log) {
      return { error: 'Fuel log not found' }
    }
    return { success: true, data: log }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function createFuelLog(data: unknown) {
  try {
    const validated = fuelSchema.parse(data)
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validated.vehicleId },
    })
    
    if (!vehicle) {
      return { error: 'Vehicle not found' }
    }
    
    // Auto-compute fuel efficiency (distance/fuel)
    const efficiency = validated.fuel > 0 ? validated.distance / validated.fuel : 0
    
    const log = await prisma.fuelLog.create({
      data: {
        ...validated,
        date: new Date(validated.date),
        efficiency,
      },
    })
    
    revalidatePath('/fuel')
    revalidatePath('/dashboard')
    return handleSuccess('Fuel log created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteFuelLog(id: string) {
  try {
    const log = await prisma.fuelLog.findUnique({
      where: { id },
    })
    
    if (!log) {
      return { error: 'Fuel log not found' }
    }
    
    await prisma.fuelLog.delete({
      where: { id },
    })
    
    revalidatePath('/fuel')
    revalidatePath('/dashboard')
    return handleSuccess('Fuel log deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
