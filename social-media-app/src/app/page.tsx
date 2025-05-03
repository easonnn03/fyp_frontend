'use client';
// run in browser
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    let timer;
    const token = localStorage.getItem('accessToken');
    if (token) {
      timer = setTimeout(() => {
        router.push('/home');
      }, 3000);
    } else {
      timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [router]);

  /*
  useEffect(() => {
    // effect logic here
  }, [variable]);

  React will run the effect once variable changes
  */

  /*
  When variable empty means, it only run once on mount/refresh (dont watch any future changes)
  */

  /*
  1. For nextjs behaviour, it renders once immediately
  2. Then it runs useEffect after the first paint
  3. Needed to add isLoading pages to avoid show content
  */
  if (!hasMounted) return null;

  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 animate-fade-in">
        Welcome to the ApBook
      </h1>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/*
HTTP Methods
GET: Read data (no data needed)
POST: Create data (requires data to be sent)
PUT: Update data (requires data to be changed and also item id)
DELETE: Delete data (requires item id for deletion)
*/