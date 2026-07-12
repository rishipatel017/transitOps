import React, { useState } from 'react';
import { Driver } from '../types';
import { 
  Plus, 
  Users, 
  ShieldAlert, 
  Trash2, 
  Edit, 
  Calendar, 
  Phone, 
  CheckCircle, 
  AlertTriangle,
  FileBadge,
  X,
  TrendingDown
} from 'lucide-react';

interface DriversViewProps {
  drivers: Driver[];
  onAddDriver: (driver: Driver) => void;
  onUpdateDriver: (licenseNumber: string, updates: Partial<Driver>) => void;
  onDeleteDriver: (licenseNumber: string) => void;
}

export const DriversView: React.FC<DriversViewProps> = ({
  drivers,
  onAddDriver,
  onUpdateDriver,
  onDeleteDriver
}) => {
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form states
  const [licNum, setLicNum] = useState('');
  const [dName, setDName] = useState('');
  const [licCat, setLicCat] = useState<'HMV' | 'LMV'>('HMV');
  const [licExpiry, setLicExpiry] = useState('2026-12-31');
  const [contact, setContact] = useState('');
  const [safety, setSafety] = useState(90);
  const [dStatus, setDStatus] = useState<Driver['status']>('Available');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'On Trip' | 'Off Duty' | 'Suspended'>('All');
  const [complianceFilter, setComplianceFilter] = useState<'All' | 'Expired' | 'Low Safety'>('All');

  const [errorMsg, setErrorMsg] = useState('');

  const todayStr = '2026-07-11'; // Fixed system time

  const isLicenseExpired = (expiryStr: string) => {
    return new Date(expiryStr) < new Date(todayStr);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licNum.trim() || !dName.trim() || !contact.trim()) {
      setErrorMsg("All asterisk (*) marked fields are required.");
      return;
    }

    if (drivers.some(d => d.licenseNumber.toUpperCase() === licNum.toUpperCase().trim())) {
      setErrorMsg("A driver with this License/Permit ID is already registered.");
      return;
    }

    const newDriver: Driver = {
      licenseNumber: licNum.toUpperCase().trim(),
      name: dName.trim(),
      licenseCategory: licCat,
      licenseExpiryDate: licExpiry,
      contactNumber: contact.trim(),
      safetyScore: Number(safety),
      status: 'Available',
      joinedDate: todayStr
    };

    onAddDriver(newDriver);
    resetForm();
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    onUpdateDriver(editingDriver.licenseNumber, {
      name: dName,
      licenseCategory: licCat,
      licenseExpiryDate: licExpiry,
      contactNumber: contact,
      safetyScore: Number(safety),
      status: dStatus
    });

    setEditingDriver(null);
    resetForm();
  };

  const resetForm = () => {
    setLicNum('');
    setDName('');
    setLicCat('HMV');
    setLicExpiry('2026-12-31');
    setContact('');
    setSafety(90);
    setErrorMsg('');
    setIsAddDriverOpen(false);
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setDName(driver.name);
    setLicCat(driver.licenseCategory);
    setLicExpiry(driver.licenseExpiryDate);
    setContact(driver.contactNumber);
    setSafety(driver.safetyScore);
    setDStatus(driver.status);
  };

  // Filtered drivers list
  const filteredDrivers = drivers.filter(d => {
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    
    let matchesCompliance = true;
    if (complianceFilter === 'Expired') {
      matchesCompliance = isLicenseExpired(d.licenseExpiryDate);
    } else if (complianceFilter === 'Low Safety') {
      matchesCompliance = d.safetyScore < 70;
    }

    return matchesStatus && matchesCompliance;
  });

  const expiredCount = drivers.filter(d => isLicenseExpired(d.licenseExpiryDate)).length;
  const criticalSafetyCount = drivers.filter(d => d.safetyScore < 70).length;

  return (
    <div className="space-y-6" id="drivers-section">
      
      {/* Header and Compliance Summary Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="drivers-header">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Driver Registry & Safety Board</h2>
          <p className="text-xs text-brand-secondary">Monitor operating credentials, license category certifications, and live safety scores.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsAddDriverOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-black rounded-lg font-semibold font-mono text-xs hover:bg-white transition-all shadow-lg shadow-brand-primary/10"
        >
          <Plus className="h-4 w-4" /> RECRUIT DRIVER
        </button>
      </div>

      {/* Compliance Overview Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="compliance-cards-row">
        {/* Total Drivers */}
        <div className="p-4 bg-brand-surface rounded-xl border border-brand-outline flex items-center gap-4">
          <div className="p-3 bg-brand-secondary/10 rounded-lg text-brand-secondary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono block">OPERATING FORCE</span>
            <span className="text-lg font-display font-bold text-white">{drivers.length} Certified Drivers</span>
          </div>
        </div>

        {/* Expired Permits Alarm */}
        <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
          expiredCount > 0 
            ? 'bg-rose-950/20 border-brand-error/40 text-brand-error' 
            : 'bg-brand-surface border-brand-outline text-brand-secondary'
        }`}>
          <div className={`p-3 rounded-lg ${expiredCount > 0 ? 'bg-brand-error/10 text-brand-error animate-pulse' : 'bg-gray-800 text-gray-400'}`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono block">PERMIT EXPIRED ALERTS</span>
            <span className={`text-lg font-display font-bold ${expiredCount > 0 ? 'text-white' : 'text-gray-400'}`}>
              {expiredCount} Active Suspensions
            </span>
          </div>
        </div>

        {/* Low Safety Score warnings */}
        <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
          criticalSafetyCount > 0 
            ? 'bg-amber-950/20 border-brand-primary/40 text-brand-primary' 
            : 'bg-brand-surface border-brand-outline text-brand-secondary'
        }`}>
          <div className={`p-3 rounded-lg ${criticalSafetyCount > 0 ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-800 text-gray-400'}`}>
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono block">SUBSTANDARD SAFETY RATINGS</span>
            <span className={`text-lg font-display font-bold ${criticalSafetyCount > 0 ? 'text-white' : 'text-gray-400'}`}>
              {criticalSafetyCount} Drivers Under review
            </span>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="p-4 bg-brand-surface rounded-xl border border-brand-outline flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="driver-filters">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-gray-500 uppercase tracking-wider">Duty Status:</span>
          <div className="flex rounded-md bg-brand-surface-lowest p-1 border border-brand-outline/40">
            {(['All', 'Available', 'On Trip', 'Off Duty', 'Suspended'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                  statusFilter === status 
                    ? 'bg-brand-primary text-black' 
                    : 'text-brand-secondary hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono w-full md:w-auto">
          <span className="text-gray-500 uppercase tracking-wider">Compliance Audits:</span>
          <div className="flex rounded-md bg-brand-surface-lowest p-1 border border-brand-outline/40 w-full md:w-auto justify-between">
            {(['All', 'Expired', 'Low Safety'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setComplianceFilter(opt)}
                className={`flex-1 md:flex-none px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                  complianceFilter === opt 
                    ? 'bg-brand-secondary text-black' 
                    : 'text-brand-secondary hover:text-white'
                }`}
              >
                {opt === 'All' ? 'Clear' : opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="drivers-grid">
        {filteredDrivers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-brand-surface/30 rounded-xl border border-brand-outline/50">
            <Users className="h-10 w-10 text-brand-outline mx-auto mb-3" />
            <p className="text-sm text-brand-secondary">No operator profile matches the selected configuration.</p>
          </div>
        ) : (
          filteredDrivers.map(driver => {
            const expired = isLicenseExpired(driver.licenseExpiryDate);
            return (
              <div 
                key={driver.licenseNumber} 
                className={`glass-card rounded-2xl p-5 border transition-all duration-300 relative flex flex-col justify-between ${
                  expired 
                    ? 'border-brand-error/30 bg-gradient-to-b from-brand-surface to-brand-error-container/10' 
                    : 'border-brand-outline hover:border-brand-primary/40'
                }`}
                id={`driver-card-${driver.licenseNumber}`}
              >
                <div>
                  {/* Category certification & status row */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[9px] font-extrabold tracking-widest bg-brand-surface-lowest border border-brand-outline px-2 py-0.5 rounded text-brand-primary uppercase">
                      {driver.licenseCategory} CLASS
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      driver.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      driver.status === 'On Trip' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                      driver.status === 'Off Duty' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      ● {driver.status}
                    </span>
                  </div>

                  {/* Profile Name & License ID */}
                  <div className="mb-4">
                    <h3 className="text-lg font-display font-semibold text-white">
                      {driver.name}
                    </h3>
                    <p className="text-xs font-mono text-gray-500">
                      PERMIT: {driver.licenseNumber}
                    </p>
                  </div>

                  {/* Safety Score meter */}
                  <div className="p-3 bg-brand-surface-low rounded-xl border border-brand-outline/20 mb-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-secondary flex items-center gap-1">
                        <FileBadge className="h-3.5 w-3.5 text-brand-primary" /> Safety Score
                      </span>
                      <span className={`font-mono font-bold ${
                        driver.safetyScore >= 85 ? 'text-emerald-400' :
                        driver.safetyScore >= 70 ? 'text-amber-400' :
                        'text-brand-error'
                      }`}>
                        {driver.safetyScore}/100
                      </span>
                    </div>
                    {/* Linear score visualization */}
                    <div className="w-full bg-brand-surface-lowest h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          driver.safetyScore >= 85 ? 'bg-emerald-400' :
                          driver.safetyScore >= 70 ? 'bg-amber-400' :
                          'bg-brand-error'
                        }`}
                        style={{ width: `${driver.safetyScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Details block */}
                  <div className="space-y-2 text-xs font-mono border-t border-brand-outline/10 pt-3">
                    <div className="flex items-center gap-2 text-brand-secondary">
                      <Calendar className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <span>PERMIT EXPIRES:</span>
                      <span className={`font-bold ${expired ? 'text-brand-error animate-pulse' : 'text-white'}`}>
                        {driver.licenseExpiryDate} {expired && '(EXPIRED!)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-brand-secondary">
                      <Phone className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <span>CONTACT:</span>
                      <span className="text-white">{driver.contactNumber}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2">
                      RECRUITED: {driver.joinedDate}
                    </div>
                  </div>

                  {/* Critical Warning if expired */}
                  {expired && (
                    <div className="mt-3 p-2 bg-brand-error/10 border border-brand-error/20 rounded-lg flex items-center gap-2 text-[10px] text-brand-error">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-brand-error" />
                      <span>OPERATING CEASE ORDER: LICENSE LAPSED</span>
                    </div>
                  )}
                </div>

                {/* Configurations buttons */}
                <div className="flex gap-2 pt-4 border-t border-brand-outline/20 mt-4">
                  <button 
                    onClick={() => openEditModal(driver)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-brand-surface-high border border-brand-outline text-brand-secondary hover:text-white hover:border-brand-primary rounded-lg text-xs transition-all font-mono"
                  >
                    <Edit className="h-3 w-3" /> AUDIT STATUS
                  </button>
                  {driver.status !== 'On Trip' && (
                    <button 
                      onClick={() => {
                        if (confirm(`Remove operator ${driver.name} from active systems?`)) {
                          onDeleteDriver(driver.licenseNumber);
                        }
                      }}
                      className="px-3 py-1.5 bg-brand-surface-high border border-brand-outline text-brand-error hover:bg-brand-error/10 hover:border-brand-error rounded-lg text-xs transition-all"
                      title="De-recruit driver"
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

      {/* RECRUIT DRIVER MODAL */}
      {isAddDriverOpen && (
        <div className="fixed inset-0 bg-brand-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-brand-outline p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-brand-outline">
              <h3 className="text-lg font-display font-bold text-white">Recruit New Operator</h3>
              <button onClick={resetForm} className="text-brand-secondary hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-brand-error-container/30 border border-brand-error/50 rounded-lg text-brand-error text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">License Permit ID *</label>
                  <input 
                    type="text" 
                    value={licNum}
                    onChange={(e) => setLicNum(e.target.value)}
                    placeholder="e.g. DL-88214"
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Driver Full Name *</label>
                  <input 
                    type="text" 
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                    placeholder="e.g. Jameson Vance"
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">License Category</label>
                  <select 
                    value={licCat}
                    onChange={(e) => setLicCat(e.target.value as any)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                  >
                    <option value="HMV">Heavy Motor Vehicle (HMV)</option>
                    <option value="LMV">Light Motor Vehicle (LMV)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Contact Number *</label>
                  <input 
                    type="text" 
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. +1 (555) 012-3456"
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">License Expiry Date *</label>
                  <input 
                    type="date" 
                    value={licExpiry}
                    onChange={(e) => setLicExpiry(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Initial Safety Score (0-100)</label>
                  <input 
                    type="number" 
                    value={safety}
                    onChange={(e) => setSafety(Number(e.target.value))}
                    max={100}
                    min={0}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-brand-outline/40">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2 bg-brand-surface-high text-brand-secondary rounded-lg font-mono hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-black rounded-lg font-mono font-bold hover:bg-white transition-all"
                >
                  RECRUIT OPERATOR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIGURE DRIVER / EDIT MODAL */}
      {editingDriver && (
        <div className="fixed inset-0 bg-brand-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-brand-outline p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-brand-outline">
              <h3 className="text-lg font-display font-bold text-white">Compliance Audit: {editingDriver.name}</h3>
              <button onClick={() => setEditingDriver(null)} className="text-brand-secondary hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Driver Name</label>
                  <input 
                    type="text" 
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">License Category</label>
                  <select 
                    value={licCat}
                    onChange={(e) => setLicCat(e.target.value as any)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                  >
                    <option value="HMV">Heavy Motor Vehicle (HMV)</option>
                    <option value="LMV">Light Motor Vehicle (LMV)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">License Expiry Date</label>
                  <input 
                    type="date" 
                    value={licExpiry}
                    onChange={(e) => setLicExpiry(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Contact Number</label>
                  <input 
                    type="text" 
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Audit Safety Score (0-100)</label>
                  <input 
                    type="number" 
                    value={safety}
                    onChange={(e) => setSafety(Number(e.target.value))}
                    max={100}
                    min={0}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary font-mono mb-1.5 uppercase">Operator Duty Status</label>
                  <select 
                    value={dStatus}
                    onChange={(e) => setDStatus(e.target.value as any)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip (Locked when active)</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-brand-outline/40">
                <button 
                  type="button" 
                  onClick={() => setEditingDriver(null)}
                  className="px-4 py-2 bg-brand-surface-high text-brand-secondary rounded-lg font-mono hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-black rounded-lg font-mono font-bold hover:bg-white transition-all"
                >
                  SETTLE COMPLIANCE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
