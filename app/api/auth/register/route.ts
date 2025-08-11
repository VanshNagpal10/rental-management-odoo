/**
 * User Registration API Route Handler
 * Handles new user registration for both customers and end users
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { logger } from '@/lib/logger';
import { ApiResponse } from '@/types';

/**
 * POST /api/auth/register
 * Register a new user (customer or end user)
 */
export async function POST(request: NextRequest) {
  try {
    // Debug logging for Vercel
    console.log('Registration API called');
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'
    });

    await connectDB();
    console.log('MongoDB connected successfully');

    const body = await request.json();
    console.log('Request body received:', {
      ...body,
      password: body.password ? '[REDACTED]' : 'NOT PROVIDED'
    });

    const {
      name,
      email,
      phone,
      address,
      password,
      role,
      companyName,
      businessType,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields: name, email, password, and role are required',
      };
      
      return NextResponse.json(response, { status: 400 });
    }

    // Validate role
    if (!['customer', 'enduser'].includes(role)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid role. Must be either "customer" or "enduser"',
      };
      
      return NextResponse.json(response, { status: 400 });
    }

    // Validate end user specific fields
    if (role === 'enduser') {
      if (!companyName || !businessType) {
        const response: ApiResponse = {
          success: false,
          error: 'Company name and business type are required for end users',
        };
        
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Check if user already exists
    console.log('Checking for existing user with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', existingUser._id);
      logger.warn('Registration attempt with existing email', { email });
      
      const response: ApiResponse = {
        success: false,
        error: 'A user with this email already exists',
      };
      
      return NextResponse.json(response, { status: 409 });
    }
    console.log('No existing user found, proceeding with registration');

    // Create new user
    const userData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
    };

    // Add optional fields if provided
    if (phone) userData.phone = phone.trim();
    if (address) userData.address = address.trim();

    // Add end user specific fields
    if (role === 'enduser') {
      userData.companyName = companyName.trim();
      userData.businessType = businessType;
    }

    console.log('Creating user with data:', {
      ...userData,
      password: userData.password ? '[REDACTED]' : 'NOT PROVIDED'
    });

    const user = new User(userData);
    console.log('User instance created, attempting to save...');
    
    await user.save();
    console.log('User saved successfully:', user._id);

    logger.auth('User registered successfully', user.email, { 
      role: user.role,
      userId: user._id 
    });

    // Return success response (without password)
    const response: ApiResponse = {
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        ...(user.role === 'enduser' && {
          companyName: user.companyName,
          businessType: user.businessType,
        }),
      },
      message: 'User registered successfully',
    };

    console.log('Registration successful, returning response');
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Registration error caught:', error);
    logger.error('Error registering user', { error });
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      console.log('Validation error details:', error.message);
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      
      return NextResponse.json(response, { status: 400 });
    }

    // Handle duplicate key errors (shouldn't happen due to pre-check, but just in case)
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      const response: ApiResponse = {
        success: false,
        error: 'A user with this email already exists',
      };
      
      return NextResponse.json(response, { status: 409 });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to register user. Please try again.',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
