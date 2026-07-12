'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vehicleSchema, vehicleUpdateSchema } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createVehicle, updateVehicle } from './actions'
import { Vehicle } from '@prisma/client'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface VehicleFormProps {
  vehicle?: Vehicle | null
  onClose: () => void
}

export default function VehicleForm({ vehicle, onClose }: VehicleFormProps) {
  const isEditing = !!vehicle
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEditing ? vehicleUpdateSchema : vehicleSchema),
    defaultValues: vehicle || {
      registrationNumber: '',
      model: '',
      vehicleType: '',
      maxCapacity: 0,
      odometer: 0,
      acquisitionCost: 0,
      status: 'AVAILABLE',
    },
  })

  useEffect(() => {
    if (vehicle) {
      setValue('registrationNumber', vehicle.registrationNumber)
      setValue('model', vehicle.model)
      setValue('vehicleType', vehicle.vehicleType)
      setValue('maxCapacity', vehicle.maxCapacity)
      setValue('odometer', vehicle.odometer)
      setValue('acquisitionCost', vehicle.acquisitionCost)
      setValue('status', vehicle.status)
    }
  }, [vehicle, setValue])

  const onSubmit = async (data: any) => {
    try {
      const result = isEditing
        ? await updateVehicle(vehicle.id, data)
        : await createVehicle(data)

      if (result.success) {
        toast.success(isEditing ? 'Vehicle updated successfully' : 'Vehicle created successfully')
        onClose()
      } else {
        toast.error(result.error || 'Failed to save vehicle')
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
              <CardTitle>{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</CardTitle>
              <CardDescription>
                {isEditing ? 'Update vehicle information' : 'Add a new vehicle to your fleet'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number *</Label>
                <Input
                  id="registrationNumber"
                  {...register('registrationNumber')}
                  disabled={isEditing}
                  placeholder="TRK-001"
                />
                {errors.registrationNumber && (
                  <p className="text-sm text-red-500">{errors.registrationNumber.message?.toString()}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  {...register('model')}
                  placeholder="Volvo FH16"
                />
                {errors.model && (
                  <p className="text-sm text-red-500">{errors.model.message?.toString()}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <Input
                  id="vehicleType"
                  {...register('vehicleType')}
                  placeholder="Truck"
                />
                {errors.vehicleType && (
                  <p className="text-sm text-red-500">{errors.vehicleType.message?.toString()}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  defaultValue={vehicle?.status || 'AVAILABLE'}
                  onValueChange={(value) => setValue('status', value)}
                  disabled={isEditing && vehicle?.status === 'RETIRED'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="ON_TRIP">On Trip</SelectItem>
                    <SelectItem value="IN_SHOP">In Shop</SelectItem>
                    <SelectItem value="RETIRED">Retired</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message?.toString()}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Max Capacity (kg) *</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  {...register('maxCapacity', { valueAsNumber: true })}
                  placeholder="25000"
                />
                {errors.maxCapacity && (
                  <p className="text-sm text-red-500">{errors.maxCapacity.message?.toString()}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="odometer">Odometer (km) *</Label>
                <Input
                  id="odometer"
                  type="number"
                  {...register('odometer', { valueAsNumber: true })}
                  placeholder="150000"
                />
                {errors.odometer && (
                  <p className="text-sm text-red-500">{errors.odometer.message?.toString()}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="acquisitionCost">Acquisition Cost ($) *</Label>
                <Input
                  id="acquisitionCost"
                  type="number"
                  step="0.01"
                  {...register('acquisitionCost', { valueAsNumber: true })}
                  placeholder="120000"
                />
                {errors.acquisitionCost && (
                  <p className="text-sm text-red-500">{errors.acquisitionCost.message?.toString()}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Vehicle' : 'Create Vehicle'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
