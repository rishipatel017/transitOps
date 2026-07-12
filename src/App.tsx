import React, { useState, useEffect } from 'react';
import { getInitialState, saveState, SYSTEM_USERS } from './data';
import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Role, User } from './types';
import { DashboardView } from './components/DashboardView';
import { FleetView } from './components/FleetView';
import { DriversView } from './components/DriversView';
import { TripsView } from './components/TripsView';
import { FinanceView } from './components/FinanceView';
import { MaintenanceView } from './components/MaintenanceView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView, SystemSettings } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { LandingView } from './components/LandingView';
import { motion } from 'motion/react';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { Chatbot } from './components/Chatbot';
import { 
  Compass, 
  Truck, 
  Users, 
  Navigation, 
  DollarSign, 
  RefreshCw, 
  UserCheck, 
  ChevronDown,
  Activity,
  Menu,
  X,
  Wrench,
  TrendingUp,
  Settings,
  LogOut,
  Lock
} from 'lucide-react';

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  'Fleet Manager': ['dashboard', 'fleet', 'drivers', 'trips', 'maintenance', 'finance', 'analytics', 'settings'],
  'Driver': ['dashboard', 'trips'],
  'Safety Officer': ['dashboard', 'fleet', 'drivers', 'maintenance'],
  'Financial Analyst': ['dashboard', 'finance', 'analytics', 'settings']
};

