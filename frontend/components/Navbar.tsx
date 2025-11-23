'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const noNavbarPaths = ["/login", "/register"];

  const showNavbar = !noNavbarPaths.includes(pathname);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  if (showNavbar) return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center px-2 py-2 text-xl font-bold text-primary">
              RecruiterGuard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

