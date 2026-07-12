import React, { useState } from 'react';
import { Trip, Vehicle, Driver } from '../types';
import { 
  Plus, 
  Navigation, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Calendar, 
  Truck, 
  User, 
  AlertTriangle,
  Info,
  X,
  Scale
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface TripsViewProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onAddTrip: (trip: Trip) => void;
  onDispatchTrip: (id: string) => void;
  onCompleteTrip: (id: string, fuelConsumed: number, finalOdometer: number) => void;
  onCancelTrip: (id: string) => void;
  currentRole?: string;
  currencySymbol?: string;
}

export const TripsView: React.FC<TripsViewProps> = ({
  trips,
  vehicles,
  drivers,
  onAddTrip,
  onDispatchTrip,
  onCompleteTrip,
  onCancelTrip,
  currentRole,
  currencySymbol = '$'
}) => {
  const toast = useToast();
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  const [completingTripId, setCompletingTripId] = useState<string | null>(null);
  const [abortConfirm, setAbortConfirm] = useState<string | null>(null); // tripId to abort

  // Form states - New Trip
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState(2500);
  const [plannedDistance, setPlannedDistance] = useState(200);
  const [routeName, setRouteName] = useState('');
  const [estRevenue, setEstRevenue] = useState(1200);

  // Form states - Completing Trip
  const [fuelConsumed, setFuelConsumed] = useState(50);
  const [finalOdometer, setFinalOdometer] = useState(0);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled'>('All');

  // Error messaging for validation
  const [errorMsg, setErrorMsg] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Validation function for new trip creation
  const handleCreateTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!source.trim() || !destination.trim() || !selectedVehicleId || !selectedDriverId) {
      setErrorMsg("Please fill in all routing, asset, and crew selections.");
      return;
    }

    const vehicle = vehicles.find(v => v.registrationNumber === selectedVehicleId);
    const driver = drivers.find(d => d.licenseNumber === selectedDriverId);

    if (!vehicle || !driver) {
      setErrorMsg("Invalid fleet or crew assets selected.");
      return;
    }

    // Rule 1: Vehicle availability
    if (vehicle.status !== 'Available') {
      setErrorMsg(`Vehicle ${vehicle.registrationNumber} (${vehicle.nickname || vehicle.name}) is current classified as "${vehicle.status}". It is unavailable for dispatch.`);
      return;
    }

    // Rule 2: Driver availability & license sanity
    if (driver.status !== 'Available') {
      setErrorMsg(`Driver ${driver.name} is currently classified as "${driver.status}". They are unavailable for this trip.`);
      return;
    }

    // Rule 3: Cargo weight capacity check
    if (Number(cargoWeight) > vehicle.maxCapacity) {
      setErrorMsg(`Capacity Exceeded! The cargo weight (${cargoWeight.toLocaleString()} kg) exceeds the vehicle's maximum registered load limit (${vehicle.maxCapacity.toLocaleString()} kg).`);
      return;
    }

    // Rule 4: Driver License Category match
    const needsHMV = vehicle.type === 'Truck';
    const hasHMV = driver.licenseCategory === 'HMV';
    if (needsHMV && !hasHMV) {
      setErrorMsg(`Safety Violation! Deployed asset requires a heavy transport operator (HMV). ${driver.name} only holds an LMV permit.`);
      return;
    }

    // Rule 5: Driver License Expiry check
    const isExpired = new Date(driver.licenseExpiryDate) < new Date(todayStr);
    if (isExpired) {
      setErrorMsg(`Compliance Violation! ${driver.name}'s operating license expired on ${driver.licenseExpiryDate}. Dispatch blocked by regulatory authority.`);
      return;
    }

    const newTrip: Trip = {
      id: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      source: source.trim(),
      destination: destination.trim(),
      vehicleId: selectedVehicleId,
      driverId: selectedDriverId,
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance),
      status: 'Draft',
      eta: 'Pending Dispatch',
      routeName: routeName.trim() || `${source.trim()} to ${destination.trim()}`,
      revenue: Number(estRevenue),
      date: todayStr
    };

    onAddTrip(newTrip);
    toast.success('Trip Created', `Draft trip ${newTrip.id} is ready for dispatch.`);

    // Reset Form
    setSource('');
    setDestination('');
    setSelectedVehicleId('');
    setSelectedDriverId('');
    setRouteName('');
    setCargoWeight(2500);
    setPlannedDistance(200);
    setEstRevenue(1200);
    setIsNewTripOpen(false);
  };

  const handleOpenCompleteTripModal = (trip: Trip) => {
    const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleId);
    setCompletingTripId(trip.id);
    setFuelConsumed(Math.round(trip.plannedDistance * 0.25)); // Estimate 25 liters per 100km
    setFinalOdometer((vehicle?.odometer || 0) + trip.plannedDistance);
  };

  const handleCompleteTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTripId) return;

    const trip = trips.find(t => t.id === completingTripId);
    if (!trip) return;

    const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleId);
    if (vehicle && Number(finalOdometer) < vehicle.odometer) {
      toast.error(
        'Invalid Odometer Reading',
        `Final odometer (${Number(finalOdometer).toLocaleString()} km) cannot be less than starting odometer (${vehicle.odometer.toLocaleString()} km).`
      );
      return;
    }

    onCompleteTrip(completingTripId, Number(fuelConsumed), Number(finalOdometer));
    toast.success('Trip Completed', `Transit ${completingTripId} settled. Vehicle and driver are now available.`);
    setCompletingTripId(null);
  };

  const filteredTrips = trips.filter(t => statusFilter === 'All' || t.status === statusFilter);

  return (
    <div className="space-y-6" id="trips-section">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="trips-header">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Trip Dispatch Center</h2>
          <p className="text-xs text-brand-secondary">Configure source depots, verify load thresholds, perform crew audits, and track route progress.</p>
        </div>
        {currentRole !== 'Driver' && (
          <button 
            onClick={() => {
              setErrorMsg('');
              setIsNewTripOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-black rounded-lg font-semibold font-mono text-xs hover:bg-white transition-all shadow-lg shadow-brand-primary/10"
          >
            <Plus className="h-4 w-4" /> CREATE TRIP DISPATCH
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="p-4 bg-brand-surface rounded-xl border border-brand-outline flex items-center justify-between" id="trips-filters">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-gray-500 uppercase tracking-wider">Trip State:</span>
          <div className="flex rounded-md bg-brand-surface-lowest p-1 border border-brand-outline/40">
            {(['All', 'Draft', 'Dispatched', 'Completed', 'Cancelled'] as const).map(state => (
              <button
                key={state}
                onClick={() => setStatusFilter(state)}
                className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                  statusFilter === state 
                    ? 'bg-brand-primary text-black' 
                    : 'text-brand-secondary hover:text-white'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs text-brand-secondary font-mono hidden md:inline">Showing {filteredTrips.length} entries</span>
      </div>

      {/* Trips Cards Stack */}
      <div className="space-y-4" id="trips-cards-list">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-16 bg-brand-surface/20 rounded-2xl border border-brand-outline/40">
            <Navigation className="h-10 w-10 text-brand-outline mx-auto mb-3" />
            <p className="text-sm text-brand-secondary">No trip logs match the selected state filter.</p>
          </div>
        ) : (
          [...filteredTrips].reverse().map(trip => {
            const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleId);
            const driver = drivers.find(d => d.licenseNumber === trip.driverId);
            return (
              <div 
                key={trip.id} 
                className="glass-card rounded-2xl p-6 border border-brand-outline hover:border-brand-primary/25 transition-all flex flex-col lg:flex-row justify-between gap-6"
                id={`trip-record-${trip.id}`}
              >
                {/* Left: Router details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-extrabold text-brand-primary px-2.5 py-1 bg-brand-surface-lowest rounded border border-brand-outline/60">
                      {trip.id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      trip.status === 'Draft' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      trip.status === 'Dispatched' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse' :
                      trip.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {trip.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {trip.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-primary"></div>
                      <div className="w-0.5 h-8 bg-brand-outline-accent/50 border-dashed"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-brand-secondary">DEPART: <span className="text-white font-sans text-sm font-semibold">{trip.source}</span></div>
                      <div className="h-4"></div>
                      <div className="text-xs font-mono text-brand-secondary">DESTINE: <span className="text-white font-sans text-sm font-semibold">{trip.destination}</span></div>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-gray-400 bg-brand-surface-low/30 p-2.5 rounded-lg border border-brand-outline/20">
                    <span className="text-brand-secondary uppercase">Active Transit Route:</span> {trip.routeName}
                  </div>
                </div>

                {/* Center: Crew / Vehicle Allocation & Validation specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4 w-full lg:w-96 p-4 bg-brand-surface-low/40 rounded-xl border border-brand-outline/20">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block">VEHICLE</span>
                    <span className="text-xs text-white font-semibold flex items-center gap-1 mt-1">
                      <Truck className="h-3.5 w-3.5 text-brand-secondary shrink-0" /> {vehicle?.nickname || trip.vehicleId}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{trip.vehicleId} ({vehicle?.type})</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block">DRIVER</span>
                    <span className="text-xs text-white font-semibold flex items-center gap-1 mt-1">
                      <User className="h-3.5 w-3.5 text-brand-secondary shrink-0" /> {driver?.name || trip.driverId}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono block mt-0.5">Permit Class: {driver?.licenseCategory}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block">CARGO WEIGHT</span>
                    <span className="text-xs text-white font-mono font-semibold block mt-1">
                      {trip.cargoWeight.toLocaleString()} kg
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono block">Max: {vehicle?.maxCapacity.toLocaleString()} kg</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block">PLANNED ROI</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold block mt-1">
                      +{currencySymbol}{trip.revenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono block">{trip.plannedDistance} km planned</span>
                  </div>
                </div>

                {/* Right: Operational Actions */}
                <div className="flex lg:flex-col justify-end gap-2 lg:w-48 shrink-0 border-t lg:border-t-0 lg:border-l border-brand-outline/20 pt-4 lg:pt-0 lg:pl-6">
                  {trip.status === 'Draft' && (
                    currentRole !== 'Driver' ? (
                      <button 
                        onClick={() => {
                          onDispatchTrip(trip.id);
                          toast.success('Trip Dispatched', `Trip ${trip.id} is now en-route.`);
                        }}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 py-2.5 bg-brand-primary text-black font-semibold rounded-lg text-xs font-mono hover:bg-white transition-all shadow-md shadow-brand-primary/5"
                      >
                        <Play className="h-3.5 w-3.5 fill-black" /> DISPATCH TRIP
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-mono text-center italic py-2">Pending Dispatch</span>
                    )
                  )}

                  {trip.status === 'Dispatched' && (
                    <>
                      <button 
                        onClick={() => handleOpenCompleteTripModal(trip)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-black font-semibold rounded-lg text-xs font-mono hover:bg-white transition-all"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> COMPLETE TRANSIT
                      </button>
                      {currentRole !== 'Driver' && (
                        <button 
                          onClick={() => setAbortConfirm(trip.id)}
                          className="py-2.5 px-3 bg-brand-surface border border-brand-outline text-brand-error hover:bg-brand-error/10 hover:border-brand-error rounded-lg text-xs transition-all"
                        >
                          ABORT
                        </button>
                      )}
                    </>
                  )}

                  {trip.status === 'Completed' && (
                    <div className="w-full text-right text-xs font-mono space-y-1 py-1">
                      <div className="text-emerald-400 flex items-center lg:justify-end gap-1.5 font-bold">
                        <CheckCircle2 className="h-4 w-4" /> Transit Settled
                      </div>
                      <div className="text-gray-500 text-[10px]">
                        Fuel Consumed: {trip.fuelConsumedLiters}L
                      </div>
                      <div className="text-gray-500 text-[10px]">
                        Final Odo: {trip.finalOdometer} km
                      </div>
                    </div>
                  )}

                  {trip.status === 'Cancelled' && (
                    <div className="w-full text-right text-xs font-mono py-2 text-brand-error flex items-center lg:justify-end gap-1.5 font-semibold">
                      <XCircle className="h-4 w-4" /> Dispatch Aborted
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE NEW TRIP DISPATCH MODAL */}
      {isNewTripOpen && (
        <div className="fixed inset-0 bg-brand-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-xl rounded-2xl border border-brand-outline p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-brand-outline">
              <h3 className="text-lg font-display font-bold text-white">Create Trip & Validate Dispatch</h3>
              <button onClick={() => setIsNewTripOpen(false)} className="text-brand-secondary hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-brand-error-container/30 border border-brand-error/50 rounded-lg text-brand-error text-xs font-mono flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Validation Rules Indicator */}
            <div className="p-3 bg-brand-surface-low border border-brand-outline/40 rounded-xl space-y-1">
              <div className="text-[10px] text-brand-primary font-mono flex items-center gap-1 uppercase font-bold">
                <Info className="h-3.5 w-3.5" /> Dispatch Verification Checklist:
              </div>
              <ul className="text-[10px] text-brand-secondary list-disc list-inside space-y-0.5">
                <li>Vehicle & Crew must be marked <strong>"Available"</strong>.</li>
                <li>Cargo weight must not exceed Vehicle max load limit.</li>
                <li>Driver must hold valid operating permit class (HMV required for Heavy Trucks).</li>
                <li>Driver license permit must not be expired.</li>
              </ul>
            </div>

            <form onSubmit={handleCreateTripSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Origin Depot *</label>
                  <input 
                    type="text" 
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Houston Terminal B"
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Destination Hub *</label>
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Dallas North Hub"
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Select Deployed Vehicle *</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                    required
                  >
                    <option value="">-- Choose Asset --</option>
                    {vehicles.filter(v => v.status === 'Available').map(v => (
                      <option key={v.registrationNumber} value={v.registrationNumber}>
                        {v.nickname || v.name} ({v.registrationNumber}) [{v.type}]
                      </option>
                    ))}
                    {vehicles.filter(v => v.status !== 'Available').map(v => (
                      <option key={v.registrationNumber} value={v.registrationNumber} disabled>
                        ⛔ {v.nickname || v.name} ({v.registrationNumber}) — {v.status.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Select Assigned Crew *</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                    required
                  >
                    <option value="">-- Choose Operator --</option>
                    {drivers.map(d => {
                      const isExpired = new Date(d.licenseExpiryDate) < new Date(todayStr);
                      const isIneligible = d.status !== 'Available' || isExpired;
                      let flags = '';
                      if (d.status === 'On Trip') flags = ' [ON TRIP]';
                      else if (d.status === 'Suspended') flags = ' [SUSPENDED]';
                      else if (d.status === 'Off Duty') flags = ' [OFF DUTY]';
                      if (isExpired) flags += ' [EXPIRED LIC.]';
                      return (
                        <option key={d.licenseNumber} value={d.licenseNumber} style={isIneligible ? {color: '#f87171'} : {}}>
                          {isIneligible ? '⚠️ ' : ''}{d.name} ({d.licenseNumber}) [{d.licenseCategory}]{flags}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="block text-brand-secondary mb-1 uppercase text-[10px]">Cargo weight (kg)</label>
                  <input 
                    type="number" 
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary mb-1 uppercase text-[10px]">Est. Distance (km)</label>
                  <input 
                    type="number" 
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary mb-1 uppercase text-[10px]">Planned Revenue ({currencySymbol})</label>
                  <input 
                    type="number" 
                    value={estRevenue}
                    onChange={(e) => setEstRevenue(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-brand-primary font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Transit Route Name / Details</label>
                <input 
                  type="text" 
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="e.g. I-45 Northbound Express Lane"
                  className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-brand-outline/40">
                <button 
                  type="button" 
                  onClick={() => setIsNewTripOpen(false)}
                  className="px-4 py-2 bg-brand-surface-high text-brand-secondary rounded-lg font-mono hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-black rounded-lg font-mono font-bold hover:bg-white transition-all"
                >
                  SAVE DRAFT TRIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE TRIP INPUTS MODAL */}
      {completingTripId && (
        <div className="fixed inset-0 bg-brand-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-brand-outline p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-brand-outline">
              <h3 className="text-md font-display font-bold text-white">Settle Transit Log {completingTripId}</h3>
              <button onClick={() => setCompletingTripId(null)} className="text-brand-secondary hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteTripSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-brand-secondary mb-1.5 uppercase">Actual Fuel Consumed (Liters)</label>
                <input 
                  type="number" 
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(Number(e.target.value))}
                  className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary text-md"
                  required
                />
              </div>

              <div>
                <label className="block text-brand-secondary mb-1.5 uppercase">Final Asset Odometer Reading (km)</label>
                <input 
                  type="number" 
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(Number(e.target.value))}
                  className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary text-md font-bold text-brand-primary"
                  required
                />
                <p className="text-[10px] text-gray-500 font-sans mt-1">Starting vehicle odometer was: {
                  vehicles.find(v => v.registrationNumber === trips.find(t => t.id === completingTripId)?.vehicleId)?.odometer.toLocaleString()
                } km</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-brand-outline/40">
                <button 
                  type="button" 
                  onClick={() => setCompletingTripId(null)}
                  className="px-3 py-1.5 bg-brand-surface-high text-brand-secondary rounded-lg hover:text-white transition-all font-mono"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 text-black rounded-lg font-bold hover:bg-white transition-all font-mono"
                >
                  SETTLE TRANSIT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ABORT TRIP CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={!!abortConfirm}
        title="Abort Active Trip"
        message={`Abort trip ${abortConfirm}? This will immediately release the vehicle and driver back to Available status. This action cannot be undone.`}
        confirmLabel="ABORT TRIP"
        cancelLabel="KEEP ACTIVE"
        variant="danger"
        onConfirm={() => {
          if (abortConfirm) {
            onCancelTrip(abortConfirm);
            toast.warning('Trip Aborted', `Trip ${abortConfirm} has been cancelled. Vehicle and driver are now available.`);
            setAbortConfirm(null);
          }
        }}
        onCancel={() => setAbortConfirm(null)}
      />

    </div>
  );
};
