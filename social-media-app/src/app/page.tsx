'use client';
// run in browser

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  /*
  useEffect(() => {
    // effect logic here
  }, [variable]);

  React will run the effect once variable changes
  */

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, []);
  /*
  When variable empty means, it only run once on mount/refresh (dont watch any future changes)
  */

  /*
  1. For nextjs behaviour, it renders once immediately
  2. Then it runs useEffect after the first paint
  3. Needed to add isLoading pages to avoid show content
  */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome to the Homepage!</h1>
      {/* You can safely show other content here */}
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