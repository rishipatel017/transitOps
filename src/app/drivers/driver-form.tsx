'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { driverSchema, driverUpdateSchema } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createDriver, updateDriver } from './actions'
import { Driver } from '@prisma/client'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface DriverFormProps {
  driver?: Driver | null
  onClose: () => void
}

export default function DriverForm({ driver, onClose }: DriverFormProps) {
  const isEditing = !!driver
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEditing ? driverUpdateSchema : driverSchema),
    defaultValues: driver || {
      name: '',
      licenseNumber: '',
      category: '',
      expiryDate: '',
      phone: '',
      safetyScore: 100,
      status: 'AVAILABLE',
    },
  })

  useEffect(() => {
    if (driver) {
      setValue('name', driver.name)
      setValue('licenseNumber', driver.licenseNumber)
      setValue('category', driver.category)
      setValue('expiryDate', format(new Date(driver.expiryDate), 'yyyy-MM-dd'))
      setValue('phone', driver.phone)
      setValue('safetyScore', driver.safetyScore)
      setValue('status', driver.status)
    }
  }, [driver, setValue])

  const onSubmit = async (data: any) => {
    try {
      const result = isEditing
        ? await updateDriver(driver.id, data)
        : await createDriver(data)

      if (result.success) {
        toast.success(isEditing ? 'Driver updated successfully' : 'Driver created successfully')
        onClose()
      } else {
        toast.error(result.error || 'Failed to save driver')
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
              <CardTitle>{isEditing ? 'Edit Driver' : 'Add New Driver'}</CardTitle>
              <CardDescription>
                {isEditing ? 'Update driver information' : 'Add a new driver to your fleet'}
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
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message?.toString()}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number *</Label>
                <Input
                  id="licenseNumber"
                  {...register('licenseNumber')}
                  disabled={isEditing}
                  placeholder="LIC-001"
                />
                {errors.licenseNumber && (
                  <p className="text-sm text-red-500">{errors.licenseNumber.message?.toString()}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="Heavy Vehicle"
                />
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message?.toString()}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+1234567890"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message?.toString()}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">License Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  {...register('expiryDate')}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-red-500">{errors.expiryDate.message?.toString()}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="safetyScore">Safety Score (0-100) *</Label>
                <Input
                  id="safetyScore"
                  type="number"
                  {...register('safetyScore', { valueAsNumber: true })}
                  placeholder="100"
                  min={0}
                  max={100}
                />
                {errors.safetyScore && (
                  <p className="text-sm text-red-500">{errors.safetyScore.message?.toString()}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                defaultValue={driver?.status || 'AVAILABLE'}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="ON_TRIP">On Trip</SelectItem>
                  <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="EXPIRED_LICENSE">Expired License</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message?.toString()}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Driver' : 'Create Driver'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
