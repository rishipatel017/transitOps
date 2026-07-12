import React, { useState } from 'react';
import { Vehicle, MaintenanceLog } from '../types';
import { 
  Plus, 
  Wrench, 
  Check, 
  AlertTriangle,
  X,
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  Hammer
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface MaintenanceViewProps {
  maintenance: MaintenanceLog[];
  vehicles: Vehicle[];
  onAddMaintenance: (log: MaintenanceLog) => void;
  onCompleteMaintenance: (id: string, actualCost: number) => void;
  onUpdateVehicle: (registrationNumber: string, updates: Partial<Vehicle>) => void;
  currencySymbol?: string;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  maintenance,
  vehicles,
  onAddMaintenance,
  onCompleteMaintenance,
  onUpdateVehicle,
  currencySymbol = '$'
}) => {
  const toast = useToast();
  const [isAddMaintOpen, setIsAddMaintOpen] = useState(false);
  const [completingMaintId, setCompletingMaintId] = useState<string | null>(null);

  // Form states - Maintenance Work Order
  const [maintVehicleId, setMaintVehicleId] = useState('');
  const [maintType, setMaintType] = useState<MaintenanceLog['serviceType']>('Routine Inspection');
  const [maintCost, setMaintCost] = useState(250);
  const [maintNotes, setMaintNotes] = useState('');

  // Complete maintenance cost state
  const [finalMaintCost, setFinalMaintCost] = useState(250);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [vehicleFilter, setVehicleFilter] = useState<string>('All');

  const [errorMsg, setErrorMsg] = useState('');

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
    toast.success('Maintenance Settled', `Work order ${completingMaintId} completed. Expense recorded. Vehicle returned to Available.`);
    setCompletingMaintId(null);
  };

  // Metric calculations
  const activeOrders = maintenance.filter(m => m.status === 'Active');
  const completedOrders = maintenance.filter(m => m.status === 'Completed');
  
  const estimatedCostOfActive = activeOrders.reduce((sum, m) => sum + m.costEstimate, 0);
  const totalSettledCost = completedOrders.reduce((sum, m) => sum + m.costEstimate, 0);

  // Filtered maintenance list
  const filteredMaintenance = maintenance.filter(m => {
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesVehicle = vehicleFilter === 'All' || m.vehicleId === vehicleFilter;
    return matchesStatus && matchesVehicle;
  });

  return (
    <div className="space-y-6" id="maintenance-view-section">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="maintenance-header">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Maintenance Ledger & Work Orders</h2>
          <p className="text-xs text-brand-secondary">Schedule inspections, commission engine rebuilds, and view repair histories.</p>
        </div>
        <button 
          onClick={() => {
            setErrorMsg('');
            setIsAddMaintOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-black rounded-lg font-semibold font-mono text-xs hover:bg-white transition-all shadow-lg shadow-brand-primary/10"
        >
          <Plus className="h-4 w-4" /> ISSUE WORK ORDER
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="maint-kpi-grid">
        <div className="glass-card p-5 rounded-xl border border-brand-outline">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-mono block">ACTIVE WORK ORDERS</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-2xl font-display font-bold text-white mt-2 block">{activeOrders.length}</span>
          <p className="text-[10px] text-amber-400 mt-1">Vehicles currently In Shop</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-brand-outline">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-mono block">COMPLETED REPAIRS</span>
            <Check className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-display font-bold text-white mt-2 block">{completedOrders.length}</span>
          <p className="text-[10px] text-emerald-400 mt-1">Successfully back on road</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-brand-outline">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-mono block">ACTIVE ESTIMATES</span>
            <AlertCircle className="h-4 w-4 text-brand-primary" />
          </div>
          <span className="text-2xl font-display font-bold text-brand-primary mt-2 block">
            {currencySymbol}{estimatedCostOfActive.toLocaleString()}
          </span>
          <p className="text-[10px] text-brand-secondary mt-1">Pending shop finalization</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-brand-outline">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-mono block">LIFETIME REPAIR SPEND</span>
            <DollarSign className="h-4 w-4 text-sky-400" />
          </div>
          <span className="text-2xl font-display font-bold text-white mt-2 block">
            {currencySymbol}{totalSettledCost.toLocaleString()}
          </span>
          <p className="text-[10px] text-brand-secondary mt-1">Directly allocated to ledger</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="p-4 bg-brand-surface rounded-xl border border-brand-outline flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="maint-filters">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-gray-500 uppercase tracking-wider">Order Status:</span>
          <div className="flex rounded-md bg-brand-surface-lowest p-1 border border-brand-outline/40">
            {(['All', 'Active', 'Completed'] as const).map(status => (
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
          <span className="text-gray-500 uppercase tracking-wider">Asset Filter:</span>
          <select 
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="flex-1 md:flex-none bg-brand-surface-lowest border border-brand-outline text-white px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-brand-primary"
          >
            <option value="All">All Fleet Vehicles</option>
            {vehicles.map(v => (
              <option key={v.registrationNumber} value={v.registrationNumber}>
                {v.nickname || v.name} ({v.registrationNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Orders List / Grid */}
      <div className="glass-card rounded-2xl p-6 border border-brand-outline" id="maint-ledger-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-outline/50 text-[11px] font-mono text-gray-500 uppercase tracking-widest">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Fleet Asset</th>
                <th className="py-3 px-4">Service Required</th>
                <th className="py-3 px-4">Cost Ledger</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-outline/20 text-xs font-mono">
              {filteredMaintenance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-brand-secondary">
                    <Wrench className="h-8 w-8 text-brand-outline mx-auto mb-3" />
                    No recorded maintenance orders match the current filter configuration.
                  </td>
                </tr>
              ) : (
                [...filteredMaintenance].reverse().map(log => {
                  const targetVehicle = vehicles.find(v => v.registrationNumber === log.vehicleId);
                  return (
                    <tr key={log.id} className="hover:bg-brand-surface-low/30 transition-all">
                      <td className="py-4 px-4 text-brand-primary font-bold">{log.id}</td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-white block">{targetVehicle?.name || log.vehicleId}</span>
                        <span className="text-[10px] text-gray-500 font-bold">{log.vehicleId} {targetVehicle?.nickname && `• "${targetVehicle.nickname}"`}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-brand-tertiary font-medium block">{log.serviceType}</span>
                        {log.notes && <span className="block text-[10px] text-gray-400 font-sans italic mt-0.5">"{log.notes}"</span>}
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {currencySymbol}{log.costEstimate.toLocaleString()}
                        <span className="text-[10px] text-gray-500 block font-normal">{log.status === 'Completed' ? 'Settle Invoice' : 'Est. Quote'}</span>
                      </td>
                      <td className="py-4 px-4 text-brand-secondary">{log.completionDate}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          log.status === 'Completed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {log.status === 'Active' ? (
                          <button
                            onClick={() => {
                              setCompletingMaintId(log.id);
                              setFinalMaintCost(log.costEstimate);
                            }}
                            className="px-3.5 py-1.5 bg-brand-primary text-black font-semibold rounded-lg hover:bg-white transition-all text-xs"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="text-gray-500 flex items-center justify-end gap-1 text-[11px]">
                            <Check className="h-4 w-4 text-emerald-400" /> Settled
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

      {/* ISSUE WORK ORDER MODAL */}
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
                <p className="text-[10px] text-gray-500 font-mono mt-1">
                  Note: Scheduling maintenance automatically updates the vehicle status to "In Shop". Vehicles currently deployed on a trip cannot be scheduled.
                </p>
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
                    <option value="Engine Repair">Engine Repair</option>
                    <option value="Tire Replacement">Tire Replacement</option>
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
                  placeholder="Describe warning indicators, fluid leaks, routine replacement items, or diagnostic codes..."
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
    </div>
  );
};
