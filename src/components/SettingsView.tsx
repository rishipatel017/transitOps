import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  RefreshCw, 
  HelpCircle, 
  Coins, 
  ShieldAlert, 
  Scale, 
  Check, 
  Info,
  Layers
} from 'lucide-react';
import { User, Role } from '../types';

export interface SystemSettings {
  fuelPricePerLiter: number;
  suspiciousFuelPriceThreshold: number;
  currencySymbol: string;
  safetyThreshold: number;
  cargoLimitHMV: number;
  cargoLimitLMV: number;
}

interface SettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
  onResetData: () => void;
  currentUser: User;
  vehiclesCount: number;
  driversCount: number;
  tripsCount: number;
  users?: User[];
  onUpdateUserStatus?: (email: string, status: 'Pending' | 'Active' | 'Rejected') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  currentUser,
  vehiclesCount,
  driversCount,
  tripsCount,
  users = [],
  onUpdateUserStatus
}) => {
  const [fuelPrice, setFuelPrice] = useState(settings.fuelPricePerLiter);
  const [susThreshold, setSusThreshold] = useState(settings.suspiciousFuelPriceThreshold);
  const [currency, setCurrency] = useState(settings.currencySymbol);
  const [safetyLim, setSafetyLim] = useState(settings.safetyThreshold);
  const [cargoHMV, setCargoHMV] = useState(settings.cargoLimitHMV);
  const [cargoLMV, setCargoLMV] = useState(settings.cargoLimitLMV);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      fuelPricePerLiter: Number(fuelPrice),
      suspiciousFuelPriceThreshold: Number(susThreshold),
      currencySymbol: currency,
      safetyThreshold: Number(safetyLim),
      cargoLimitHMV: Number(cargoHMV),
      cargoLimitLMV: Number(cargoLMV)
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6" id="settings-view-section">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">System Configuration Terminal</h2>
        <p className="text-xs text-brand-secondary">Configure pricing reference nodes, cargo weight limits, safety threshold score alerts, and environment resets.</p>
      </div>

      {/* Grid of panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-panels-grid">
        
        {/* Left Columns: Config Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 border border-brand-outline space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-brand-outline/40">
              <h3 className="text-md font-display font-semibold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand-primary" /> Operational Config Rules
              </h3>
              {savedSuccess && (
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <Check className="h-3 w-3" /> CONFIG RULES COMMITTED
                </span>
              )}
            </div>

            {/* Section 1: Financial & Currency */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-amber-400" /> Reference Pricing & Currency
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-brand-secondary mb-1.5 uppercase">Currency Symbol</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  >
                    <option value="₹">INR (₹)</option>
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                    <option value="¥">JPY (¥)</option>
                    <option value="₹">INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-brand-secondary mb-1.5 uppercase">Fuel Cost per Liter</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">Default rate for settled trips</span>
                </div>

                <div>
                  <label className="block text-brand-secondary mb-1.5 uppercase">Audit Flag Threshold</label>
                  <input
                    type="number"
                    step="0.01"
                    value={susThreshold}
                    onChange={(e) => setSusThreshold(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">Flag if price/L exceeds this</span>
                </div>
              </div>
            </div>

            {/* Section 2: Safety Officers thresholds */}
            <div className="space-y-4 pt-4 border-t border-brand-outline/20">
              <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-brand-error" /> Regulatory Compliance Limits
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-brand-secondary mb-1.5 uppercase">Critical Safety Threshold (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={safetyLim}
                    onChange={(e) => setSafetyLim(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">Flags scores below this as high-risk alerts</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-brand-surface-low rounded-lg border border-brand-outline/30 mt-5 text-[11px] font-sans text-brand-secondary">
                  <Info className="h-5 w-5 text-brand-primary shrink-0" />
                  <span>These safety guidelines are shared directly with the Safety Officer persona to auto-filter dispatch capabilities in real-time.</span>
                </div>
              </div>
            </div>

            {/* Section 3: Cargo Capacities */}
            <div className="space-y-4 pt-4 border-t border-brand-outline/20">
              <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-sky-400" /> Default Payload Class Thresholds
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-brand-secondary mb-1.5 uppercase">Heavy Truck Cargo Limit (kg)</label>
                  <input
                    type="number"
                    value={cargoHMV}
                    onChange={(e) => setCargoHMV(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary mb-1.5 uppercase">Light Cargo Van Limit (kg)</label>
                  <input
                    type="number"
                    value={cargoLMV}
                    onChange={(e) => setCargoLMV(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Action Row */}
            <div className="flex justify-end pt-4 border-t border-brand-outline/40">
              <button
                type="submit"
                className="px-6 py-2 bg-brand-primary text-black rounded-lg font-mono font-bold hover:bg-white transition-all shadow-lg shadow-brand-primary/10 text-xs"
              >
                COMMIT SETTINGS CHANGE
              </button>
            </div>
          </form>

          {currentUser.role === 'Fleet Manager' && (
            <div className="glass-card rounded-2xl p-6 border border-brand-outline space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-brand-outline/40">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                <h3 className="text-md font-display font-semibold text-white">Pending Access Requests</h3>
              </div>
              
              {users.filter(u => u.status === 'Pending').length === 0 ? (
                <div className="text-xs text-brand-secondary p-4 bg-brand-surface rounded-lg border border-brand-outline/30 text-center">
                  No pending access requests at this time.
                </div>
              ) : (
                <div className="space-y-3">
                  {users.filter(u => u.status === 'Pending').map(user => (
                    <div key={user.email} className="flex items-center justify-between p-3 bg-brand-surface rounded-xl border border-brand-outline/40">
                      <div className="flex items-center gap-3">
                        <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full border-2 border-brand-primary/30" />
                        <div>
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-[10px] text-brand-secondary font-mono">{user.email} • {user.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateUserStatus?.(user.email, 'Active')}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/30 transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onUpdateUserStatus?.(user.email, 'Rejected')}
                          className="px-3 py-1.5 bg-brand-error/20 hover:bg-brand-error/40 text-brand-error text-[10px] font-bold uppercase rounded border border-brand-error/30 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Database diagnostics & controls */}
        <div className="space-y-6">
          {/* Active Database Panel */}
          <div className="glass-card p-5 rounded-2xl border border-brand-outline space-y-4">
            <h3 className="text-md font-display font-semibold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400 animate-pulse" /> Active Schema Status
            </h3>
            
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between border-b border-brand-outline/20 pb-2">
                <span className="text-gray-500">ENGINE ID</span>
                <span className="text-white font-bold">TransitOps LocalEngine</span>
              </div>
              <div className="flex justify-between border-b border-brand-outline/20 pb-2">
                <span className="text-gray-500">PERSISTENCE</span>
                <span className="text-emerald-400 font-bold">LocalStore Sync API</span>
              </div>
              <div className="flex justify-between border-b border-brand-outline/20 pb-2">
                <span className="text-gray-500">REGISTERED VEHICLES</span>
                <span className="text-white">{vehiclesCount} assets</span>
              </div>
              <div className="flex justify-between border-b border-brand-outline/20 pb-2">
                <span className="text-gray-500">REGISTERED DRIVERS</span>
                <span className="text-white">{driversCount} operators</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-500">DISPATCHED RUNS</span>
                <span className="text-white">{tripsCount} trips</span>
              </div>
            </div>

            <div className="p-3 bg-brand-surface rounded-xl border border-brand-outline/40 text-[10.5px] text-brand-secondary leading-relaxed">
              <strong>Database Warning:</strong> Modifying operational configs updates parameters on the fly. State changes propagate to active dispatches and financial ledgers immediately upon commit.
            </div>
          </div>

          {/* Reboot panel */}
          <div className="glass-card p-5 rounded-2xl border border-brand-outline space-y-4">
            <h3 className="text-md font-display font-semibold text-brand-error flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-brand-error" /> Disaster Recovery
            </h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              Perform a hard factory reboot on the simulation state cache. This replaces all active entities, custom vehicles, and work ledger expenses with pristine developer seed defaults.
            </p>
            <button
              type="button"
              onClick={onResetData}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-brand-error text-brand-error hover:bg-brand-error/10 rounded-lg text-xs font-mono font-bold transition-all"
            >
              <RefreshCw className="h-4 w-4" /> REBOOT DATA MODEL
            </button>
          </div>

          {/* System details */}
          <div className="glass-card p-5 rounded-2xl border border-brand-outline">
            <h3 className="text-md font-display font-semibold text-white flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-brand-primary" /> Application Environment
            </h3>
            <div className="text-[11px] text-brand-secondary space-y-1 font-mono">
              <p>Platform: <span className="text-white">Cloud Run DevHost</span></p>
              <p>Version: <span className="text-white">v2.4 (React 19 + Tailwind v4)</span></p>
              <p>HMR Port: <span className="text-white">Disable (HMR: true)</span></p>
              <p>Host: <span className="text-white">0.0.0.0:3000</span></p>
              <p>User Role: <span className="text-brand-primary font-bold">{currentUser.role}</span></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
