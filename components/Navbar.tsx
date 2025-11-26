import React from 'react';
import { Truck, Package, User } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setView('landing')}>
            <Truck className="h-8 w-8 text-emerald-600" />
            <span className="ml-2 text-xl font-bold text-slate-900">HaulHelper</span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setView('request')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'request' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Find a Truck</span>
                <span className="sm:hidden">Find</span>
              </div>
            </button>
            
            <button
              onClick={() => setView('driver')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'driver' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
               <div className="flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Drive</span>
                <span className="sm:hidden">Drive</span>
              </div>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <button
              onClick={() => setView('profile')}
              className={`p-2 rounded-full transition-colors ${
                currentView === 'profile'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
              title="User Profile"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;