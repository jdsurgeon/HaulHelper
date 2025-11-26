
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RequestFlow from './components/RequestFlow';
import JobBoard from './components/JobBoard';
import UserProfile from './components/UserProfile';
import Auth from './components/Auth';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ViewState, Job, User } from './types';
import { ArrowRight, Package, ShieldCheck, Truck, Loader2 } from 'lucide-react';
import { db } from './services/databaseService';

const App: React.FC = () => {
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize App Data
  useEffect(() => {
    const initData = async () => {
      try {
        const fetchedJobs = await db.getJobs();
        setJobs(fetchedJobs);
        
        // Check for persistent session
        const storedUser = localStorage.getItem('haulhelper_session_v1');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load data", e);
        addToast("Error", "Failed to connect to services.", 'alert');
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // Persist session only (not the whole DB)
  useEffect(() => {
    if (user) {
      localStorage.setItem('haulhelper_session_v1', JSON.stringify(user));
    } else {
      localStorage.removeItem('haulhelper_session_v1');
    }
  }, [user]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'alert') => {
    if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
    }
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- ACTION HANDLERS USING DB SERVICE ---

  const handleJobCreated = async (newJob: Job) => {
    setIsLoading(true);
    try {
      await db.createJob(newJob);
      setJobs(prev => [newJob, ...prev]);
      setCurrentView('driver');
      
      // Simulate push notification
      setTimeout(() => {
          addToast("New Haul Alert 🚚", `A new ${newJob.vehicleType} job was just posted nearby: ${newJob.title}`, 'alert');
      }, 1500);
    } catch (e) {
      addToast("Error", "Failed to create job. Please try again.", 'alert');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptJob = async (id: string) => {
    try {
      const updatedJob = await db.updateJob(id, { status: 'accepted' });
      setJobs(prevJobs => prevJobs.map(j => j.id === id ? updatedJob : j));
      
      setTimeout(() => {
          addToast("Driver Found! 🎉", `A driver has accepted your request for: ${updatedJob.title}. They are on their way.`, 'success');
      }, 1000);
    } catch (e) {
      addToast("Error", "Could not accept job.", 'alert');
    }
  };

  const handleDriverConfirm = async (id: string) => {
    try {
      const currentJob = jobs.find(j => j.id === id);
      if (!currentJob) return;

      const updates: Partial<Job> = { driverConfirmed: true };
      
      // Check if this action completes the job
      let isNowCompleted = false;
      if (currentJob.requesterConfirmed) {
        updates.status = 'completed';
        isNowCompleted = true;
      }

      const updatedJob = await db.updateJob(id, updates);
      setJobs(prev => prev.map(j => j.id === id ? updatedJob : j));

      setTimeout(() => {
          if (isNowCompleted) {
              addToast("Delivery Complete ✅", `Escrow released! ${updatedJob.title} has been successfully delivered and confirmed by both parties.`, 'success');
          } else {
              addToast("Delivery Update 📦", `Driver has arrived for ${updatedJob.title}. Please confirm receipt in your profile to release funds.`, 'alert');
          }
      }, 500);

    } catch (e) {
      addToast("Error", "Failed to update status", 'alert');
    }
  };

  const handleRequesterConfirm = async (id: string) => {
    try {
      const currentJob = jobs.find(j => j.id === id);
      if (!currentJob) return;

      const updates: Partial<Job> = { requesterConfirmed: true };
      
      let isNowCompleted = false;
      if (currentJob.driverConfirmed) {
        updates.status = 'completed';
        isNowCompleted = true;
      }

      const updatedJob = await db.updateJob(id, updates);
      setJobs(prev => prev.map(j => j.id === id ? updatedJob : j));

      setTimeout(() => {
          if (isNowCompleted) {
              addToast("Payment Released 💰", `Customer confirmed receipt of ${updatedJob.title}. Funds have been transferred to your wallet.`, 'success');
          } else {
              addToast("Customer Confirmed ✅", `Customer has confirmed receipt of ${updatedJob.title}. Waiting for your delivery confirmation.`, 'info');
          }
      }, 500);
    } catch (e) {
      addToast("Error", "Failed to confirm receipt", 'alert');
    }
  };

  const handleRateUser = async (jobId: string, role: 'driver' | 'requester', rating: number) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      const updates: Partial<Job> = role === 'driver' 
        ? { ratingForRequester: rating }
        : { ratingForDriver: rating };

      const updatedJob = await db.updateJob(jobId, updates);
      setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
      addToast("Rating Submitted ⭐", "Thanks for your feedback!", 'success');
    } catch (e) {
      addToast("Error", "Failed to submit rating", 'alert');
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser({ ...loggedInUser, isAvailable: true });
    setCurrentView('landing');
    addToast("Welcome back!", `Signed in as ${loggedInUser.name}`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    addToast("Signed out", "You have been successfully logged out.", 'info');
  };

  const handleToggleAvailability = async (isAvailable: boolean) => {
    if (user) {
        try {
          // Update in DB
          // Note: In a real app we'd update the User record in DB, 
          // here we just update state and assume session persistence handles it next load for now
          // or we could add db.updateUser()
          const updatedUser = await db.updateUser(user.id, { isAvailable });
          setUser(updatedUser);
          
          if (isAvailable) {
              addToast("You are now online 🟢", "You will be notified of new jobs nearby.", 'success');
          } else {
              addToast("You are offline 🔴", "You won't receive new job alerts.", 'info');
          }
        } catch (e) {
          // If user doesn't exist in DB (e.g. guest), just update local state
          setUser({ ...user, isAvailable });
        }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">Connecting to HaulHelper Services...</h2>
        </div>
      </div>
    );
  }

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
            onToggleAvailability={handleToggleAvailability}
          />
        )}
      </main>
    </div>
  );
};

export default App;
