'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        toast.error('🔒 Please log in to continue.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      try {
        const { exp } = jwtDecode<{ exp: number }>(token);
        const now = Date.now() / 1000;

        if (exp < now) {
          toast.warning('⚠️ Session expired. Please log in again.');
          localStorage.clear();
          setTimeout(() => router.push('/login'), 2500);
        } else {
          setIsLoading(false);
        }
      } catch {
        toast.error('❌ Invalid token. Please log in again.');
        localStorage.clear();
        setTimeout(() => router.push('/login'), 2500);
      }
    };

    checkAuth();
  }, [pathname]);

  return { isLoading };
};
