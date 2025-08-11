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
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'
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
        timestamp: new Date().toISOString()
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
