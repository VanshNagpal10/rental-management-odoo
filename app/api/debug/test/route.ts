/**
 * Debug Test API Route
 * Simple test to verify basic functionality on Vercel
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    console.log('Debug test API called');
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      MONGODB_URI_FIRST_CHARS: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET',
      VERCEL: process.env.VERCEL ? 'SET' : 'NOT SET',
      ALL_ENV_KEYS: Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('NEXTAUTH')).join(', ')
    });

    // Test MongoDB connection
    await connectDB();
    console.log('MongoDB connected successfully');

    // Test User model
    const userCount = await User.countDocuments();
    console.log('User count:', userCount);

    return NextResponse.json({
      success: true,
      message: 'Debug test successful',
      data: {
        environment: process.env.NODE_ENV,
        mongodbConnected: true,
        userCount,
        timestamp: new Date().toISOString(),
        envVars: {
          MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
          MONGODB_URI_FIRST_CHARS: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT SET',
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
          NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET',
          VERCEL: process.env.VERCEL ? 'SET' : 'NOT SET',
          ALL_MONGO_NEXTAUTH_KEYS: Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('NEXTAUTH')).join(', ')
        }
      }
    });
  } catch (error) {
    console.error('Debug test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
