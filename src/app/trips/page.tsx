'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getTrips, deleteTrip, dispatchTrip, completeTrip, cancelTrip } from './actions'
import { Trip } from '@prisma/client'
import { Trash2, Plus, Search, Play, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import TripForm from './trip-form'
import { format } from 'date-fns'

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadTrips()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = trips.filter(t => 
        t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTrips(filtered)
    } else {
      setFilteredTrips(trips)
    }
  }, [searchTerm, trips])

  const loadTrips = async () => {
    setLoading(true)
    const result = await getTrips()
    if (result.success) {
      setTrips(result.data)
      setFilteredTrips(result.data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      const result = await deleteTrip(id)
      if (result.success) {
        toast.success('Trip deleted successfully')
        loadTrips()
      } else {
        toast.error(result.error || 'Failed to delete trip')
      }
    }
  }

  const handleDispatch = async (id: string) => {
    const result = await dispatchTrip(id)
    if (result.success) {
      toast.success('Trip dispatched successfully')
      loadTrips()
    } else {
      toast.error(result.error || 'Failed to dispatch trip')
    }
  }

  const handleComplete = async (id: string) => {
    const result = await completeTrip(id)
    if (result.success) {
      toast.success('Trip completed successfully')
      loadTrips()
    } else {
      toast.error(result.error || 'Failed to complete trip')
    }
  }

  const handleCancel = async (id: string) => {
    const result = await cancelTrip(id)
    if (result.success) {
      toast.success('Trip cancelled successfully')
      loadTrips()
    } else {
      toast.error(result.error || 'Failed to cancel trip')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'DISPATCHED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
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
          <h1 className="text-3xl font-bold">Trips</h1>
          <p className="text-gray-600">Manage fleet trips and dispatches</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" />
          Create Trip
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Trip Management</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <CardDescription>
            Total trips: {filteredTrips.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Cargo (kg)</TableHead>
                <TableHead>Distance (km)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">{trip.source}</TableCell>
                  <TableCell>{trip.destination}</TableCell>
                  <TableCell>{trip.vehicle?.registrationNumber || 'N/A'}</TableCell>
                  <TableCell>{trip.driver?.name || 'N/A'}</TableCell>
                  <TableCell>{trip.cargoWeight.toLocaleString()}</TableCell>
                  <TableCell>{trip.distance.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {trip.status === 'DRAFT' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDispatch(trip.id)}
                          title="Dispatch"
                        >
                          <Play className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {trip.status === 'DISPATCHED' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleComplete(trip.id)}
                            title="Complete"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancel(trip.id)}
                            title="Cancel"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {(trip.status === 'DRAFT' || trip.status === 'CANCELLED') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(trip.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showForm && (
        <TripForm
          onClose={() => {
            setShowForm(false)
            loadTrips()
          }}
        />
      )}
    </div>
  )
}
