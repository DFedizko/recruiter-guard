'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout, getCurrentUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Vagas' },
  { href: '/insights', label: 'Insights' },
  { href: '/minhas-vagas', label: 'Minhas candidaturas' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<null | { name: string; avatarUrl?: string | null }>(null);

  const noNavbarPaths = ["/login", "/register"];

  const showNavbar = !noNavbarPaths.includes(pathname);

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

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
      <div className="flex items-center p-4 sm:px-6 lg:px-8 justify-between max-w-7xl mx-auto">
        <Link href="/dashboard" className="text-xl font-bold text-primary">
          RecruiterGuard
        </Link>
        <ul className="flex items-center gap-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive && 'text-primary'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <Avatar src={user?.avatarUrl} fallback={user?.name} />
              <span className="hidden md:inline text-sm font-medium">Perfil</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
}
