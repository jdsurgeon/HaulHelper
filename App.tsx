
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RequestFlow from './components/RequestFlow';
import JobBoard from './components/JobBoard';
import UserProfile from './components/UserProfile';
import Auth from './components/Auth';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ViewState, Job, VehicleType, User } from './types';
import { ArrowRight, Package, ShieldCheck, Truck } from 'lucide-react';

// Mock Initial Data
const INITIAL_JOBS: Job[] = [
  {
    id: '1',
    title: 'Antique Oak Dresser',
    description: 'Heavy solid wood dresser. Needs two people or a dolly. I can help load.',
    pickupLocation: '123 Maple St, Downtown',
    dropoffLocation: '456 Oak Ln, Suburbs',
    status: 'pending',
    price: 65,
    platformFee: 10,
    vehicleType: VehicleType.PICKUP,
    createdAt: Date.now() - 3600000,
    distanceMiles: 12,
    imageUrl: 'https://picsum.photos/400/300?random=1',
    driverConfirmed: false,
    requesterConfirmed: false
  },
  {
    id: '2',
    title: 'Free Sofa Bed',
    description: 'Good condition, just need it gone by Saturday. It is on the 2nd floor.',
    pickupLocation: '789 Pine Ave, Westside',
    dropoffLocation: '321 Elm St, Northside',
    status: 'pending',
    price: 80,
    platformFee: 12,
    vehicleType: VehicleType.BOX_TRUCK,
    createdAt: Date.now() - 7200000,
    distanceMiles: 8,
    imageUrl: 'https://picsum.photos/400/300?random=2',
    driverConfirmed: false,
    requesterConfirmed: false
  },
  {
    id: '3',
    title: 'Garden Pavers (Leftover)',
    description: 'Stack of about 50 pavers. Easy pickup from driveway.',
    pickupLocation: '55 Garden Way',
    dropoffLocation: '888 River Rd',
    status: 'completed',
    price: 45,
    platformFee: 7,
    vehicleType: VehicleType.SUV,
    createdAt: Date.now() - 172800000, // 2 days ago
    distanceMiles: 5,
    imageUrl: 'https://picsum.photos/400/300?random=3',
    driverConfirmed: true,
    requesterConfirmed: true,
    ratingForDriver: 5
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'alert') => {
    // Trigger native browser notification if allowed
    if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
    }

    // Add in-app toast
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    // Auto dismiss
    setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleJobCreated = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
    setCurrentView('driver'); // Switch to driver view to see it listed (demo flow)
    
    // Simulate push notification to Drivers
    setTimeout(() => {
        addToast("New Haul Alert 🚚", `A new ${newJob.vehicleType} job was just posted nearby: ${newJob.title}`, 'alert');
    }, 1500);
  };

  const handleAcceptJob = (id: string) => {
    const job = jobs.find(j => j.id === id);
    setJobs(jobs.map(j => j.id === id ? { ...j, status: 'accepted' } : j));

    // Simulate push notification to Requester
    if (job) {
        setTimeout(() => {
            addToast("Driver Found! 🎉", `A driver has accepted your request for: ${job.title}. They are on their way.`, 'success');
        }, 1000);
    }
  };

  const handleDriverConfirm = (id: string) => {
    let jobCompleted = false;
    let jobTitle = '';
    
    setJobs(jobs.map(j => {
      if (j.id === id) {
        jobTitle = j.title;
        const updatedJob = { ...j, driverConfirmed: true };
        // Check if both confirmed
        if (updatedJob.requesterConfirmed) {
          updatedJob.status = 'completed';
          jobCompleted = true;
        }
        return updatedJob;
      }
      return j;
    }));

    // Notify Requester
    setTimeout(() => {
        if (jobCompleted) {
            addToast("Delivery Complete ✅", `Escrow released! ${jobTitle} has been successfully delivered and confirmed by both parties.`, 'success');
        } else {
            addToast("Delivery Update 📦", `Driver has arrived for ${jobTitle}. Please confirm receipt in your profile to release funds.`, 'alert');
        }
    }, 500);
  };

  const handleRequesterConfirm = (id: string) => {
    let jobCompleted = false;
    let jobTitle = '';

    setJobs(jobs.map(j => {
       if (j.id === id) {
         jobTitle = j.title;
         const updatedJob = { ...j, requesterConfirmed: true };
         // Check if both confirmed
         if (updatedJob.driverConfirmed) {
           updatedJob.status = 'completed';
           jobCompleted = true;
         }
         return updatedJob;
       }
       return j;
    }));

    // Notify Driver
    setTimeout(() => {
        if (jobCompleted) {
            addToast("Payment Released 💰", `Customer confirmed receipt of ${jobTitle}. Funds have been transferred to your wallet.`, 'success');
        } else {
            addToast("Customer Confirmed ✅", `Customer has confirmed receipt of ${jobTitle}. Waiting for your delivery confirmation.`, 'info');
        }
    }, 500);
  };

  const handleRateUser = (jobId: string, role: 'driver' | 'requester', rating: number) => {
    setJobs(jobs.map(j => {
        if (j.id === jobId) {
            // If the user is a 'driver' (in driver view), they are rating the requester
            // If the user is a 'requester' (in requester view), they are rating the driver
            return {
                ...j,
                ratingForRequester: role === 'driver' ? rating : j.ratingForRequester,
                ratingForDriver: role === 'requester' ? rating : j.ratingForDriver
            };
        }
        return j;
    }));
    addToast("Rating Submitted ⭐", "Thanks for your feedback!", 'success');
  };

  const handleLogin = (user: User) => {
    setUser(user);
    setCurrentView('landing');
    addToast("Welcome back!", `Signed in as ${user.name}`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    addToast("Signed out", "You have been successfully logged out.", 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        currentView={currentView} 
        setView={setCurrentView} 
        user={user} 
        onLogout={handleLogout}
      />
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <main className="flex-1">
        {currentView === 'landing' && (
          <div className="relative isolate overflow-hidden">
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-emerald-200 to-blue-200 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>
            
            <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
                <div className="mt-24 sm:mt-32 lg:mt-16">
                  <a href="#" className="inline-flex space-x-6">
                    <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-sm font-semibold leading-6 text-emerald-600 ring-1 ring-inset ring-emerald-600/10">Now Live</span>
                    <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-slate-600">
                      <span>Just shipped v1.0</span>
                    </span>
                  </a>
                </div>
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                  Free furniture?<br/>
                  <span className="text-emerald-600">Don't sweat the haul.</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-slate-600">
                  Connect with local truck owners to pick up your marketplace finds. AI-powered vehicle sizing ensures you get the right truck for the job.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <button
                    onClick={() => setCurrentView('request')}
                    className="rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    Schedule a Pickup
                  </button>
                  <button onClick={() => setCurrentView('driver')} className="text-sm font-semibold leading-6 text-slate-900 flex items-center">
                    I have a truck <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
                <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                  <div className="-m-2 rounded-xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                    <img
                      src="https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=1200&auto=format&fit=crop"
                      alt="App screenshot"
                      className="w-[76rem] rounded-md shadow-2xl ring-1 ring-slate-900/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-emerald-600">Logistics Made Easy</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to move that couch</p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <Package className="h-5 w-5 flex-none text-emerald-600" />
                                AI Size Estimator
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">Upload a photo of the item. Our Gemini AI analyzes dimensions and suggests the perfect vehicle type instantly.</p>
                            </dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <ShieldCheck className="h-5 w-5 flex-none text-emerald-600" />
                                Secure Payments
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">Funds are held in escrow and only released to the driver once both parties confirm the successful delivery.</p>
                            </dd>
                        </div>
                         <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <Truck className="h-5 w-5 flex-none text-emerald-600" />
                                Same-Day Pickup
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">Free items move fast. Get matched with a driver in minutes to secure your marketplace win.</p>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
          </div>
        )}

        {currentView === 'auth' && (
            <Auth onLogin={handleLogin} />
        )}

        {currentView === 'request' && (
          <RequestFlow onJobCreated={handleJobCreated} />
        )}

        {currentView === 'driver' && (
          <JobBoard 
            jobs={jobs} 
            onAcceptJob={handleAcceptJob} 
            onDriverConfirm={handleDriverConfirm}
          />
        )}

        {currentView === 'profile' && (
          <UserProfile 
            jobs={jobs} 
            onRequesterConfirm={handleRequesterConfirm}
            onRateUser={handleRateUser}
            user={user}
          />
        )}
      </main>
    </div>
  );
};

export default App;
