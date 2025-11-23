'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { logout, getCurrentUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Vagas' },
  { href: '/insights', label: 'Insights' },
  { href: '/minhas-vagas', label: 'Minhas candidaturas' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<null | { name: string; avatarUrl?: string | null }>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const noNavbarPaths = ["/login", "/register"];

  const showNavbar = !noNavbarPaths.includes(pathname);

  useEffect(() => {
    if (!showNavbar) return;

    let isSubscribed = true;

    getCurrentUser()
      .then((data) => {
        if (isSubscribed) setUser(data.user);
      })
      .catch(() => {
        if (isSubscribed) setUser(null);
      });

    return () => {
      isSubscribed = false;
    };
  }, [showNavbar]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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

        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary',
                      isActive && 'text-primary'
                    )}
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

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'md:hidden border-t bg-background transition-all duration-150',
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        )}
      >
        <ul className="flex flex-col gap-3 px-4 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'block rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive && 'text-primary'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between px-4 pb-4 pt-1 gap-3">
          <Button variant="ghost" asChild className="flex-1 justify-start">
            <Link href="/profile" className="flex items-center gap-2">
              <Avatar src={user?.avatarUrl} fallback={user?.name} />
              <span className="text-sm font-medium">Perfil</span>
            </Link>
          </Button>
          <Button variant="ghost" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
}
