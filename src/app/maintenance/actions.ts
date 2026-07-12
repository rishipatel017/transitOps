'use server'

import { prisma } from '@/lib/db'
import { maintenanceSchema, maintenanceUpdateSchema } from '@/schemas'
import { revalidatePath } from 'next/cache'
import { handleApiError, handleSuccess } from '@/lib/error-handler'

export async function getMaintenanceLogs() {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      include: {
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: logs }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getMaintenanceLog(id: string) {
  try {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: {
        vehicle: true,
      },
    })
    if (!log) {
      return { error: 'Maintenance log not found' }
    }
    return { success: true, data: log }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function createMaintenanceLog(data: unknown) {
  try {
    const validated = maintenanceSchema.parse(data)
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validated.vehicleId },
    })
    
    if (!vehicle) {
      return { error: 'Vehicle not found' }
    }
    
    // Create maintenance log
    const log = await prisma.maintenanceLog.create({
      data: validated,
    })
    
    // If status is OPEN, set vehicle to IN_SHOP
    if (validated.status === 'OPEN') {
      await prisma.vehicle.update({
        where: { id: validated.vehicleId },
        data: { status: 'IN_SHOP' },
      })
    }
    
    revalidatePath('/maintenance')
    revalidatePath('/dashboard')
    return handleSuccess('Maintenance log created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function updateMaintenanceLog(id: string, data: unknown) {
  try {
    const validated = maintenanceUpdateSchema.parse(data)
    
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    })
    
    if (!log) {
      return { error: 'Maintenance log not found' }
    }
    
    // If status is changing to CLOSED, set vehicle back to AVAILABLE (unless retired)
    if (validated.status === 'CLOSED' && log.status === 'OPEN') {
      if (log.vehicle.status !== 'RETIRED') {
        await prisma.vehicle.update({
          where: { id: log.vehicleId },
          data: { status: 'AVAILABLE' },
        })
      }
    }
    
    const updated = await prisma.maintenanceLog.update({
      where: { id },
      data: validated,
    })
    
    revalidatePath('/maintenance')
    revalidatePath('/dashboard')
    return handleSuccess('Maintenance log updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteMaintenanceLog(id: string) {
  try {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
    })
    
    if (!log) {
      return { error: 'Maintenance log not found' }
    }
    
    await prisma.maintenanceLog.delete({
      where: { id },
    })
    
    revalidatePath('/maintenance')
    revalidatePath('/dashboard')
    return handleSuccess('Maintenance log deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
