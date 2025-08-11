/**
 * NextAuth Configuration
 * Handles authentication with credentials provider and role-based access
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { logger } from '@/lib/logger';

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'Enter your email'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Enter your password'
        },
      },
      async authorize(credentials) {
        console.log('NextAuth authorize called');
        console.log('Environment check in auth:', {
          MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
          NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET'
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials in login attempt');
          logger.auth('Missing credentials in login attempt');
          return null;
        }

        try {
          // Connect to database
          console.log('Connecting to MongoDB for auth...');
          await connectDB();
          console.log('MongoDB connected for auth');

          // Find user by email
          console.log('Looking for user with email:', credentials.email);
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            console.log('User not found:', credentials.email);
            logger.auth('User not found', credentials.email);
            return null;
          }
          console.log('User found:', user._id);

          // Verify password
          console.log('Verifying password...');
          const isValidPassword = await user.comparePassword(credentials.password);
          if (!isValidPassword) {
            console.log('Invalid password for:', credentials.email);
            logger.auth('Invalid password attempt', credentials.email);
            return null;
          }
          console.log('Password valid for:', credentials.email);

          // Log successful authentication
          logger.auth('Successful login', user.email, { role: user.role });

          // Return user object for session
          const userObj = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
          console.log('Returning user object:', userObj);
          return userObj;
        } catch (error) {
          console.error('Authentication error:', error);
          logger.error('Authentication error', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            email: credentials.email 
          });
          return null;
        }
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    // JWT callback - runs whenever JWT is created/updated
    async jwt({ token, user }) {
      // Include user role in JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // Session callback - runs whenever session is accessed
    async session({ session, token }) {
      // Include user role and id in session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'customer' | 'enduser';
      }
      return session;
    },

    // Redirect callback - controls where user is redirected after auth
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after login
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login', // Error page
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      logger.auth('User signed in', user.email, { 
        provider: account?.provider,
        isNewUser 
      });
    },
    
    async signOut({ token }) {
      logger.auth('User signed out', token?.email as string);
    },
    
    async createUser({ user }) {
      logger.auth('New user created', user.email);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

/**
 * Utility function to check if user is an end user
 */
export function isEndUser(userRole?: string): boolean {
  return userRole === 'enduser';
}

/**
 * Utility function to check if user has customer role
 */
export function isCustomer(userRole?: string): boolean {
  return userRole === 'customer';
}

/**
 * Middleware function to check authentication
 */
export function requireAuth(req: any): boolean {
  return !!req.auth?.user;
}

/**
 * Middleware function to check end user role
 */
export function requireEndUser(req: any): boolean {
  return req.auth?.user?.role === 'enduser';
}
