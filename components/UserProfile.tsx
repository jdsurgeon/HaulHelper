import React, { useState } from 'react';
import { Job } from '../types';
import { User, Star, Package, Truck, Clock, MapPin, CheckCircle, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';

interface UserProfileProps {
  jobs: Job[];
  onRequesterConfirm: (id: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ jobs, onRequesterConfirm }) => {
  const [activeTab, setActiveTab] = useState<'requester' | 'driver'>('requester');

  // In a real app with auth, we would filter by creatorId for requests
  const myRequests = jobs; 
  
  // For Driver history, we strictly look for accepted/completed status
  const myDrives = jobs.filter(j => j.status === 'accepted' || j.status === 'completed');
  const completedDrives = jobs.filter(j => j.status === 'completed');
  
  // Mock rating
  const driverRating = 4.9;

  // Helper to get estimated time
  const getEstMinutes = (miles: number) => Math.max(10, Math.round((miles / 25) * 60));

  const StatusBadge = ({ job }: { job: Job }) => {
    switch (job.status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Completed</span>;
      case 'accepted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In Progress</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Pending</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 sm:p-8 flex items-center space-x-6">
           <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
              <User className="h-10 w-10 text-slate-400" />
           </div>
           <div>
              <h1 className="text-2xl font-bold text-slate-900">Alex Hauler</h1>
              <p className="text-slate-500 flex items-center mt-1">
                <Calendar className="h-3 w-3 mr-1" /> Member since Sept 2023
              </p>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-slate-200">
           <button
             onClick={() => setActiveTab('requester')}
             className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors flex items-center justify-center ${
                activeTab === 'requester' 
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/30' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
             }`}
           >
             <Package className="h-4 w-4 mr-2" />
             Requester Profile
           </button>
           <button
             onClick={() => setActiveTab('driver')}
             className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors flex items-center justify-center ${
                activeTab === 'driver' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
             }`}
           >
             <Truck className="h-4 w-4 mr-2" />
             Driver Profile
           </button>
        </div>
      </div>

      {/* Requester Tab Content */}
      {activeTab === 'requester' && (
         <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                Past Requests
            </h2>
            
            {myRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
                    <p className="text-slate-500">No requests made yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <ul className="divide-y divide-slate-200">
                        {myRequests.map((job) => (
                            <li key={job.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                                            <StatusBadge job={job} />
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-1 mb-2">{job.description}</p>
                                        <div className="flex items-center text-xs text-slate-500 space-x-3 sm:space-x-4 flex-wrap">
                                            <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center"><Truck className="h-3 w-3 mr-1" /> {job.vehicleType.split('(')[0]}</span>
                                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {getEstMinutes(job.distanceMiles)} min drive</span>
                                            <span className="font-semibold text-slate-700">Total: ${job.price + (job.platformFee || 0)}</span>
                                        </div>

                                        {/* Escrow Confirmation Action */}
                                        {job.status === 'accepted' && (
                                            <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                                                <div className="flex items-start">
                                                    <ShieldCheck className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-emerald-900">Secure Payment Held</h4>
                                                        <p className="text-xs text-emerald-700 mt-1">
                                                            Funds are held in escrow. Only confirm delivery once you have received the item.
                                                        </p>
                                                        
                                                        {job.requesterConfirmed ? (
                                                            <div className="mt-2 text-sm font-medium text-emerald-700 flex items-center">
                                                                <CheckCircle className="h-4 w-4 mr-1" /> You confirmed receipt. Waiting for driver.
                                                            </div>
                                                        ) : (
                                                            <div className="mt-3">
                                                                {job.driverConfirmed && (
                                                                     <p className="text-xs text-orange-600 font-bold mb-2 flex items-center">
                                                                        <AlertCircle className="h-3 w-3 mr-1" /> Driver has marked this as complete.
                                                                     </p>
                                                                )}
                                                                <button 
                                                                    onClick={() => onRequesterConfirm(job.id)}
                                                                    className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                                                                >
                                                                    Confirm Receipt & Release Funds
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {job.imageUrl && (
                                        <div className="flex-shrink-0">
                                            <img src={job.imageUrl} alt="Item" className="h-20 w-20 object-cover rounded-md border border-slate-200 bg-slate-50" />
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
         </div>
      )}

      {/* Driver Tab Content */}
      {activeTab === 'driver' && (
         <div className="space-y-6 animate-fadeIn">
             {/* Stats Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div className="text-slate-500 text-sm font-medium mb-1">Rating</div>
                   <div className="flex items-center">
                      <span className="text-3xl font-bold text-slate-900 mr-2">{driverRating}</span>
                      <div className="flex text-yellow-400">
                         <Star className="h-5 w-5 fill-current" />
                         <Star className="h-5 w-5 fill-current" />
                         <Star className="h-5 w-5 fill-current" />
                         <Star className="h-5 w-5 fill-current" />
                         <Star className="h-5 w-5 fill-current opacity-50" />
                      </div>
                   </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div className="text-slate-500 text-sm font-medium mb-1">Deliveries Completed</div>
                   <div className="flex items-center text-3xl font-bold text-slate-900">
                      {completedDrives.length}
                   </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div className="text-slate-500 text-sm font-medium mb-1">Total Earned</div>
                   <div className="flex items-center text-3xl font-bold text-emerald-600">
                      ${completedDrives.reduce((sum, job) => sum + job.price, 0)}
                   </div>
                </div>
             </div>

            <h2 className="text-xl font-bold text-slate-900 flex items-center mt-8">
                <Truck className="h-5 w-5 mr-2 text-blue-600" />
                Delivery History
            </h2>
            
            {myDrives.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
                    <p className="text-slate-500">You haven't accepted any jobs yet.</p>
                    <button className="mt-4 text-emerald-600 font-medium hover:underline">Find jobs nearby</button>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <ul className="divide-y divide-slate-200">
                        {myDrives.map((job) => (
                            <li key={job.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors group">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between sm:justify-start mb-1 gap-2">
                                            <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                                            <StatusBadge job={job} />
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center text-xs text-slate-500 gap-1 sm:gap-4 mt-2">
                                            <div className="flex items-center">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                From: <span className="font-medium text-slate-700 ml-1">{job.pickupLocation}</span>
                                            </div>
                                            <div className="hidden sm:block text-slate-300">|</div>
                                            <div className="flex items-center">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                To: <span className="font-medium text-slate-700 ml-1">{job.dropoffLocation}</span>
                                            </div>
                                             <div className="hidden sm:block text-slate-300">|</div>
                                             <div className="flex items-center text-slate-400">
                                                <Clock className="h-3 w-3 mr-1" /> {getEstMinutes(job.distanceMiles)} min drive
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6">
                                        <div className="text-right">
                                            <span className="block text-lg font-bold text-slate-900">${job.price}</span>
                                        </div>
                                        {job.status === 'completed' && (
                                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            </div>
                                        )}
                                        {job.status === 'accepted' && (
                                            <div className="flex items-center text-emerald-600 text-sm font-medium">
                                                <ShieldCheck className="h-4 w-4 mr-1" />
                                                Escrow
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
         </div>
      )}
    </div>
  );
};

export default UserProfile;