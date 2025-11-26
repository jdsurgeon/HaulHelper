
import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, Smartphone, CheckCircle2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'credentials' | 'mfa' | 'success'>('credentials');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      setStep('mfa');
    }, 1500);
  };

  const handleSSO = (provider: string) => {
    setLoading(true);
    // Simulate SSO redirection delay
    setTimeout(() => {
      setLoading(false);
      setStep('mfa');
    }, 1500);
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      setTimeout(() => {
        onLogin({
          id: 'u-' + Date.now(),
          name: mode === 'signin' ? 'Alex Hauler' : (email.split('@')[0] || 'New User'),
          email: email || 'alex@example.com',
          avatar: undefined
        });
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        {step === 'credentials' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {mode === 'signin' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleSSO('google')}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button 
                onClick={() => handleSSO('microsoft')}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 23 23">
                  <path fill="#f25022" d="M1 1h10v10H1z"/>
                  <path fill="#00a4ef" d="M12 1h10v10H12z"/>
                  <path fill="#7fba00" d="M1 12h10v10H1z"/>
                  <path fill="#ffb900" d="M12 12h10v10H12z"/>
                </svg>
                Continue with Microsoft
              </button>
              
              <button 
                onClick={() => handleSSO('apple')}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm bg-black text-white text-sm font-medium hover:bg-slate-800 transition-all"
              >
                <svg className="h-5 w-5 mr-3 fill-current" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.62 3.57-1.62 1.68 0 3.1.58 4.09 1.95-3.66 1.83-3.04 6.94.57 8.35-.61 1.76-1.57 3.33-3.31 3.55zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>

              <button 
                onClick={() => handleSSO('yahoo')}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm bg-[#6001D2] text-white text-sm font-medium hover:bg-[#5000B0] transition-all"
              >
                <svg className="h-5 w-5 mr-3 fill-current" viewBox="0 0 24 24">
                  <path d="M2 5.5L8.5 15v7.5h7V15L22 5.5h-5.5l-4.5 7-4.5-7H2z"/>
                </svg>
                Continue with Yahoo
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleCredentialsSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                    <>
                        {mode === 'signin' ? 'Sign in' : 'Create account'} 
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
              </button>
            </form>
          </div>
        )}

        {step === 'mfa' && (
          <div className="animate-fadeIn text-center">
             <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-6">
                <Smartphone className="h-8 w-8 text-indigo-600" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900">Two-Factor Authentication</h2>
             <p className="mt-2 text-sm text-slate-600">
                To protect your account, please enter the 6-digit code sent to your mobile device ending in **89.
             </p>

             <form onSubmit={handleMfaSubmit} className="mt-8 space-y-6">
                <div>
                   <input
                      type="text"
                      maxLength={6}
                      className="block w-48 mx-auto text-center text-3xl tracking-widest font-mono border-2 border-slate-300 rounded-lg py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="000000"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                   />
                </div>
                
                <button
                    type="submit"
                    disabled={loading || mfaCode.length !== 6}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify Identity'}
                </button>
             </form>
             
             <button onClick={() => setStep('credentials')} className="mt-4 text-sm text-slate-500 hover:text-slate-900">
                Back to sign in
             </button>
          </div>
        )}

        {step === 'success' && (
             <div className="animate-fadeIn text-center py-10">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6">
                   <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Authentication Successful</h2>
                <p className="mt-2 text-slate-600">Redirecting you to the app...</p>
             </div>
        )}

        {/* Security Footer */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Protected by Enterprise-Grade Security</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
