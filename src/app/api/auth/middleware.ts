import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export interface AuthRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
}

export async function authenticateUser(request: AuthRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET as string
    ) as {
      id: number;
      email: string;
      name: string;
      role: 'user' | 'admin';
    };
    
    // Validate session in database
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        }
      }
    });
    
    if (!session) {
      throw new Error('Invalid or expired session');
    }
    
    // Add user to request
    request.user = decoded;
    
    return true;
  } catch {
    return false;
  }
}

export function requireAuth(handler: (req: AuthRequest) => Promise<NextResponse>) {
  return async (request: AuthRequest) => {
    const isAuthenticated = await authenticateUser(request);
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return handler(request);
  };
}
