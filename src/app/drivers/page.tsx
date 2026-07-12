'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getDrivers, deleteDriver } from './actions'
import { Driver } from '@prisma/client'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import DriverForm from './driver-form'
import { format } from 'date-fns'

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)

  useEffect(() => {
    loadDrivers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = drivers.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredDrivers(filtered)
    } else {
      setFilteredDrivers(drivers)
    }
  }, [searchTerm, drivers])

  const loadDrivers = async () => {
    setLoading(true)
    const result = await getDrivers()
    if (result.success) {
      setDrivers(result.data)
      setFilteredDrivers(result.data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      const result = await deleteDriver(id)
      if (result.success) {
        toast.success('Driver deleted successfully')
        loadDrivers()
      } else {
        toast.error(result.error || 'Failed to delete driver')
      }
    }
  }

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingDriver(null)
    loadDrivers()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'ON_TRIP': return 'bg-blue-100 text-blue-800'
      case 'OFF_DUTY': return 'bg-gray-100 text-gray-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      case 'EXPIRED_LICENSE': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Drivers</h1>
          <p className="text-gray-600">Manage your fleet drivers</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Driver Roster</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <CardDescription>
            Total drivers: {filteredDrivers.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>License Expiry</TableHead>
                <TableHead>Safety Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.licenseNumber}</TableCell>
                  <TableCell>{driver.category}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell>{format(new Date(driver.expiryDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className={`font-semibold ${getSafetyScoreColor(driver.safetyScore)}`}>
                    {driver.safetyScore}/100
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(driver)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(driver.id)}
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
        <DriverForm
          driver={editingDriver}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
