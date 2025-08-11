/**
 * Toast Provider Component
 * Provides global toast notification system using React context
 * Enables showing success, error, warning, and info messages throughout the app
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { logger } from '@/lib/logger';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast interface
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  isVisible: boolean;
}

// Context interface
interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Custom hook to use toast context
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Toast Provider Props
 */
interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

/**
 * Toast Provider Component
 */
export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Generate unique ID for toasts
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Show toast function
  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = generateId();
    
    const newToast: Toast = {
      id,
      type,
      title,
      message,
      duration,
      isVisible: true,
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      
      // Limit number of toasts
      if (updated.length > maxToasts) {
        updated.splice(maxToasts);
      }
      
      return updated;
    });

    // Auto hide toast after duration
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    // Log toast for debugging
    logger.info('Toast shown', { type, title, message, id });
  }, [generateId, maxToasts]);

  // Hide toast function
  const hideToast = useCallback((id: string) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id 
          ? { ...toast, isVisible: false }
          : toast
      )
    );

    // Remove toast after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </ToastContext.Provider>
  );
}

/**
 * Toast Container Component
 * Renders all active toasts
 */
interface ToastContainerProps {
  toasts: Toast[];
  onHideToast: (id: string) => void;
}

function ToastContainer({ toasts, onHideToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onHide={() => onHideToast(toast.id)}
        />
      ))}
    </div>
  );
}

/**
 * Individual Toast Item Component
 */
interface ToastItemProps {
  toast: Toast;
  onHide: () => void;
}

function ToastItem({ toast, onHide }: ToastItemProps) {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-800';
      case 'error':
        return 'bg-danger-50 border-danger-200 text-danger-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-primary-50 border-primary-200 text-primary-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = (type: ToastType) => {
    const iconClass = 'w-5 h-5 flex-shrink-0';
    
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-success-600`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-danger-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-warning-600`} />;
      case 'info':
        return <Info className={`${iconClass} text-primary-600`} />;
      default:
        return <Info className={`${iconClass} text-gray-600`} />;
    }
  };

  return (
    <div
      className={`
        max-w-sm w-full pointer-events-auto transform transition-all duration-300 ease-in-out
        ${toast.isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
    >
      <div className={`
        rounded-lg border p-4 shadow-lg backdrop-blur-sm
        ${getToastStyles(toast.type)}
      `}>
        <div className="flex items-start">
          {/* Icon */}
          <div className="mr-3 mt-0.5">
            {getIcon(toast.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="mt-1 text-sm opacity-90">
                {toast.message}
              </p>
            )}
          </div>

          {/* Close button */}
          <div className="ml-3">
            <button
              type="button"
              onClick={onHide}
              className={`
                inline-flex rounded-md p-1.5 transition-colors duration-200
                hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${toast.type === 'success' ? 'focus:ring-success-500' : ''}
                ${toast.type === 'error' ? 'focus:ring-danger-500' : ''}
                ${toast.type === 'warning' ? 'focus:ring-warning-500' : ''}
                ${toast.type === 'info' ? 'focus:ring-primary-500' : ''}
              `}
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
