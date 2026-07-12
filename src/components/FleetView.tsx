import React, { useState } from 'react';
import { Vehicle, MaintenanceLog } from '../types';
import { 
  Plus, 
  Wrench, 
  Trash2, 
  Edit, 
  Cpu, 
  Coins, 
  History, 
  Check, 
  Info, 
  AlertTriangle,
  X,
  Gauge
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface FleetViewProps {
  vehicles: Vehicle[];
  maintenance: MaintenanceLog[];
  onAddVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicle: (registrationNumber: string, updates: Partial<Vehicle>) => void;
  onDeleteVehicle: (registrationNumber: string) => void;
  onAddMaintenance: (log: MaintenanceLog) => void;
  onCompleteMaintenance: (id: string, actualCost: number) => void;
  currencySymbol?: string;
}

export const FleetView: React.FC<FleetViewProps> = ({
  vehicles,
  maintenance,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onAddMaintenance,
  onCompleteMaintenance,
  currencySymbol = '$'
}) => {
  const toast = useToast();
  // Modal states
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddMaintOpen, setIsAddMaintOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [completingMaintId, setCompletingMaintId] = useState<string | null>(null);
  const [retireConfirm, setRetireConfirm] = useState<string | null>(null); // regNum to retire

  // Form states - Vehicle
  const [regNum, setRegNum] = useState('');
  const [vName, setVName] = useState('');
  const [vType, setVType] = useState<'Van' | 'Truck' | 'Mini'>('Truck');
  const [maxCap, setMaxCap] = useState(10000);
  const [odometer, setOdometer] = useState(15000);
  const [acqCost, setAcqCost] = useState(85000);
  const [nickname, setNickname] = useState('');
  const [vStatus, setVStatus] = useState<Vehicle['status']>('Available');

  // Form states - Maintenance Work Order
  const [maintVehicleId, setMaintVehicleId] = useState('');
  const [maintType, setMaintType] = useState<MaintenanceLog['serviceType']>('Routine Inspection');
  const [maintCost, setMaintCost] = useState(250);
  const [maintNotes, setMaintNotes] = useState('');

  // Complete maintenance cost state
  const [finalMaintCost, setFinalMaintCost] = useState(250);

  // Filter state for fleet display
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'On Trip' | 'In Shop' | 'Retired'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Van' | 'Truck' | 'Mini'>('All');

  // Validation
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNum.trim() || !vName.trim()) {
      setErrorMsg("Registration number and name are required.");
      return;
    }

    if (vehicles.some(v => v.registrationNumber.toUpperCase() === regNum.toUpperCase().trim())) {
      setErrorMsg("A vehicle with this registration number already exists.");
      return;
    }

    const newVehicle: Vehicle = {
      registrationNumber: regNum.toUpperCase().trim(),
      name: vName.trim(),
      type: vType,
      maxCapacity: Number(maxCap),
      odometer: Number(odometer),
      acquisitionCost: Number(acqCost),
      status: 'Available',
      nickname: nickname.trim() || undefined
    };

    onAddVehicle(newVehicle);
    toast.success('Vehicle Registered', `${newVehicle.name} (${newVehicle.registrationNumber}) added to fleet.`);
    resetVehicleForm();
  };

  const handleUpdateVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    onUpdateVehicle(editingVehicle.registrationNumber, {
      name: vName,
      type: vType,
      maxCapacity: Number(maxCap),
      odometer: Number(odometer),
      acquisitionCost: Number(acqCost),
      status: vStatus,
      nickname: nickname || undefined
    });
    toast.success('Vehicle Updated', `${vName} (${editingVehicle.registrationNumber}) configuration saved.`);
    setEditingVehicle(null);
    resetVehicleForm();
  };

  const handleAddMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintVehicleId) {
      setErrorMsg("Please select a target fleet asset.");
      return;
    }

    const targetVehicle = vehicles.find(v => v.registrationNumber === maintVehicleId);
    if (!targetVehicle) return;

    if (targetVehicle.status === 'On Trip') {
      setErrorMsg("Cannot schedule maintenance. This vehicle is currently On Trip.");
      return;
    }

    const newLog: MaintenanceLog = {
      id: `MN-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: maintVehicleId,
      serviceType: maintType,
      costEstimate: Number(maintCost),
      completionDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      notes: maintNotes.trim() || undefined
    };

    onAddMaintenance(newLog);
    // Automatically set vehicle to In Shop
    onUpdateVehicle(maintVehicleId, { status: 'In Shop' });
    toast.success('Work Order Issued', `${maintType} scheduled for ${targetVehicle.name}. Status set to In Shop.`);

    setIsAddMaintOpen(false);
    setMaintVehicleId('');
    setMaintNotes('');
    setErrorMsg('');
  };

  const handleCompleteMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingMaintId) return;

    onCompleteMaintenance(completingMaintId, Number(finalMaintCost));
    toast.success('Maintenance Completed', `Work order ${completingMaintId} settled. Vehicle returned to Available.`);
    setCompletingMaintId(null);
  };

  const resetVehicleForm = () => {
    setRegNum('');
    setVName('');
    setVType('Truck');
    setMaxCap(10000);
    setOdometer(15000);
    setAcqCost(85000);
    setNickname('');
    setErrorMsg('');
    setIsAddVehicleOpen(false);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVName(vehicle.name);
    setVType(vehicle.type);
    setMaxCap(vehicle.maxCapacity);
    setOdometer(vehicle.odometer);
    setAcqCost(vehicle.acquisitionCost);
    setNickname(vehicle.nickname || '');
    setVStatus(vehicle.status);
  };

  // Filtered vehicles list
  const filteredVehicles = vehicles.filter(v => {
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    return matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6" id="fleet-section">
      
      {/* Header and Action Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="fleet-header">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Active Vehicle Registry</h2>
          <p className="text-xs text-brand-secondary">Configure heavy transports, vans, and light cargo vehicles.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={() => {
              resetVehicleForm();
              setIsAddVehicleOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-black rounded-lg font-semibold font-mono text-xs hover:bg-white transition-all shadow-lg shadow-brand-primary/10"
          >
            <Plus className="h-4 w-4" /> REGISTER VEHICLE
          </button>
          <button 
            onClick={() => {
              setErrorMsg('');
              setIsAddMaintOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-surface-high border border-brand-outline text-brand-primary rounded-lg font-semibold font-mono text-xs hover:border-brand-primary hover:text-white transition-all"
          >
            <Wrench className="h-4 w-4" /> ISSUE WORK ORDER
          </button>
        </div>
      </div>

      {/* Grid Filter Bar */}
      <div className="p-4 bg-brand-surface rounded-xl border border-brand-outline flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="fleet-filters">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-gray-500 uppercase tracking-wider">Status:</span>
          <div className="flex rounded-md bg-brand-surface-lowest p-1 border border-brand-outline/40">
            {(['All', 'Available', 'On Trip', 'In Shop', 'Retired'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                  statusFilter === status 
                    ? 'bg-brand-primary text-black font-semibold' 
                    : 'text-brand-secondary hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono w-full md:w-auto">
          <span className="text-gray-500 uppercase tracking-wider">Asset Class:</span>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="flex-1 md:flex-none bg-brand-surface-lowest border border-brand-outline text-white px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-brand-primary"
          >
            <option value="All">All Categories</option>
            <option value="Truck">Heavy Trucks (HMV)</option>
            <option value="Van">Cargo Vans (LMV)</option>
            <option value="Mini">Mini Delivery (LMV)</option>
          </select>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="vehicles-grid">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-brand-surface/30 rounded-xl border border-brand-outline/50">
            <Cpu className="h-10 w-10 text-brand-outline mx-auto mb-3" />
            <p className="text-sm text-brand-secondary">No vehicles match the selected filter configuration.</p>
          </div>
        ) : (
          filteredVehicles.map(vehicle => {
            const vehicleActiveMaintenance = maintenance.filter(m => m.vehicleId === vehicle.registrationNumber && m.status === 'Active');
            return (
              <div 
                key={vehicle.registrationNumber} 
                className="glass-card rounded-2xl p-5 border border-brand-outline hover:border-brand-primary/40 transition-all duration-300 relative group flex flex-col justify-between"
                id={`vehicle-card-${vehicle.registrationNumber}`}
              >
                <div>
                  {/* Status Tag & Type Icon */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[10px] font-extrabold tracking-wider bg-brand-surface-lowest border border-brand-outline/80 px-2 py-0.5 rounded text-brand-secondary">
                      {vehicle.registrationNumber}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      vehicle.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      vehicle.status === 'On Trip' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                      vehicle.status === 'In Shop' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      ● {vehicle.status}
                    </span>
                  </div>

                  {/* Title and Nickname */}
                  <div>
                    <h3 className="text-lg font-display font-semibold text-white group-hover:text-brand-primary transition-all">
                      {vehicle.name}
                    </h3>
                    {vehicle.nickname && (
                      <p className="text-xs font-mono text-brand-primary italic mt-0.5">
                        "{vehicle.nickname}"
                      </p>
                    )}
                  </div>

                  {/* Tech Specs Block */}
                  <div className="grid grid-cols-2 gap-4 my-4 p-3.5 bg-brand-surface-low/50 rounded-xl border border-brand-outline/30 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono block">CATEGORY</span>
                      <span className="text-white font-medium flex items-center gap-1 mt-0.5">
                        <Cpu className="h-3.5 w-3.5 text-brand-secondary" /> {vehicle.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono block">MAX CAPACITY</span>
                      <span className="text-white font-medium block mt-0.5">
                        {vehicle.maxCapacity.toLocaleString()} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono block">ODOMETER</span>
                      <span className="text-white font-mono flex items-center gap-1 mt-0.5">
                        <Gauge className="h-3.5 w-3.5 text-brand-secondary" /> {vehicle.odometer.toLocaleString()} km
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono block">ACQUISITION COST</span>
                      <span className="text-white font-mono block mt-0.5">
                        {currencySymbol}{vehicle.acquisitionCost.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Active Maintenance Alert */}
                  {vehicleActiveMaintenance.length > 0 && (
                    <div className="mb-4 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary p-2.5 rounded-lg flex items-start gap-2 text-[11px]">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-brand-primary mt-0.5" />
                      <div>
                        <span className="font-bold uppercase font-mono">Work Order Active:</span>
                        <p className="text-brand-secondary mt-0.5">
                          {vehicleActiveMaintenance.map(m => m.serviceType).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit & Delete Action Row */}
                <div className="flex gap-2 pt-3 border-t border-brand-outline/20">
                  <button 
                    onClick={() => openEditModal(vehicle)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-brand-surface-high border border-brand-outline text-brand-secondary hover:text-white hover:border-brand-primary rounded-lg text-xs transition-all font-mono"
                  >
                    <Edit className="h-3 w-3" /> CONFIGURE
                  </button>
                  {vehicle.status !== 'On Trip' && (
                    <button 
                      onClick={() => setRetireConfirm(vehicle.registrationNumber)}
                      className="px-3 py-1.5 bg-brand-surface-high border border-brand-outline text-brand-error hover:bg-brand-error/10 hover:border-brand-error rounded-lg text-xs transition-all"
                      title="Retire Vehicle"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Maintenance Logs Matrix */}
      <div className="glass-card rounded-2xl p-6 border border-brand-outline" id="maintenance-scheduler-log">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
              <Wrench className="h-5 w-5 text-brand-primary" /> Maintenance Ledger & Work Logs
            </h3>
            <p className="text-xs text-brand-secondary">Track heavy repair cycles, engine tuneups, and regular diagnostic schedules.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-outline/50 text-[11px] font-mono text-gray-500 uppercase tracking-widest">
                <th className="py-3 px-4">Work ID</th>
                <th className="py-3 px-4">Fleet Vehicle</th>
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">Cost Estimate</th>
                <th className="py-3 px-4">Log Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-outline/20 text-xs font-mono">
              {maintenance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-brand-secondary">
                    No recorded fleet maintenance events on file.
                  </td>
                </tr>
              ) : (
                [...maintenance].reverse().map(log => {
                  const targetVehicle = vehicles.find(v => v.registrationNumber === log.vehicleId);
                  return (
                    <tr key={log.id} className="hover:bg-brand-surface-low/30 transition-all">
                      <td className="py-3 px-4 text-brand-primary font-bold">{log.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{targetVehicle?.nickname || log.vehicleId}</span>
                        <span className="text-[10px] text-gray-500">{log.vehicleId}</span>
                      </td>
                      <td className="py-3 px-4 text-brand-tertiary">
                        {log.serviceType}
                        {log.notes && <span className="block text-[10px] text-gray-500 font-sans italic mt-0.5">"{log.notes}"</span>}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{currencySymbol}{log.costEstimate.toLocaleString()}</td>
                      <td className="py-3 px-4">{log.completionDate}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'Completed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {log.status === 'Active' ? (
                          <button
                            onClick={() => {
                              setCompletingMaintId(log.id);
                              setFinalMaintCost(log.costEstimate);
                            }}
                            className="px-3 py-1 bg-brand-primary text-black font-semibold rounded hover:bg-white transition-all text-[11px]"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="text-gray-500 flex items-center justify-end gap-1 text-[10px]">
                            <Check className="h-3.5 w-3.5 text-emerald-400" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER VEHICLE MODAL */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 bg-brand-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-brand-outline p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-brand-outline">
              <h3 className="text-lg font-display font-bold text-white">Register Fleet Vehicle</h3>
              <button onClick={resetVehicleForm} className="text-brand-secondary hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-brand-error-container/30 border border-brand-error/50 rounded-lg text-brand-error text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddVehicleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Registration Number *</label>
                  <input 
                    type="text" 
                    value={regNum}
                    onChange={(e) => setRegNum(e.target.value)}
                    placeholder="e.g. VR-770A"
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Model Name *</label>
                  <input 
                    type="text" 
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    placeholder="e.g. Ford F-650"
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Asset Nickname</label>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. The Giant"
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Asset Class</label>
                  <select 
                    value={vType}
                    onChange={(e) => setVType(e.target.value as any)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Truck">Heavy Truck (HMV Required)</option>
                    <option value="Van">Cargo Van (LMV Required)</option>
                    <option value="Mini">Mini Delivery (LMV Required)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="block text-brand-secondary mb-1 uppercase text-[10px]">Max Load (kg)</label>
                  <input 
                    type="number" 
                    value={maxCap}
                    onChange={(e) => setMaxCap(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary mb-1 uppercase text-[10px]">Odometer (km)</label>
                  <input 
                    type="number" 
                    value={odometer}
                    onChange={(e) => setOdometer(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary mb-1 uppercase text-[10px]">Acq. Cost ({currencySymbol})</label>
                  <input 
                    type="number" 
                    value={acqCost}
                    onChange={(e) => setAcqCost(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-brand-outline/40">
                <button 
                  type="button" 
                  onClick={resetVehicleForm}
                  className="px-4 py-2 bg-brand-surface-high text-brand-secondary rounded-lg font-mono hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-black rounded-lg font-mono font-bold hover:bg-white transition-all"
                >
                  REGISTER ASSET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIGURE VEHICLE / EDIT MODAL */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-brand-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-brand-outline p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-brand-outline">
              <h3 className="text-lg font-display font-bold text-white">Configure Vehicle {editingVehicle.registrationNumber}</h3>
              <button onClick={() => setEditingVehicle(null)} className="text-brand-secondary hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVehicleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Model Name</label>
                  <input 
                    type="text" 
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Asset Nickname</label>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Asset Class</label>
                  <select 
                    value={vType}
                    onChange={(e) => setVType(e.target.value as any)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Truck">Heavy Truck (HMV)</option>
                    <option value="Van">Cargo Van (LMV)</option>
                    <option value="Mini">Mini Delivery (LMV)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Operational Status</label>
                  <select 
                    value={vStatus}
                    onChange={(e) => setVStatus(e.target.value as any)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip (Controlled by Dispatch)</option>
                    <option value="In Shop">In Shop (Maintenance)</option>
                    <option value="Retired">Retired (Decommissioned)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="block text-brand-secondary mb-1 uppercase text-[10px]">Max Load (kg)</label>
                  <input 
                    type="number" 
                    value={maxCap}
                    onChange={(e) => setMaxCap(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary mb-1 uppercase text-[10px]">Odometer (km)</label>
                  <input 
                    type="number" 
                    value={odometer}
                    onChange={(e) => setOdometer(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary mb-1 uppercase text-[10px]">Acq. Cost ({currencySymbol})</label>
                  <input 
                    type="number" 
                    value={acqCost}
                    onChange={(e) => setAcqCost(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-brand-outline/40">
                <button 
                  type="button" 
                  onClick={() => setEditingVehicle(null)}
                  className="px-4 py-2 bg-brand-surface-high text-brand-secondary rounded-lg font-mono hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-black rounded-lg font-mono font-bold hover:bg-white transition-all"
                >
                  SAVE CONFIG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE WORK ORDER / MAINTENANCE MODAL */}
      {isAddMaintOpen && (
        <div className="fixed inset-0 bg-brand-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-brand-outline p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-brand-outline">
              <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Wrench className="h-5 w-5 text-brand-primary" /> Issue Repair Work Order
              </h3>
              <button onClick={() => setIsAddMaintOpen(false)} className="text-brand-secondary hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-brand-error-container/30 border border-brand-error/50 rounded-lg text-brand-error text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddMaintSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Select Fleet Target *</label>
                <select
                  value={maintVehicleId}
                  onChange={(e) => setMaintVehicleId(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                  required
                >
                  <option value="">-- Choose Asset --</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber} disabled={v.status === 'On Trip'}>
                      {v.nickname || v.name} ({v.registrationNumber}) - {v.status}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 font-mono mt-1">Note: Scheduling maintenance automatically updates the vehicle status to "In Shop". Vehicles currently in transit cannot be scheduled.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Service Type</label>
                  <select
                    value={maintType}
                    onChange={(e) => setMaintType(e.target.value as any)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Routine Inspection">Routine Inspection</option>
                    <option value="Oil Change & Filter">Oil Change & Filter</option>
                    <option value="Brake Check">Brake Check</option>
                    <option value="Engine Overhaul">Engine Overhaul</option>
                    <option value="Tire Alignment">Tire Alignment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Cost Estimate ({currencySymbol})</label>
                  <input 
                    type="number" 
                    value={maintCost}
                    onChange={(e) => setMaintCost(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Issue Diagnostics & Notes</label>
                <textarea 
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                  placeholder="Describe failure points, routine thresholds, or diagnostic indicators..."
                  rows={3}
                  className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-brand-outline/40">
                <button 
                  type="button" 
                  onClick={() => setIsAddMaintOpen(false)}
                  className="px-4 py-2 bg-brand-surface-high text-brand-secondary rounded-lg font-mono hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-black rounded-lg font-mono font-bold hover:bg-white transition-all"
                >
                  DISPATCH WORK ORDER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE MAINTENANCE COST MODAL */}
      {completingMaintId && (
        <div className="fixed inset-0 bg-brand-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-brand-outline p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-brand-outline">
              <h3 className="text-md font-display font-bold text-white">Settle Work Order {completingMaintId}</h3>
              <button onClick={() => setCompletingMaintId(null)} className="text-brand-secondary hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteMaintSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-brand-secondary mb-1.5 uppercase">Actual Settle Cost ({currencySymbol})</label>
                <input 
                  type="number" 
                  value={finalMaintCost}
                  onChange={(e) => setFinalMaintCost(Number(e.target.value))}
                  className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary font-bold text-lg"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-2 font-sans">
                  Completing this settles the work order. The vehicle will be returned to <strong>"Available"</strong> state, and a maintenance expense log will be registered automatically under the financial ledger.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-brand-outline/40">
                <button 
                  type="button" 
                  onClick={() => setCompletingMaintId(null)}
                  className="px-3.5 py-1.5 bg-brand-surface-high text-brand-secondary rounded-lg hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary text-black rounded-lg font-bold hover:bg-white transition-all"
                >
                  SETTLE & CLEAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* RETIRE VEHICLE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={!!retireConfirm}
        title="Retire Fleet Asset"
        message={`Permanently retire vehicle ${retireConfirm} from the operational system? All associated logs will be preserved but the vehicle will be removed from the active fleet.`}
        confirmLabel="RETIRE ASSET"
        cancelLabel="KEEP ACTIVE"
        variant="danger"
        onConfirm={() => {
          if (retireConfirm) {
            onDeleteVehicle(retireConfirm);
            toast.warning('Vehicle Retired', `Asset ${retireConfirm} has been removed from the active fleet.`);
            setRetireConfirm(null);
          }
        }}
        onCancel={() => setRetireConfirm(null)}
      />

    </div>
  );
};
