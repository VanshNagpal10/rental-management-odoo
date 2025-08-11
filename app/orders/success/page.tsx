/**
 * Order Success Page
 * Shows confirmation after successful payment
 */
'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import div className="min-h-screen bg-white" from '@/components/customer/div className="min-h-screen bg-white"';
import { CheckCircle, Download, Eye } from 'lucide-react';

export default function OrderSuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not customer
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'customer') {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" title="Order Confirmed">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">#ORD-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-medium text-green-600">Paid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Status:</span>
              <span className="font-medium text-blue-600">Confirmed</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center space-x-2 bg-primary-800 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors">
              <Eye className="h-4 w-4" />
              <span>View Order</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 border border-primary-800 text-primary-800 px-6 py-3 rounded-md font-medium hover:bg-primary-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Download Invoice</span>
            </button>
          </div>

          <Link 
            href="/shop"
            className="inline-block text-primary-800 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

