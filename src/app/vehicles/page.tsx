'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getVehicles, deleteVehicle } from './actions'
import { Vehicle } from '@prisma/client'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import VehicleForm from './vehicle-form'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = vehicles.filter(v => 
        v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredVehicles(filtered)
    } else {
      setFilteredVehicles(vehicles)
    }
  }, [searchTerm, vehicles])

  const loadVehicles = async () => {
    setLoading(true)
    const result = await getVehicles()
    if (result.success) {
      setVehicles(result.data)
      setFilteredVehicles(result.data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      const result = await deleteVehicle(id)
      if (result.success) {
        toast.success('Vehicle deleted successfully')
        loadVehicles()
      } else {
        toast.error(result.error || 'Failed to delete vehicle')
      }
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingVehicle(null)
    loadVehicles()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'ON_TRIP': return 'bg-blue-100 text-blue-800'
      case 'IN_SHOP': return 'bg-yellow-100 text-yellow-800'
      case 'RETIRED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-gray-600">Manage your fleet vehicles</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Vehicle Fleet</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <CardDescription>
            Total vehicles: {filteredVehicles.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Registration</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity (kg)</TableHead>
                <TableHead>Odometer (km)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.registrationNumber}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.vehicleType}</TableCell>
                  <TableCell>{vehicle.maxCapacity.toLocaleString()}</TableCell>
                  <TableCell>{vehicle.odometer.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(vehicle)}
                        disabled={vehicle.status === 'RETIRED'}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(vehicle.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showForm && (
        <VehicleForm
          vehicle={editingVehicle}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
