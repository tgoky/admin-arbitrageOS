// admin-app/app/api/admin/auth-helper.ts
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function getAuthenticatedAdmin(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Method 1: Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: { 
              get: () => undefined,
              set: () => {},
              remove: () => {}
            },
          }
        );
        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          // Verify admin role
          const adminProfile = await prisma.adminProfile.findUnique({
            where: { id: user.id },
          });
          
          if (adminProfile) {
            return { user, admin: adminProfile, error: null };
          }
        }
      } catch (tokenError) {
        console.warn('Token auth failed:', tokenError);
      }
    }
    
    // Method 2: SSR cookies
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              try {
                const cookie = cookieStore.get(name);
                if (!cookie?.value) return undefined;
                
                // Handle base64 encoded cookies
                if (cookie.value.startsWith('base64-')) {
                  try {
                    const decoded = atob(cookie.value.substring(7));
                    JSON.parse(decoded);
                    return cookie.value;
                  } catch (e) {
                    console.warn(`Corrupted base64 cookie ${name}`);
                    return undefined;
                  }
                }
                
                return cookie.value;
              } catch (error) {
                console.warn(`Error reading cookie ${name}:`, error);
                return undefined;
              }
            },
            set() {},
            remove() {}
          },
        }
      );
      
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        // Verify admin role
        const adminProfile = await prisma.adminProfile.findUnique({
          where: { id: user.id },
        });
        
        if (adminProfile) {
          return { user, admin: adminProfile, error: null };
        }
      }
    } catch (ssrError) {
      console.warn('SSR cookie auth failed:', ssrError);
    }
    
    return { 
      user: null, 
      admin: null, 
      error: new Error('Admin authentication failed') 
    };
    
  } catch (error) {
    console.error('Admin authentication error:', error);
    return { user: null, admin: null, error };
  }
}