function AppInner() {
  // Load State from local storage or defaults
  const toast = useToast();
  const [state, setState] = useState(() => getInitialState());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // System Settings state synced with localStorage
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('transitops_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      fuelPricePerLiter: 3.00,
      suspiciousFuelPriceThreshold: 4.50,
      currencySymbol: '$',
      safetyThreshold: 70,
      cargoLimitHMV: 15000,
      cargoLimitLMV: 3500
    };
  });

  // Auto-persist settings changes
  useEffect(() => {
    localStorage.setItem('transitops_settings', JSON.stringify(settings));
  }, [settings]);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('transitops_authenticated') === 'true';
  });

  // Auto-persist state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Redirect to permitted tab when role changes
  useEffect(() => {
    const allowed = ROLE_PERMISSIONS[state.currentUser?.role] || ['dashboard'];
    if (!allowed.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [state.currentUser?.role, activeTab]);

  const { vehicles, drivers, trips, maintenance, fuel, expenses, users = [], currentUser } = state;

  // Authentication Handlers
  const handleLogin = (user: User) => {
    setState(prev => ({
      ...prev,
      currentUser: user
    }));
    setIsAuthenticated(true);
    localStorage.setItem('transitops_authenticated', 'true');
  };

  const handleRegisterUser = (newUser: User) => {
    setState(prev => {
      const currentUsers = prev.users || [];
      const updatedUsers = [...currentUsers, newUser];
      return {
        ...prev,
        users: updatedUsers
      };
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('transitops_authenticated', 'false');
  };

  // Personas switcher handler
  const handleSwitchUser = (user: User) => {
    setState(prev => ({
      ...prev,
      currentUser: user
    }));
    setIsUserSwitcherOpen(false);
  };

  const handleResetData = () => {
    setResetConfirmOpen(true);
  };

  const handleResetConfirmed = () => {
    setResetConfirmOpen(false);
    localStorage.clear();
    window.location.reload();
  };

  // State Mutation Handlers
  const handleAddVehicle = (newVehicle: Vehicle) => {
    setState(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, newVehicle]
    }));
  };

  const handleUpdateVehicle = (regNum: string, updates: Partial<Vehicle>) => {
    setState(prev => ({
      ...prev,
      vehicles: prev.vehicles.map(v => v.registrationNumber === regNum ? { ...v, ...updates } : v)
    }));
  };

  const handleDeleteVehicle = (regNum: string) => {
    setState(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter(v => v.registrationNumber !== regNum)
    }));
  };

  const handleAddDriver = (newDriver: Driver) => {
    setState(prev => ({
      ...prev,
      drivers: [...prev.drivers, newDriver]
    }));
  };

  const handleUpdateDriver = (licenseNum: string, updates: Partial<Driver>) => {
    setState(prev => ({
      ...prev,
      drivers: prev.drivers.map(d => d.licenseNumber === licenseNum ? { ...d, ...updates } : d)
    }));
  };

  const handleDeleteDriver = (licenseNum: string) => {
    setState(prev => ({
      ...prev,
      drivers: prev.drivers.filter(d => d.licenseNumber !== licenseNum)
    }));
  };

  const handleAddTrip = (newTrip: Trip) => {
    setState(prev => ({
      ...prev,
      trips: [...prev.trips, newTrip]
    }));
  };

  const handleDispatchTrip = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    // Transition state
    setState(prev => {
      const updatedTrips = prev.trips.map(t => t.id === tripId ? { ...t, status: 'Dispatched' as const, eta: 'In Transit' } : t);
      const updatedVehicles = prev.vehicles.map(v => v.registrationNumber === trip.vehicleId ? { ...v, status: 'On Trip' as const } : v);
      const updatedDrivers = prev.drivers.map(d => d.licenseNumber === trip.driverId ? { ...d, status: 'On Trip' as const } : d);
      return {
        ...prev,
        trips: updatedTrips,
        vehicles: updatedVehicles,
        drivers: updatedDrivers
      };
    });
  };

  const handleCompleteTrip = (tripId: string, fuelConsumed: number, finalOdometerValue: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const fuelPricePerLiter = settings.fuelPricePerLiter; // Dynamic reference price
    const calculatedFuelCost = fuelConsumed * fuelPricePerLiter;

    // Create a Fuel Log for this completed trip
    const fuelLogId = `FL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFuelLog: FuelLog = {
      id: fuelLogId,
      vehicleId: trip.vehicleId,
      liters: fuelConsumed,
      cost: calculatedFuelCost,
      date: new Date().toISOString().split('T')[0],
      status: 'Approved'
    };

    // Create a corresponding generic maintenance / operational cost
    const expenseId = `EX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newExpense: Expense = {
      id: expenseId,
      vehicleId: trip.vehicleId,
      type: 'Other',
      amount: calculatedFuelCost,
      date: new Date().toISOString().split('T')[0],
      description: `Fuel consumption trip settle: ${tripId}`
    };

    setState(prev => {
      const updatedTrips = prev.trips.map(t => 
        t.id === tripId 
          ? { ...t, status: 'Completed' as const, eta: 'Delivered', fuelConsumedLiters: fuelConsumed, finalOdometer: finalOdometerValue } 
          : t
      );
      const updatedVehicles = prev.vehicles.map(v => 
        v.registrationNumber === trip.vehicleId 
          ? { ...v, status: 'Available' as const, odometer: finalOdometerValue } 
          : v
      );
      const updatedDrivers = prev.drivers.map(d => 
        d.licenseNumber === trip.driverId 
          ? { ...d, status: 'Available' as const } 
          : d
      );

      return {
        ...prev,
        trips: updatedTrips,
        vehicles: updatedVehicles,
        drivers: updatedDrivers,
        fuel: [...prev.fuel, newFuelLog],
        expenses: [...prev.expenses, newExpense]
      };
    });
  };

  const handleCancelTrip = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    setState(prev => {
      const updatedTrips = prev.trips.map(t => t.id === tripId ? { ...t, status: 'Cancelled' as const, eta: 'Aborted' } : t);
      const updatedVehicles = prev.vehicles.map(v => v.registrationNumber === trip.vehicleId ? { ...v, status: 'Available' as const } : v);
      const updatedDrivers = prev.drivers.map(d => d.licenseNumber === trip.driverId ? { ...d, status: 'Available' as const } : d);
      return {
        ...prev,
        trips: updatedTrips,
        vehicles: updatedVehicles,
        drivers: updatedDrivers
      };
    });
  };

  const handleAddMaintenance = (newLog: MaintenanceLog) => {
    setState(prev => ({
      ...prev,
      maintenance: [...prev.maintenance, newLog]
    }));
  };

  const handleCompleteMaintenance = (maintId: string, actualCost: number) => {
    const log = maintenance.find(m => m.id === maintId);
    if (!log) return;

    // Create a maintenance expense item in ledger
    const newExpense: Expense = {
      id: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: log.vehicleId,
      type: 'Maintenance',
      amount: actualCost,
      date: new Date().toISOString().split('T')[0],
      description: `Settled work order ${maintId}: ${log.serviceType}`
    };

    setState(prev => {
      const updatedMaint = prev.maintenance.map(m => m.id === maintId ? { ...m, status: 'Completed' as const, costEstimate: actualCost } : m);
      const updatedVehicles = prev.vehicles.map(v =>
        v.registrationNumber === log.vehicleId && v.status !== 'Retired'
          ? { ...v, status: 'Available' as const }
          : v
      );
      return {
        ...prev,
        maintenance: updatedMaint,
        vehicles: updatedVehicles,
        expenses: [...prev.expenses, newExpense]
      };
    });
  };

  const handleAddFuelLog = (newLog: FuelLog) => {
    // Also create a matching ledger expense
    const newExpense: Expense = {
      id: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: newLog.vehicleId,
      type: 'Other',
      amount: newLog.cost,
      date: newLog.date,
      description: `Manual Fuel Fill: ${newLog.liters} Liters (${newLog.id})`
    };

    setState(prev => ({
      ...prev,
      fuel: [...prev.fuel, newLog],
      expenses: [...prev.expenses, newExpense]
    }));
  };

  const handleAddExpense = (newExpense: Expense) => {
    setState(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense]
    }));
  };

  const handleApproveFuelLog = (logId: string) => {
    setState(prev => ({
      ...prev,
      fuel: prev.fuel.map(f => f.id === logId ? { ...f, status: 'Approved' as const } : f)
    }));
  };

  const handleUpdateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Navigation Items list
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'fleet', label: 'Fleet', icon: Truck },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'trips', label: 'Trips', icon: Navigation },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'finance', label: 'Fuel & Expenses', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!isAuthenticated) {
    return (
      <LandingView 
        vehicles={vehicles}
        drivers={drivers}
        trips={trips}
        maintenance={maintenance}
        fuel={fuel}
        expenses={expenses}
        users={users} 
        onLogin={handleLogin} 
        onRegister={handleRegisterUser} 
      />
    );
  }

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-brand-background flex flex-col md:flex-row text-brand-secondary font-sans relative overflow-x-hidden" id="transitops-app">
      <ToastContainer />
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        title="Reset Operational Database"
        message="This will reset all data to pristine simulation defaults. All custom vehicles, drivers, trips, and logs will be permanently overwritten. This cannot be undone."
        confirmLabel="RESET DATABASE"
        variant="danger"
        onConfirm={handleResetConfirmed}
        onCancel={() => setResetConfirmOpen(false)}
      />
      
      {/* Mobile Top Header */}
      <header className="md:hidden bg-brand-surface border-b border-brand-outline p-4 flex justify-between items-center z-40 sticky top-0">
        <div className="flex items-center gap-2 text-brand-primary font-display font-black tracking-wider text-lg">
          <Activity className="h-5 w-5 animate-pulse" /> TRANSITOPS
        </div>
        <div className="flex items-center gap-3">
          {/* Active User Avatar */}
          <img 
            src={currentUser.avatarUrl} 
            alt={currentUser.name} 
            className="w-7 h-7 rounded-full border border-brand-primary"
          />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 text-white hover:text-brand-primary transition-all"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Main Sidebar */}
      <aside className={`w-72 bg-brand-surface border-r border-brand-outline shrink-0 flex flex-col justify-between fixed md:sticky top-0 h-screen z-50 md:z-30 transition-transform duration-300 overflow-y-auto ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`} id="app-sidebar">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-brand-outline flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-brand-primary font-display font-black tracking-widest text-xl">
              <Activity className="h-6 w-6 text-brand-primary animate-pulse" /> TRANSITOPS
            </div>
            <span className="text-[9px] font-mono bg-brand-primary/10 text-brand-primary border border-brand-primary/30 px-2 py-0.5 rounded-full font-bold">
              v2.4
            </span>
          </div>

          {/* Persistent Dynamic Persona Selector (RBAC Control Panel) */}
          <div className="p-4 border-b border-brand-outline bg-brand-surface-low/50 relative">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">OPERATIONAL PERSPECTIVE</div>
            
            <button 
              onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
              className="w-full flex items-center justify-between p-3 bg-brand-surface-lowest rounded-xl border border-brand-outline hover:border-brand-primary/40 transition-all text-left"
              id="rbac-dropdown-trigger"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full border border-brand-primary object-cover shrink-0" 
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] font-mono text-brand-primary flex items-center gap-1 mt-0.5 uppercase">
                    <UserCheck className="h-3 w-3 shrink-0" /> {currentUser.role}
                  </div>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-brand-secondary transition-transform ${isUserSwitcherOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Persona Selection Dropdown List */}
            {isUserSwitcherOpen && (
              <div 
                className="absolute left-4 right-4 mt-2 bg-brand-surface-high border border-brand-primary/35 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 divide-y divide-brand-outline/20"
                id="rbac-dropdown-menu"
              >
                {SYSTEM_USERS.map((usr) => (
                  <button
                    key={usr.email}
                    onClick={() => handleSwitchUser(usr)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all ${
                      currentUser.role === usr.role 
                        ? 'bg-brand-primary/10 border border-brand-primary/30' 
                        : 'hover:bg-brand-surface'
                    }`}
                  >
                    <img 
                      src={usr.avatarUrl} 
                      alt={usr.name} 
                      className="w-7 h-7 rounded-full border border-brand-outline shrink-0 object-cover" 
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">{usr.name}</div>
                      <div className="text-[9px] font-mono text-brand-secondary uppercase">{usr.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1" id="app-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isAllowed = ROLE_PERMISSIONS[currentUser?.role]?.includes(item.id) ?? true;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  disabled={!isAllowed}
                  onClick={() => {
                    if (isAllowed) {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                    !isAllowed
                      ? 'opacity-40 cursor-not-allowed border-transparent text-gray-600'
                      : isActive 
                        ? 'bg-brand-primary text-black border-brand-primary shadow-lg shadow-brand-primary/10 font-bold cursor-pointer' 
                        : 'text-brand-secondary border-transparent hover:bg-brand-surface-high hover:text-white cursor-pointer'
                  }`}
                  id={`nav-link-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-black font-bold' : 'text-brand-secondary'}`} />
                    <span>{item.label}</span>
                  </div>
                  {!isAllowed && (
                    <Lock className="h-3 w-3 text-gray-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-brand-outline bg-brand-surface-low/30 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest justify-between">
            <span>Simulation Server</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
            </span>
          </div>
          
          <button 
            onClick={handleResetData}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-brand-outline hover:border-brand-primary hover:text-white text-[11px] font-mono font-semibold rounded-lg bg-brand-surface-lowest hover:bg-brand-surface-high transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> REBOOT DATA MODEL
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white text-[11px] font-mono font-semibold rounded-lg bg-red-500/5 hover:bg-red-500/15 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" /> LOG OUT OPERATOR
          </button>
        </div>
      </aside>

      {/* Overlay background for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-brand-background/80 backdrop-blur-sm md:hidden z-40"
        />
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full" id="workspace-frame">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="h-full"
        >
          {activeTab === 'dashboard' && (
            <DashboardView 
              vehicles={vehicles}
              drivers={drivers}
              trips={trips}
              maintenance={maintenance}
              fuel={fuel}
              expenses={expenses}
              currentRole={currentUser.role}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'fleet' && (
            <FleetView 
              vehicles={vehicles}
              maintenance={maintenance}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onAddMaintenance={handleAddMaintenance}
              onCompleteMaintenance={handleCompleteMaintenance}
              currencySymbol={settings.currencySymbol}
            />
          )}

          {activeTab === 'drivers' && (
            <DriversView 
              drivers={drivers}
              onAddDriver={handleAddDriver}
              onUpdateDriver={handleUpdateDriver}
              onDeleteDriver={handleDeleteDriver}
            />
          )}

          {activeTab === 'trips' && (
            <TripsView 
              trips={trips}
              vehicles={vehicles}
              drivers={drivers}
              onAddTrip={handleAddTrip}
              onDispatchTrip={handleDispatchTrip}
              onCompleteTrip={handleCompleteTrip}
              onCancelTrip={handleCancelTrip}
              currentRole={currentUser.role}
              currencySymbol={settings.currencySymbol}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceView 
              fuel={fuel}
              expenses={expenses}
              vehicles={vehicles}
              onAddFuelLog={handleAddFuelLog}
              onAddExpense={handleAddExpense}
              onApproveFuelLog={handleApproveFuelLog}
              currencySymbol={settings.currencySymbol}
              suspiciousThreshold={settings.suspiciousFuelPriceThreshold}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView 
              maintenance={maintenance}
              vehicles={vehicles}
              onAddMaintenance={handleAddMaintenance}
              onCompleteMaintenance={handleCompleteMaintenance}
              onUpdateVehicle={handleUpdateVehicle}
              currencySymbol={settings.currencySymbol}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView 
              vehicles={vehicles}
              drivers={drivers}
              trips={trips}
              maintenance={maintenance}
              fuel={fuel}
              expenses={expenses}
              currencySymbol={settings.currencySymbol}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetData={handleResetData}
              currentUser={currentUser}
              vehiclesCount={vehicles.length}
              driversCount={drivers.length}
              tripsCount={trips.length}
            />
          )}
        </motion.div>
      </main>
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
