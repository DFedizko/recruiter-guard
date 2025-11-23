'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then(() => {
        router.push('/dashboard');
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  return (
    <main className="flex-1 flex items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-foreground">Carregando...</h1>
    </main>
  );
}
