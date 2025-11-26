import React from 'react';
import { X, Bell, CheckCircle, Info, Truck, Package } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert';
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  let Icon = Info;
  let colorClass = 'text-blue-400';
  
  if (toast.type === 'success') {
    Icon = CheckCircle;
    colorClass = 'text-emerald-500';
  } else if (toast.type === 'alert') {
    Icon = Bell;
    colorClass = 'text-indigo-500';
  }

  // Custom icons for specific contexts based on title/message content could be added,
  // but using type-based icons is cleaner for now.

  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-slideIn mb-3">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${colorClass}`} aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-slate-900">{toast.title}</p>
            <p className="mt-1 text-sm text-slate-500">{toast.message}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none"
              onClick={() => onClose(toast.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
    toasts: ToastMessage[];
    removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div aria-live="assertive" className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-[100]">
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end mt-16">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onClose={removeToast} />
                ))}
            </div>
        </div>
    )
}