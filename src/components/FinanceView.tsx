import React, { useState } from 'react';
import { FuelLog, Expense, Vehicle } from '../types';
import { 
  DollarSign, 
  Coins, 
  Wrench, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  X, 
  Layers, 
  TrendingUp,
  Cpu
} from 'lucide-react';

interface FinanceViewProps {
  fuel: FuelLog[];
  expenses: Expense[];
  vehicles: Vehicle[];
  onAddFuelLog: (log: FuelLog) => void;
  onAddExpense: (expense: Expense) => void;
  onApproveFuelLog: (id: string) => void;
  currencySymbol?: string;
  suspiciousThreshold?: number;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  fuel,
  expenses,
  vehicles,
  onAddFuelLog,
  onAddExpense,
  onApproveFuelLog,
  currencySymbol = '$',
  suspiciousThreshold = 4.5
}) => {
  const [isAddFuelOpen, setIsAddFuelOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Form - Fuel Log
  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [fuelLiters, setFuelLiters] = useState(80);
  const [fuelCost, setFuelCost] = useState(240);
  const [fuelDate, setFuelDate] = useState('2026-07-11');

  // Form - Expense
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expType, setExpType] = useState<Expense['type']>('Toll');
  const [expAmount, setExpAmount] = useState(35);
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState('2026-07-11');

  // Filter state for fuel audit
  const [fuelFilter, setFuelFilter] = useState<'All' | 'Approved' | 'Flagged'>('All');

  const todayStr = '2026-07-11';

  // Math Calculations
  const totalFuelSpend = fuel.reduce((sum, f) => sum + f.cost, 0);
  const totalMaintSpend = expenses.filter(e => e.type === 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
  const totalOtherSpend = expenses.filter(e => e.type !== 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
  const totalOutflows = totalFuelSpend + totalMaintSpend + totalOtherSpend;

  // Let's assume some constant revenues fromcompleted trips or simulated values.
  // Actually, we can pass down totalCompletedRevenue from App.tsx or calculate it statically if trips aren't here. 
  // Let's calculate typical revenue. In App.tsx, we'll keep the actual state synchronised.
  // For the UI, we can show a nice break down of spending classes.

  const handleAddFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelVehicleId) return;

    // Check if fuel price is suspiciously high (e.g. > dynamic threshold)
    const pricePerLiter = fuelCost / fuelLiters;
    const isSuspicious = pricePerLiter > suspiciousThreshold;

    const newLog: FuelLog = {
      id: `FL-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: fuelVehicleId,
      liters: Number(fuelLiters),
      cost: Number(fuelCost),
      date: fuelDate,
      status: isSuspicious ? 'Flagged' : 'Approved'
    };

    onAddFuelLog(newLog);
    setIsAddFuelOpen(false);
    setFuelVehicleId('');
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expVehicleId || !expDesc.trim()) return;

    const newExpense: Expense = {
      id: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: expVehicleId,
      type: expType,
      amount: Number(expAmount),
      date: expDate,
      description: expDesc.trim()
    };

    onAddExpense(newExpense);
    setIsAddExpenseOpen(false);
    setExpDesc('');
    setExpVehicleId('');
  };

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Record ID,Vehicle,Date,Amount/Cost,Details/Liters,Status\n";

    // Add Fuel Logs
    fuel.forEach(f => {
      csvContent += `Fuel Log,${f.id},${f.vehicleId},${f.date},${f.cost},${f.liters} Liters,${f.status}\n`;
    });

    // Add Expenses
    expenses.forEach(e => {
      csvContent += `Expense Ledger,${e.id},${e.vehicleId},${e.date},${e.amount},"${e.description.replace(/"/g, '""')}",Approved\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_financial_ledger_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFuel = fuel.filter(f => fuelFilter === 'All' || f.status === fuelFilter);

  return (
    <div className="space-y-6" id="finance-section">
      
      {/* Header and Export Tools */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="finance-header">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Financial Ledger & Audits</h2>
          <p className="text-xs text-brand-secondary">Track fuel outflows, allocate tolls/parking receipts, and audit transaction anomalies.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-surface-high border border-brand-outline text-brand-primary rounded-lg font-semibold font-mono text-xs hover:border-brand-primary hover:text-white transition-all"
          >
            <Download className="h-4 w-4" /> EXPORT FINANCIALS (CSV)
          </button>
          <button 
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-black rounded-lg font-semibold font-mono text-xs hover:bg-white transition-all shadow-lg shadow-brand-primary/10"
          >
            <Plus className="h-4 w-4" /> LOG OPERATIONAL EXPENSE
          </button>
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="financial-balances">
        {/* Total Cost Outflows */}
        <div className="p-5 bg-brand-surface rounded-xl border border-brand-outline">
          <span className="text-[10px] text-gray-500 font-mono block">TOTAL OUTFLOWS</span>
          <span className="text-2xl font-display font-bold text-white mt-1">{currencySymbol}{totalOutflows.toLocaleString()}</span>
          <p className="text-[10px] text-brand-secondary mt-1">All fuel & maintenance events</p>
        </div>

        {/* Total Fuel Spend */}
        <div className="p-5 bg-brand-surface rounded-xl border border-brand-outline">
          <span className="text-[10px] text-gray-500 font-mono block">FUEL PURCHASES</span>
          <span className="text-2xl font-display font-bold text-amber-400 mt-1">{currencySymbol}{totalFuelSpend.toLocaleString()}</span>
          <p className="text-[10px] text-brand-secondary mt-1">{fuel.reduce((sum, f) => sum + f.liters, 0).toLocaleString()} Liters consumed</p>
        </div>

        {/* Maintenance Allocations */}
        <div className="p-5 bg-brand-surface rounded-xl border border-brand-outline">
          <span className="text-[10px] text-gray-500 font-mono block">MAINTENANCE ALLOCATIONS</span>
          <span className="text-2xl font-display font-bold text-sky-400 mt-1">{currencySymbol}{totalMaintSpend.toLocaleString()}</span>
          <p className="text-[10px] text-brand-secondary mt-1">Settle repair work invoices</p>
        </div>

        {/* Other operational costs */}
        <div className="p-5 bg-brand-surface rounded-xl border border-brand-outline">
          <span className="text-[10px] text-gray-500 font-mono block">TOLLS & OTHER CHARGES</span>
          <span className="text-2xl font-display font-bold text-brand-secondary mt-1">{currencySymbol}{totalOtherSpend.toLocaleString()}</span>
          <p className="text-[10px] text-brand-secondary mt-1">Parking fees, tags & recoveries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="finance-grids">
        
        {/* Left Column: Fuel Log Monitoring & Audits */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-brand-outline" id="fuel-monitoring-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-400" /> Fuel Fill Logs & Audits
                </h3>
                <p className="text-xs text-brand-secondary">Monitor liters filled, transaction values, and flag suspicious price exceptions.</p>
              </div>
              <button 
                onClick={() => setIsAddFuelOpen(true)}
                className="px-3.5 py-1.5 bg-brand-surface-high border border-brand-outline text-brand-primary rounded-lg font-semibold font-mono text-xs hover:border-brand-primary hover:text-white transition-all flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> LOG FUEL FILL
              </button>
            </div>

            {/* Fuel Log Filter Buttons */}
            <div className="flex gap-2 mb-4 text-xs font-mono">
              {(['All', 'Approved', 'Flagged'] as const).map(fState => (
                <button
                  key={fState}
                  onClick={() => setFuelFilter(fState)}
                  className={`px-3 py-1 rounded-md font-bold uppercase transition-all ${
                    fuelFilter === fState 
                      ? 'bg-amber-400 text-black' 
                      : 'bg-brand-surface-lowest text-brand-secondary hover:text-white border border-brand-outline/40'
                  }`}
                >
                  {fState} LOGS
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-outline/50 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    <th className="py-3 px-3">Log ID</th>
                    <th className="py-3 px-3">Vehicle</th>
                    <th className="py-3 px-3">Volume (L)</th>
                    <th className="py-3 px-3">Total Cost</th>
                    <th className="py-3 px-3">Unit Price</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-outline/20 text-xs font-mono">
                  {filteredFuel.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-brand-secondary">
                        No fuel transactions fit the active filter.
                      </td>
                    </tr>
                  ) : (
                    [...filteredFuel].reverse().map(f => {
                      const pricePerLiter = f.cost / f.liters;
                      const targetVehicle = vehicles.find(v => v.registrationNumber === f.vehicleId);
                      return (
                        <tr key={f.id} className={`hover:bg-brand-surface-low/30 transition-all ${f.status === 'Flagged' ? 'bg-rose-950/10' : ''}`}>
                          <td className="py-3 px-3 text-brand-primary font-bold">{f.id}</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-white block">{targetVehicle?.nickname || f.vehicleId}</span>
                            <span className="text-[10px] text-gray-500">{f.vehicleId}</span>
                          </td>
                          <td className="py-3 px-3 text-brand-secondary">{f.liters} L</td>
                          <td className="py-3 px-3 font-bold text-white">{currencySymbol}{f.cost}</td>
                          <td className={`py-3 px-3 ${pricePerLiter > suspiciousThreshold ? 'text-brand-error font-bold' : 'text-brand-secondary'}`}>
                            {currencySymbol}{pricePerLiter.toFixed(2)}/L
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.status === 'Approved' 
                                ? 'bg-emerald-500/15 text-emerald-400' 
                                : 'bg-brand-error/15 text-brand-error animate-pulse'
                            }`}>
                              {f.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {f.status === 'Flagged' ? (
                              <button
                                onClick={() => onApproveFuelLog(f.id)}
                                className="px-2 py-0.5 bg-emerald-500 text-black rounded text-[10px] font-bold hover:bg-white transition-all"
                              >
                                APPROVE
                              </button>
                            ) : (
                              <span className="text-emerald-400 text-[10px] flex items-center justify-end gap-1 font-semibold">
                                <CheckCircle className="h-3 w-3" /> Settled
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
        </div>

        {/* Right Column: Expense Ledger */}
        <div>
          <div className="glass-card rounded-2xl p-5 border border-brand-outline space-y-4" id="other-expenses-ledger">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-display font-semibold text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-brand-primary" /> Expense Ledger
              </h3>
              <span className="text-[10px] font-mono text-gray-500">GENERAL COSTS</span>
            </div>

            <div className="space-y-3">
              {expenses.length === 0 ? (
                <div className="text-center py-6 text-xs text-brand-secondary font-mono">
                  No operational expense transactions on file.
                </div>
              ) : (
                [...expenses].reverse().map(e => {
                  const targetVehicle = vehicles.find(v => v.registrationNumber === e.vehicleId);
                  return (
                    <div key={e.id} className="p-3 bg-brand-surface rounded-lg border border-brand-outline/30 hover:border-brand-primary/20 transition-all flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-brand-primary font-bold">{e.id}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                            e.type === 'Toll' ? 'bg-amber-500/10 text-amber-400' :
                            e.type === 'Parking' ? 'bg-sky-500/10 text-sky-400' :
                            e.type === 'Maintenance' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-slate-500/10 text-slate-400'
                          }`}>
                            {e.type}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white">{e.description}</h4>
                        <span className="text-[10px] text-gray-500 font-mono block">Asset: {targetVehicle?.nickname || e.vehicleId} • {e.date}</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-white shrink-0 pl-2">
                        -{currencySymbol}{e.amount}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* LOG FUEL FILL MODAL */}
      {isAddFuelOpen && (
        <div className="fixed inset-0 bg-brand-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-brand-outline p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-brand-outline">
              <h3 className="text-md font-display font-bold text-white flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-400" /> Log Fuel Purchase
              </h3>
              <button onClick={() => setIsAddFuelOpen(false)} className="text-brand-secondary hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddFuelSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-brand-secondary mb-1.5 uppercase">Target Vehicle *</label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  required
                >
                  <option value="">-- Choose Asset --</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>
                      {v.nickname || v.name} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-brand-secondary mb-1.5 uppercase">Liters Filled</label>
                  <input 
                    type="number" 
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary mb-1.5 uppercase">Total Paid ({currencySymbol})</label>
                  <input 
                    type="number" 
                    value={fuelCost}
                    onChange={(e) => setFuelCost(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-secondary mb-1.5 uppercase">Purchase Date</label>
                <input 
                  type="date" 
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  required
                />
                <p className="text-[10px] text-gray-500 font-sans mt-2">
                  System Audit: Liter costs higher than <strong>{currencySymbol}4.50/Liter</strong> are automatically marked for audit review as <strong>Flagged</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-brand-outline/40">
                <button 
                  type="button" 
                  onClick={() => setIsAddFuelOpen(false)}
                  className="px-3 py-1.5 bg-brand-surface-high text-brand-secondary rounded-lg hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary text-black rounded-lg font-bold hover:bg-white transition-all"
                >
                  SAVE FUEL LOG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG OPERATIONAL EXPENSE MODAL */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 bg-brand-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-brand-outline p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-brand-outline">
              <h3 className="text-md font-display font-bold text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-brand-primary" /> Log Operational Expense
              </h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-brand-secondary hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-brand-secondary mb-1.5 uppercase">Associated Vehicle *</label>
                <select
                  value={expVehicleId}
                  onChange={(e) => setExpVehicleId(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  required
                >
                  <option value="">-- Choose Asset --</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>
                      {v.nickname || v.name} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-brand-secondary mb-1.5 uppercase">Expense Type</label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value as any)}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary font-mono"
                  >
                    <option value="Toll">Toll Fee</option>
                    <option value="Parking">Parking Fee</option>
                    <option value="Maintenance">Maintenance Cost</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-secondary mb-1.5 uppercase">Amount Paid ({currencySymbol})</label>
                  <input 
                    type="number" 
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-secondary mb-1.5 uppercase">Description *</label>
                <input 
                  type="text" 
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Toll road I-45 West"
                  className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-brand-secondary mb-1.5 uppercase">Expense Date</label>
                <input 
                  type="date" 
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-brand-outline/40">
                <button 
                  type="button" 
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-3 py-1.5 bg-brand-surface-high text-brand-secondary rounded-lg hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary text-black rounded-lg font-bold hover:bg-white transition-all"
                >
                  SAVE EXPENSE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
