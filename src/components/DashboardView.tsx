import React from 'react';
import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Role } from '../types';
import { 
  TrendingUp, 
  Truck, 
  Users, 
  Navigation, 
  Wrench, 
  AlertTriangle, 
  DollarSign, 
  Compass, 
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceLog[];
  fuel: FuelLog[];
  expenses: Expense[];
  currentRole: Role;
  onNavigate: (tab: string) => void;
  currencySymbol?: string;
  currentDriver?: Driver;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicles,
  drivers,
  trips,
  maintenance,
  fuel,
  expenses,
  currentRole,
  onNavigate,
  currencySymbol = '₹',
  currentDriver
}) => {
  // Calculations
  const activeVehiclesCount = vehicles.filter(v => v.status !== 'Retired').length;
  const inShopCount = vehicles.filter(v => v.status === 'In Shop').length;
  const onTripCount = vehicles.filter(v => v.status === 'On Trip').length;
  
  const completedTrips = trips.filter(t => t.status === 'Completed').length;
  const dispatchedTrips = trips.filter(t => t.status === 'Dispatched').length;
  
  const expiredLicenses = drivers.filter(d => {
    const expiry = new Date(d.licenseExpiryDate);
    const today = new Date('2026-07-11'); // standard app reference time
    return expiry < today;
  }).length;

  const lowSafetyDrivers = drivers.filter(d => d.safetyScore < 70).length;

  // Financial Stats
  const totalFuelCost = fuel.reduce((sum, f) => sum + f.cost, 0);
  const totalMaintenanceCost = expenses
    .filter(e => e.type === 'Maintenance')
    .reduce((sum, e) => sum + e.amount, 0) + 
    maintenance.filter(m => m.status === 'Completed').reduce((sum, m) => sum + m.costEstimate, 0);
  
  const totalOtherExpenses = expenses
    .filter(e => e.type !== 'Maintenance')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;
  const totalRevenue = trips
    .filter(t => t.status === 'Completed' || t.status === 'Dispatched')
    .reduce((sum, t) => sum + t.revenue, 0);
  
  const netROI = totalExpense > 0 
    ? Math.round(((totalRevenue - totalExpense) / totalExpense) * 100) 
    : 0;

  // Chart data: Fuel and Maintenance by Vehicle
  const vehicleFinancials = vehicles.map(v => {
    const vehicleFuel = fuel.filter(f => f.vehicleId === v.registrationNumber).reduce((sum, f) => sum + f.cost, 0);
    const vehicleMaint = maintenance
      .filter(m => m.vehicleId === v.registrationNumber && m.status === 'Completed')
      .reduce((sum, m) => sum + m.costEstimate, 0) +
      expenses.filter(e => e.vehicleId === v.registrationNumber && e.type === 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
    
    return {
      name: v.nickname || v.name.split(' ')[0],
      Fuel: vehicleFuel,
      Maintenance: vehicleMaint,
      Total: vehicleFuel + vehicleMaint
    };
  }).filter(item => item.Total > 0);

  // Chart data: Vehicle Type distribution
  const typeData = [
    { name: 'Heavy Trucks', value: vehicles.filter(v => v.type === 'Truck').length, color: '#ffc880' },
    { name: 'Vans', value: vehicles.filter(v => v.type === 'Van').length, color: '#38bdf8' },
    { name: 'Minis', value: vehicles.filter(v => v.type === 'Mini').length, color: '#34d399' }
  ];

  // Safety Score summary for chart
  const safetyData = drivers.map(d => ({
    name: d.name.split(' ')[0],
    score: d.safetyScore
  }));

  // Driver-specific calculations
  const driverActiveTrips = trips.filter(t => t.status === 'Assigned' || t.status === 'Dispatched').length;
  const driverCompletedTrips = trips.filter(t => t.status === 'Completed').length;
  const driverTotalDistance = trips.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.plannedDistance, 0);
  const driverFuelCost = fuel.reduce((sum, f) => sum + f.cost, 0);


  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Role-Specific Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-brand-outline-accent/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="dashboard-hero">
        <div>
          <span className="text-xs font-mono tracking-widest text-brand-primary uppercase">Active Session Persona</span>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-white mt-1">
            {currentRole === 'Fleet Manager' && "Fleet Commander Terminal"}
            {currentRole === 'Driver' && "Co-Pilot / Driver Assist Panel"}
            {currentRole === 'Safety Officer' && "Regulatory & Safety Control"}
            {currentRole === 'Financial Analyst' && "Financial Performance Matrix"}
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            {currentRole === 'Fleet Manager' && "Operational metrics, fleet utilization logs, and asset allocation indexes."}
            {currentRole === 'Driver' && "Dispatch schedule, real-time cargo logs, and active navigation indicators."}
            {currentRole === 'Safety Officer' && "Driver license compliance rosters, driver safety scores, and incident logs."}
            {currentRole === 'Financial Analyst' && "Operational ROI curves, fuel purchase audits, and maintenance cost balances."}
          </p>
        </div>
        <div className="bg-brand-surface-high/60 px-4 py-2.5 rounded-xl border border-brand-outline flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
          </span>
          <div className="text-right">
            <div className="text-xs font-mono text-brand-secondary">SYSTEM TIME</div>
            <div className="text-sm font-mono font-semibold text-brand-primary">2026-07-11 14:35 UTC</div>
          </div>
        </div>
      </div>

      {/* Role-tailored alert banners */}
      {currentRole === 'Safety Officer' && expiredLicenses > 0 && (
        <div className="bg-brand-error-container/40 border border-brand-error/40 p-4 rounded-xl flex items-center gap-4 text-brand-error animate-pulse-slow" id="safety-alert">
          <AlertTriangle className="h-6 w-6 shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-white">Critical Compliance Warning</h4>
            <p className="text-sm text-brand-error/90">
              There are {expiredLicenses} driver(s) currently registered with expired operating permits. Immediate suspension required.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('drivers')}
            className="px-4 py-1.5 bg-brand-error text-brand-error-container rounded-lg font-mono text-xs font-bold hover:bg-white hover:text-brand-error-container transition-all"
          >
            RESOLVE NOW
          </button>
        </div>
      )}

      {currentRole === 'Fleet Manager' && inShopCount > 0 && (
        <div className="bg-yellow-950/25 border border-brand-primary/40 p-4 rounded-xl flex items-center gap-4 text-brand-primary" id="manager-alert">
          <Wrench className="h-6 w-6 shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-white">Maintenance Alerts Active</h4>
            <p className="text-sm text-brand-secondary">
              {inShopCount} vehicle(s) are currently flagged as "In Shop" for diagnostics. Complete their active logs to return them to service.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('fleet')}
            className="px-4 py-1.5 bg-brand-primary text-black rounded-lg font-mono text-xs font-bold hover:bg-white transition-all"
          >
            OPEN WORK ORDERS
          </button>
        </div>
      )}

      {currentRole === 'Financial Analyst' && fuel.some(f => f.status === 'Flagged') && (
        <div className="bg-orange-950/30 border border-brand-primary-container/50 p-4 rounded-xl flex items-center gap-4 text-brand-primary-container" id="analyst-alert">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-white">Auditing Required</h4>
            <p className="text-sm text-brand-secondary">
              High fuel price anomaly detected in recent logs. 1 transaction has been flagged for audit review.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('finance')}
            className="px-4 py-1.5 bg-brand-primary-container text-black rounded-lg font-mono text-xs font-bold hover:bg-white transition-all"
          >
            AUDIT LOGS
          </button>
        </div>
      )}

      {/* Grid of KPI Cards */}
      {currentRole === 'Driver' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="driver-kpi-grid">
          {/* Driver Card 1 */}
          <div className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-brand-primary/40 transition-all duration-300">
            <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
              <Navigation className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-brand-secondary font-mono">ACTIVE ASSIGNMENTS</div>
              <div className="text-2xl font-display font-bold text-white mt-1">
                {driverActiveTrips} <span className="text-xs text-brand-secondary font-normal">trips</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                {driverActiveTrips > 0 ? 'Action Required' : 'All caught up'}
              </div>
            </div>
          </div>

          {/* Driver Card 2 */}
          <div className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-brand-primary/40 transition-all duration-300">
            <div className="p-3 bg-brand-tertiary/10 rounded-lg text-brand-tertiary">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-brand-secondary font-mono">TOTAL DISTANCE</div>
              <div className="text-2xl font-display font-bold text-white mt-1">
                {driverTotalDistance.toLocaleString()} <span className="text-xs text-brand-secondary font-normal">km</span>
              </div>
              <div className="text-[10px] text-brand-secondary font-mono mt-0.5">
                From {driverCompletedTrips} completed trips
              </div>
            </div>
          </div>

          {/* Driver Card 3 */}
          <div className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-brand-primary/40 transition-all duration-300">
            <div className="p-3 bg-brand-primary-container/10 rounded-lg text-brand-primary-container">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-brand-secondary font-mono">MY SAFETY SCORE</div>
              <div className="text-2xl font-display font-bold text-white mt-1">
                {currentDriver?.safetyScore || 'N/A'} <span className="text-xs text-brand-secondary font-normal">/ 100</span>
              </div>
              <div className="text-[10px] text-brand-secondary font-mono mt-0.5">
                Rating from dispatch
              </div>
            </div>
          </div>

          {/* Driver Card 4 */}
          <div className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-brand-primary/40 transition-all duration-300">
            <div className="p-3 bg-brand-secondary/10 rounded-lg text-brand-secondary">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-brand-secondary font-mono">MY FUEL LOGGED</div>
              <div className="text-2xl font-display font-bold text-white mt-1">
                {currencySymbol}{driverFuelCost.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                Approved logs
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
          {/* Card 1 */}
          <div className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-brand-primary/40 transition-all duration-300 group" id="kpi-card-1">
            <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-black transition-all">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-brand-secondary font-mono">ACTIVE FLEET SIZE</div>
              <div className="text-2xl font-display font-bold text-white mt-1">
                {activeVehiclesCount} <span className="text-xs text-brand-secondary font-normal">assets</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {onTripCount} deployed on trips
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-brand-primary/40 transition-all duration-300 group" id="kpi-card-2">
            <div className="p-3 bg-brand-tertiary/10 rounded-lg text-brand-tertiary group-hover:bg-brand-tertiary group-hover:text-black transition-all">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-brand-secondary font-mono">DRIVER FORCE</div>
              <div className="text-2xl font-display font-bold text-white mt-1">
                {drivers.length} <span className="text-xs text-brand-secondary font-normal">registered</span>
              </div>
              {expiredLicenses > 0 ? (
                <div className="text-[10px] text-brand-error font-mono mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {expiredLicenses} license alert(s)
                </div>
              ) : (
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  100% Safety compliant
                </div>
              )}
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-brand-primary/40 transition-all duration-300 group" id="kpi-card-3">
            <div className="p-3 bg-brand-primary-container/10 rounded-lg text-brand-primary-container group-hover:bg-brand-primary-container group-hover:text-black transition-all">
              <Navigation className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-brand-secondary font-mono">TRANSIT ACTIVE / DONE</div>
              <div className="text-2xl font-display font-bold text-white mt-1">
                {dispatchedTrips} <span className="text-xs text-brand-secondary font-normal">/ {completedTrips}</span>
              </div>
              <div className="text-[10px] text-brand-secondary font-mono mt-0.5">
                Total {trips.length} orders logged
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-brand-primary/40 transition-all duration-300 group" id="kpi-card-4">
            <div className="p-3 bg-brand-secondary/10 rounded-lg text-brand-secondary group-hover:bg-brand-secondary group-hover:text-black transition-all">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-brand-secondary font-mono">OPERATIONAL ROI</div>
              <div className="text-2xl font-display font-bold text-white mt-1">
                {netROI}%
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                Net Profit: {currencySymbol}{Math.max(0, totalRevenue - totalExpense).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role-tailored Dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-grid">
        
        {/* Left 2 Columns: Visual Performance charts */}
        <div className="lg:col-span-2 space-y-6">
          {currentRole === 'Driver' ? (
            <div className="glass-card p-5 rounded-xl border border-brand-outline h-full" id="driver-recent-activity">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-display font-semibold text-white">My Operations Log</h3>
                  <p className="text-xs text-brand-secondary">Recent trips and route assignments</p>
                </div>
                <button 
                  onClick={() => onNavigate('trips')}
                  className="text-xs text-brand-primary font-mono hover:underline"
                >
                  View all trips &rarr;
                </button>
              </div>
              <div className="space-y-3">
                {trips.length === 0 ? (
                  <div className="text-center py-6 text-xs text-brand-secondary">No recent trips found.</div>
                ) : (
                  [...trips].reverse().slice(0, 5).map(trip => {
                    const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleId);
                    return (
                      <div key={trip.id} className="p-4 bg-brand-surface rounded-lg border border-brand-outline/40 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-brand-primary">{trip.id}</span>
                            <span className="text-[9px] font-mono bg-brand-surface-high px-1.5 py-0.5 rounded uppercase">{trip.status}</span>
                          </div>
                          <div className="text-sm font-semibold text-white">{trip.source} &rarr; {trip.destination}</div>
                          <div className="text-xs text-brand-secondary mt-1">{vehicle?.nickname || trip.vehicleId} • {trip.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">{trip.plannedDistance} km</div>
                          <div className="text-xs text-emerald-400 mt-1">+{currencySymbol}{trip.revenue.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Chart 1: Financial Breakdown */}
              <div className="glass-card p-5 rounded-xl border border-brand-outline" id="chart-card-financials">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-display font-semibold text-white">Asset Operational Expense</h3>
                    <p className="text-xs text-brand-secondary">Combines fuel fill logs and routine/active maintenance work logs</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 bg-brand-surface rounded text-brand-primary">LIFETIME COSTS</span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vehicleFinancials} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0c1929', borderColor: '#334155', borderRadius: '8px' }} 
                        labelStyle={{ color: '#fff', fontFamily: 'Lexend' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter' }} />
                      <Bar dataKey="Fuel" name={`Fuel Cost (${currencySymbol})`} fill="#f5a623" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Maintenance" name={`Maintenance (${currencySymbol})`} fill="#ffc880" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Drivers safety score rating list */}
              <div className="glass-card p-5 rounded-xl border border-brand-outline" id="chart-card-safety">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-display font-semibold text-white">Driver Performance Metrics</h3>
                    <p className="text-xs text-brand-secondary">Dynamic safety ratings tracked via dispatcher feedbacks and telematics</p>
                  </div>
                  <button 
                    onClick={() => onNavigate('drivers')}
                    className="text-xs text-brand-primary font-mono hover:underline flex items-center gap-1"
                  >
                    Go to compliance console &rarr;
                  </button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={safetyData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0c1929', borderColor: '#334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="score" name="Safety Score (0-100)" stroke="#38bdf8" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Key details / Distribution and Recent Trips activity */}
        <div className="space-y-6">
          
          {/* Card: Vehicle Class Distribution */}
          <div className="glass-card p-5 rounded-xl border border-brand-outline flex flex-col justify-between" id="distribution-card">
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Vehicle Distribution</h3>
              <p className="text-xs text-brand-secondary">Share of active classes in the system</p>
            </div>
            
            <div className="h-48 my-2 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-2xl font-bold font-display text-white">{vehicles.length}</span>
                <p className="text-[10px] text-brand-secondary font-mono">TOTAL UNITS</p>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              {typeData.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-brand-secondary">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </div>
                  <span className="font-mono font-bold text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Active Trips Status Feed */}
          <div className="glass-card p-5 rounded-xl border border-brand-outline" id="active-trips-feed">
            <h3 className="text-lg font-display font-semibold text-white mb-4">Active Deliveries</h3>
            <div className="space-y-3">
              {trips.filter(t => t.status === 'Dispatched').length === 0 ? (
                <div className="text-center py-6 text-xs text-brand-secondary">
                  No active dispatches currently in transit.
                </div>
              ) : (
                trips.filter(t => t.status === 'Dispatched').map(trip => {
                  const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleId);
                  const driver = drivers.find(d => d.licenseNumber === trip.driverId);
                  return (
                    <div key={trip.id} className="p-3 bg-brand-surface rounded-lg border border-brand-outline/40 hover:border-brand-primary/20 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-brand-primary font-bold">{trip.id}</span>
                          <h4 className="text-xs font-semibold text-white mt-0.5">{trip.routeName || `${trip.source} to ${trip.destination}`}</h4>
                        </div>
                        <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/20">
                          ON ROUTE
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-brand-outline/20 text-[10px] text-brand-secondary font-mono">
                        <div>
                          <span className="text-gray-500">DRIVER:</span> {driver?.name || trip.driverId}
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">VEHICLE:</span> {vehicle?.nickname || trip.vehicleId}
                        </div>
                        <div>
                          <span className="text-gray-500">WEIGHT:</span> {trip.cargoWeight} kg
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">ETA:</span> {trip.eta}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
