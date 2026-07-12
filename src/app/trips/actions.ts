'use server'

import { prisma } from '@/lib/db'
import { tripSchema } from '@/schemas'
import { revalidatePath } from 'next/cache'
import { handleApiError, handleSuccess } from '@/lib/error-handler'

export async function getTrips() {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: trips }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getTrip(id: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
      },
    })
    if (!trip) {
      return { error: 'Trip not found' }
    }
    return { success: true, data: trip }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function createTrip(data: unknown) {
  try {
    const validated = tripSchema.parse(data)
    
    // Get vehicle and driver
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validated.vehicleId },
    })
    
    const driver = await prisma.driver.findUnique({
      where: { id: validated.driverId },
    })
    
    if (!vehicle) {
      return { error: 'Vehicle not found' }
    }
    
    if (!driver) {
      return { error: 'Driver not found' }
    }
    
    // Validation rules
    if (vehicle.status === 'RETIRED') {
      return { error: 'Cannot use retired vehicle' }
    }
    
    if (vehicle.status === 'IN_SHOP') {
      return { error: 'Vehicle is in shop and unavailable' }
    }
    
    if (vehicle.status === 'ON_TRIP') {
      return { error: 'Vehicle is already on a trip' }
    }
    
    if (driver.status === 'SUSPENDED') {
      return { error: 'Driver is suspended and cannot be dispatched' }
    }
    
    if (driver.status === 'EXPIRED_LICENSE') {
      return { error: 'Driver has expired license' }
    }
    
    if (driver.status === 'ON_TRIP') {
      return { error: 'Driver is already on a trip' }
    }
    
    // Check license expiry
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (driver.expiryDate <= today) {
      return { error: 'Driver license has expired' }
    }
    
    // Check cargo weight against vehicle capacity
    if (validated.cargoWeight > vehicle.maxCapacity) {
      return { error: `Cargo weight exceeds vehicle capacity (${vehicle.maxCapacity}kg)` }
    }
    
    const trip = await prisma.trip.create({
      data: {
        ...validated,
        status: 'DRAFT',
      },
    })
    
    revalidatePath('/trips')
    revalidatePath('/dashboard')
    return handleSuccess('Trip created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function dispatchTrip(tripId: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        vehicle: true,
        driver: true,
      },
    })
    
    if (!trip) {
      return { error: 'Trip not found' }
    }
    
    if (trip.status !== 'DRAFT') {
      return { error: 'Only draft trips can be dispatched' }
    }
    
    // Re-validate before dispatching
    if (trip.vehicle.status === 'RETIRED' || trip.vehicle.status === 'IN_SHOP' || trip.vehicle.status === 'ON_TRIP') {
      return { error: 'Vehicle is not available for dispatch' }
    }
    
    if (trip.driver.status === 'SUSPENDED' || trip.driver.status === 'EXPIRED_LICENSE' || trip.driver.status === 'ON_TRIP') {
      return { error: 'Driver is not available for dispatch' }
    }
    
    // Update trip status and vehicle/driver status
    await prisma.$transaction([
      prisma.trip.update({
        where: { id: tripId },
        data: { status: 'DISPATCHED' },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'ON_TRIP' },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: 'ON_TRIP' },
      }),
    ])
    
    revalidatePath('/trips')
    revalidatePath('/dashboard')
    return handleSuccess('Trip dispatched successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function completeTrip(tripId: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })
    
    if (!trip) {
      return { error: 'Trip not found' }
    }
    
    if (trip.status !== 'DISPATCHED') {
      return { error: 'Only dispatched trips can be completed' }
    }
    
    // Update trip status and vehicle/driver status back to available
    await prisma.$transaction([
      prisma.trip.update({
        where: { id: tripId },
        data: { status: 'COMPLETED' },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE' },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' },
      }),
    ])
    
    revalidatePath('/trips')
    revalidatePath('/dashboard')
    return handleSuccess('Trip completed successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function cancelTrip(tripId: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })
    
    if (!trip) {
      return { error: 'Trip not found' }
    }
    
    if (trip.status === 'COMPLETED') {
      return { error: 'Cannot cancel completed trips' }
    }
    
    // Update trip status and vehicle/driver status back to available
    await prisma.$transaction([
      prisma.trip.update({
        where: { id: tripId },
        data: { status: 'CANCELLED' },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE' },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' },
      }),
    ])
    
    revalidatePath('/trips')
    revalidatePath('/dashboard')
    return handleSuccess('Trip cancelled successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteTrip(id: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
    })
    
    if (!trip) {
      return { error: 'Trip not found' }
    }
    
    if (trip.status === 'DISPATCHED') {
      return { error: 'Cannot delete dispatched trips' }
    }
    
    await prisma.trip.delete({
      where: { id },
    })
    
    revalidatePath('/trips')
    revalidatePath('/dashboard')
    return handleSuccess('Trip deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
