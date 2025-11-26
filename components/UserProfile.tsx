
import React, { useState } from 'react';
import { Job, User } from '../types';
import { User as UserIcon, Star, Package, Truck, Clock, MapPin, CheckCircle, Calendar, ShieldCheck, AlertCircle, ArrowUpDown, Power } from 'lucide-react';

interface UserProfileProps {
  jobs: Job[];
  onRequesterConfirm: (id: string) => void;
  onRateUser: (jobId: string, role: 'driver' | 'requester', rating: number) => void;
  user: User | null;
  onToggleAvailability: (isAvailable: boolean) => void;
}

type SortOption = 'date_desc' | 'date_asc' | 'price_high' | 'price_low';

const UserProfile: React.FC<UserProfileProps> = ({ jobs, onRequesterConfirm, onRateUser, user, onToggleAvailability }) => {
  const [activeTab, setActiveTab] = useState<'requester' | 'driver'>('requester');
  const [requesterSort, setRequesterSort] = useState<SortOption>('date_desc');

  // In a real app with auth, we would filter by creatorId for requests
  const myRequests = [...jobs]; // Create a copy for sorting
  
  // For Driver history, we strictly look for accepted/completed status
  const myDrives = jobs.filter(j => j.status === 'accepted' || j.status === 'completed');
  const completedDrives = jobs.filter(j => j.status === 'completed');
  
  // Mock rating
  const driverRating = 4.9;

  // Helper to get estimated time
  const getEstMinutes = (miles: number) => Math.max(10, Math.round((miles / 25) * 60));

  // Sort logic for requests
  const sortedRequests = myRequests.sort((a, b) => {
    const costA = a.price + (a.platformFee || 0);
    const costB = b.price + (b.platformFee || 0);

    switch (requesterSort) {
        case 'date_asc':
            return a.createdAt - b.createdAt;
        case 'price_high':
            return costB - costA;
        case 'price_low':
            return costA - costB;
        case 'date_desc':
        default:
            return b.createdAt - a.createdAt;
    }
  });

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

  const RateUser = ({ job, role }: { job: Job, role: 'driver' | 'requester' }) => {
    const isDriverView = role === 'driver';
    // If I'm the driver, I check if I have rated the requester
    // If I'm the requester, I check if I have rated the driver
    const currentRating = isDriverView ? job.ratingForRequester : job.ratingForDriver;
    const targetLabel = isDriverView ? "Requester" : "Driver";

    const [hoverRating, setHoverRating] = useState(0);

    if (currentRating) {
        return (
            <div className="mt-3 flex items-center bg-yellow-50/50 p-2 rounded-lg w-fit border border-yellow-100/50">
                <span className="text-xs font-medium text-slate-500 mr-2">You rated {targetLabel}:</span>
                <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= currentRating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} 
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-3 border-t border-slate-100 pt-3">
             <div className="flex items-center space-x-2">
                 <span className="text-sm font-bold text-slate-700">Rate {targetLabel}:</span>
                 <div className="flex" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className="p-1 focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverRating(star)}
                            onClick={() => onRateUser(job.id, role, star)}
                        >
                            <Star 
                                className={`h-5 w-5 transition-colors ${
                                    star <= (hoverRating || 0) 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-slate-300'
                                }`} 
                            />
                        </button>
                    ))}
                 </div>
             </div>
        </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 sm:p-8 flex items-center space-x-6">
           <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 shrink-0">
              <span className="text-2xl font-bold text-slate-400">{user?.name?.charAt(0) || <UserIcon className="h-10 w-10" />}</span>
           </div>
           <div>
              <h1 className="text-2xl font-bold text-slate-900">{user?.name || "Guest User"}</h1>
              <p className="text-slate-500 flex items-center mt-1">
                <Calendar className="h-3 w-3 mr-1" /> Member since Sept 2023
              </p>
              {user?.email && <p className="text-sm text-slate-400 mt-1">{user.email}</p>}
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
            {/* Requester Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div className="text-slate-500 text-sm font-medium mb-1">Total Requests</div>
                   <div className="flex items-center text-3xl font-bold text-slate-900">
                      {myRequests.length}
                   </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div className="text-slate-500 text-sm font-medium mb-1">Active Jobs</div>
                   <div className="flex items-center text-3xl font-bold text-emerald-600">
                      {myRequests.filter(j => j.status !== 'completed').length}
                   </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div className="text-slate-500 text-sm font-medium mb-1">Total Spent</div>
                   <div className="flex items-center text-3xl font-bold text-slate-900">
                      ${myRequests.filter(j => j.status === 'completed').reduce((sum, job) => sum + job.price + (job.platformFee || 0), 0)}
                   </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-2">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                    Past Requests
                </h2>
                
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                    <select 
                        value={requesterSort}
                        onChange={(e) => setRequesterSort(e.target.value as SortOption)}
                        className="pl-8 pr-8 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none cursor-pointer text-slate-700"
                    >
                        <option value="date_desc">Newest First</option>
                        <option value="date_asc">Oldest First</option>
                        <option value="price_high">Highest Cost</option>
                        <option value="price_low">Lowest Cost</option>
                    </select>
                </div>
            </div>
            
            {sortedRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
                    <p className="text-slate-500">No requests made yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <ul className="divide-y divide-slate-200">
                        {sortedRequests.map((job) => (
                            <li key={job.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                                            <StatusBadge job={job} />
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-1 mb-2">{job.description}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {job.fragility && (
                                                <div className="flex items-center text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                                    <Package className="h-3 w-3 mr-1" />
                                                    Fragility: {job.fragility}
                                                </div>
                                            )}
                                            {job.handlingInstructions && (
                                                <div className="flex items-center text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Handling: {job.handlingInstructions}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center text-xs text-slate-500 space-x-3 sm:space-x-4 flex-wrap">
                                            <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center"><Truck className="h-3 w-3 mr-1" /> {job.vehicleType.split('(')[0]}</span>
                                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> Est. {getEstMinutes(job.distanceMiles)} min ({job.distanceMiles} mi)</span>
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
                                        
                                        {/* Rate Driver Section */}
                                        {job.status === 'completed' && (
                                            <RateUser job={job} role="requester" />
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
            {/* Availability Toggle */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${user?.isAvailable ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${user?.isAvailable ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                        <Power className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className={`font-bold ${user?.isAvailable ? 'text-emerald-900' : 'text-slate-900'}`}>Driver Status</h3>
                        <p className={`text-sm ${user?.isAvailable ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {user?.isAvailable ? "You are Online and visible to requests." : "You are Offline. You won't receive alerts."}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onToggleAvailability(!user?.isAvailable)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        user?.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                >
                    <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            user?.isAvailable ? 'translate-x-7' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>

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
                                        
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {job.fragility && (
                                                <div className="flex items-center text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                                    <Package className="h-3 w-3 mr-1" />
                                                    Fragility: {job.fragility}
                                                </div>
                                            )}
                                            {job.handlingInstructions && (
                                                <div className="flex items-center text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Handling: {job.handlingInstructions}
                                                </div>
                                            )}
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
                                                <Clock className="h-3 w-3 mr-1" /> Est. {getEstMinutes(job.distanceMiles)} min ({job.distanceMiles} mi)
                                            </div>
                                        </div>

                                        {/* Rate Requester Section */}
                                        {job.status === 'completed' && (
                                            <RateUser job={job} role="driver" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6 self-start">
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