'use server'

import { prisma } from '@/lib/db'
import { driverSchema, driverUpdateSchema } from '@/schemas'
import { revalidatePath } from 'next/cache'
import { handleApiError, handleSuccess } from '@/lib/error-handler'

export async function getDrivers() {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy:{ createdAt: 'desc' },
    })
    return { success: true, data: drivers }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getDriver(id: string) {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        trips: true,
      },
    })
    if (!driver) {
      return { error: 'Driver not found' }
    }
    return { success: true, data: driver }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function createDriver(data: unknown) {
  try {
    const validated = driverSchema.parse(data)
    
    // Check if license number already exists
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: validated.licenseNumber },
    })
    
    if (existing) {
      return { error: 'License number already exists' }
    }
    
    const driver = await prisma.driver.create({
      data: {
        ...validated,
        expiryDate: new Date(validated.expiryDate),
      },
    })
    
    revalidatePath('/drivers')
    revalidatePath('/dashboard')
    return handleSuccess('Driver created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function updateDriver(id: string, data: unknown) {
  try {
    const validated = driverUpdateSchema.parse(data)
    
    const driver = await prisma.driver.findUnique({
      where: { id },
    })
    
    if (!driver) {
      return { error: 'Driver not found' }
    }
    
    // Check if license number is being changed and if it already exists
    if (validated.licenseNumber && validated.licenseNumber !== driver.licenseNumber) {
      const existing = await prisma.driver.findUnique({
        where: { licenseNumber: validated.licenseNumber },
      })
      
      if (existing) {
        return { error: 'License number already exists' }
      }
    }
    
    const updated = await prisma.driver.update({
      where: { id },
      data: {
        ...validated,
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : undefined,
      },
    })
    
    revalidatePath('/drivers')
    revalidatePath('/dashboard')
    return handleSuccess('Driver updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteDriver(id: string) {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        trips: true,
      },
    })
    
    if (!driver) {
      return { error: 'Driver not found' }
    }
    
    // Prevent deleting drivers with active trips
    const activeTrips = driver.trips.filter(t => t.status === 'DISPATCHED')
    if (activeTrips.length > 0) {
      return { error: 'Cannot delete driver with active trips' }
    }
    
    await prisma.driver.delete({
      where: { id },
    })
    
    revalidatePath('/drivers')
    revalidatePath('/dashboard')
    return handleSuccess('Driver deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
