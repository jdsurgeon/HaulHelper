
import React, { useState } from 'react';
import { Job, VehicleType } from '../types';
import { MapPin, DollarSign, Clock, Truck, ChevronRight, CheckCircle, Package, ShieldCheck, Hourglass, SlidersHorizontal, ArrowUpDown, AlertCircle } from 'lucide-react';

interface JobBoardProps {
  jobs: Job[];
  onAcceptJob: (id: string) => void;
  onDriverConfirm: (id: string) => void;
}

type SortOption = 'newest' | 'price_high' | 'distance';

const JobBoard: React.FC<JobBoardProps> = ({ jobs, onAcceptJob, onDriverConfirm }) => {
  const [confirmingJobId, setConfirmingJobId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterVehicle, setFilterVehicle] = useState<VehicleType | 'all'>('all');
  
  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const activeJobs = jobs.filter(j => j.status === 'accepted');

  const handleConfirmCompletion = () => {
    if (confirmingJobId) {
        onDriverConfirm(confirmingJobId);
        setConfirmingJobId(null);
    }
  };

  // Estimate travel time based on 25mph city driving + traffic
  const getEstMinutes = (miles: number) => Math.max(10, Math.round((miles / 25) * 60));

  // Apply filters and sorting
  const filteredJobs = pendingJobs
    .filter(job => filterVehicle === 'all' || job.vehicleType === filterVehicle)
    .sort((a, b) => {
        switch (sortBy) {
            case 'price_high':
                return b.price - a.price;
            case 'distance':
                return a.distanceMiles - b.distanceMiles;
            case 'newest':
            default:
                return b.createdAt - a.createdAt;
        }
    });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 relative">
      
      {/* Confirmation Modal */}
      {confirmingJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4 mx-auto">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Confirm Delivery</h3>
                    <p className="text-sm text-slate-500 mt-2">
                        Have you dropped off the item at the destination? This will signal the customer to release funds from escrow.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setConfirmingJobId(null)}
                        className="w-full py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmCompletion}
                        className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Active Jobs Section */}
      {activeJobs.length > 0 && (
        <div className="mb-12 animate-fadeIn">
            <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-2.5 rounded-full mr-3">
                    <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">My Active Deliveries</h2>
                    <p className="text-slate-500 text-sm">Jobs you have accepted. Funds are held in escrow.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeJobs.map(job => (
                    <div key={job.id} className="bg-white rounded-xl shadow-lg shadow-blue-50 border-2 border-blue-100 overflow-hidden relative group flex flex-col h-full">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                            IN PROGRESS
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg text-slate-900 mb-1 pr-16 truncate">{job.title}</h3>
                                <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit mb-3">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    ${job.price} Secured in Escrow
                                </div>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-1">{job.description}</p>
                                
                                <div className="flex flex-col gap-2 mb-4">
                                    {job.fragility && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 flex items-start">
                                            <Package className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-blue-800">Fragility: {job.fragility}</p>
                                        </div>
                                    )}
                                    {job.handlingInstructions && (
                                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-2.5 flex items-start">
                                            <AlertCircle className="h-4 w-4 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-orange-800">{job.handlingInstructions}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 mb-6 bg-slate-50 p-4 rounded-lg flex-1">
                                    <div className="flex relative pl-4 border-l-2 border-slate-300">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Pickup</p>
                                            <p className="text-sm font-medium text-slate-900 truncate">{job.pickupLocation}</p>
                                        </div>
                                    </div>
                                    <div className="flex relative pl-4 border-l-2 border-emerald-500">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Dropoff</p>
                                            <p className="text-sm font-medium text-slate-900 truncate">{job.dropoffLocation}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-xs text-slate-500 pt-2 border-t border-slate-200">
                                        <Clock className="h-3 w-3 mr-1.5" />
                                        Est. Travel: {getEstMinutes(job.distanceMiles)} mins ({job.distanceMiles} mi)
                                    </div>
                                </div>
                                
                                {job.driverConfirmed ? (
                                    <div className="w-full bg-yellow-50 text-yellow-800 border border-yellow-200 py-3 rounded-lg flex items-center justify-center px-4">
                                        <Hourglass className="h-5 w-5 mr-2 flex-shrink-0 animate-pulse" />
                                        <span className="text-sm font-medium">Waiting for customer confirmation</span>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setConfirmingJobId(job.id)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center shadow-md shadow-emerald-100"
                                    >
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        Mark as Completed
                                    </button>
                                )}
                            </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-end mb-6 border-t border-slate-200 pt-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-900">Available Hauls</h2>
            <p className="text-slate-500 mt-2">Earn money with your truck today.</p>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ArrowUpDown className="h-4 w-4 text-slate-400" />
                </div>
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none w-full appearance-none cursor-pointer"
                >
                    <option value="newest">Newest First</option>
                    <option value="price_high">Highest Price</option>
                    <option value="distance">Shortest Distance</option>
                </select>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                </div>
                <select 
                    value={filterVehicle} 
                    onChange={(e) => setFilterVehicle(e.target.value as VehicleType | 'all')}
                    className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none w-full appearance-none cursor-pointer"
                >
                    <option value="all">All Vehicles</option>
                    {Object.values(VehicleType).map(v => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
            <Truck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900">No jobs match your filters</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search criteria.</p>
            <button 
                onClick={() => {setFilterVehicle('all'); setSortBy('newest');}}
                className="mt-4 text-emerald-600 font-medium hover:text-emerald-700"
            >
                Clear Filters
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden animate-fadeIn">
                <div className="h-48 bg-slate-100 relative overflow-hidden group">
                    {job.imageUrl ? (
                        <img src={job.imageUrl} alt={job.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <Truck className="h-12 w-12 opacity-50" />
                        </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-emerald-700 shadow-sm flex items-center">
                        <DollarSign className="h-3 w-3 mr-0.5" />{job.price}
                    </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{job.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {job.fragility && (
                                <div className="flex items-center text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                                    <Package className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                    <span>Fragility: {job.fragility}</span>
                                </div>
                            )}
                            {job.handlingInstructions && (
                                <div className="flex items-start text-xs text-orange-700 bg-orange-50 p-2 rounded border border-orange-100">
                                    <AlertCircle className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{job.handlingInstructions}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-start text-sm">
                                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-slate-700">{job.pickupLocation}</span>
                            </div>
                            <div className="flex items-start text-sm">
                                <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-slate-700">{job.dropoffLocation}</span>
                            </div>
                            <div className="flex items-center text-xs text-slate-500 pt-2 border-t border-slate-100 mt-3">
                                <Truck className="h-3 w-3 mr-1" /> {job.vehicleType.split('(')[0]}
                                <span className="mx-2">•</span>
                                <Clock className="h-3 w-3 mr-1" /> {getEstMinutes(job.distanceMiles)} min
                                <span className="mx-2">•</span>
                                {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => onAcceptJob(job.id)}
                        className="mt-5 w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors flex items-center justify-center group"
                    >
                        Accept Job <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobBoard;
