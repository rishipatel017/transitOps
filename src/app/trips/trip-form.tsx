'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tripSchema } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTrip } from './actions'
import { prisma } from '@/lib/db'
import { Vehicle, Driver } from '@prisma/client'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface TripFormProps {
  onClose: () => void
}

export default function TripForm({ onClose }: TripFormProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      source: '',
      destination: '',
      vehicleId: '',
      driverId: '',
      cargoWeight: 0,
      distance: 0,
      status: 'DRAFT',
    },
  })

  useEffect(() => {
    loadAvailableResources()
  }, [])

  const loadAvailableResources = async () => {
    setLoading(true)
    try {
      const [vehiclesData, driversData] = await Promise.all([
        prisma.vehicle.findMany({
          where: {
            status: { in: ['AVAILABLE'] },
          },
        }),
        prisma.driver.findMany({
          where: {
            status: { in: ['AVAILABLE'] },
          },
        }),
      ])
      setVehicles(vehiclesData)
      setDrivers(driversData)
    } catch (error) {
      toast.error('Failed to load available resources')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: any) => {
    try {
      const result = await createTrip(data)
      if (result.success) {
        toast.success('Trip created successfully')
        onClose()
      } else {
        toast.error(result.error || 'Failed to create trip')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Create New Trip</CardTitle>
              <CardDescription>
                Create a new trip and assign vehicle and driver
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source *</Label>
                  <Input
                    id="source"
                    {...register('source')}
                    placeholder="New York"
                  />
                  {errors.source && (
                    <p className="text-sm text-red-500">{errors.source.message?.toString()}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Input
                    id="destination"
                    {...register('destination')}
                    placeholder="Boston"
                  />
                  {errors.destination && (
                    <p className="text-sm text-red-500">{errors.destination.message?.toString()}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleId">Vehicle *</Label>
                  <Select
                    onValueChange={(value) => setValue('vehicleId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.registrationNumber} - {vehicle.model} ({vehicle.maxCapacity}kg)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vehicleId && (
                    <p className="text-sm text-red-500">{errors.vehicleId.message?.toString()}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverId">Driver *</Label>
                  <Select
                    onValueChange={(value) => setValue('driverId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - {driver.licenseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.driverId && (
                    <p className="text-sm text-red-500">{errors.driverId.message?.toString()}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargoWeight">Cargo Weight (kg) *</Label>
                  <Input
                    id="cargoWeight"
                    type="number"
                    {...register('cargoWeight', { valueAsNumber: true })}
                    placeholder="15000"
                  />
                  {errors.cargoWeight && (
                    <p className="text-sm text-red-500">{errors.cargoWeight.message?.toString()}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km) *</Label>
                  <Input
                    id="distance"
                    type="number"
                    {...register('distance', { valueAsNumber: true })}
                    placeholder="340"
                  />
                  {errors.distance && (
                    <p className="text-sm text-red-500">{errors.distance.message?.toString()}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Trip
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
