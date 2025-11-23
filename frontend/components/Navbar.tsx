'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/lib/api';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Vagas' },
  { href: '/insights', label: 'Insights' },
];

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
        <Button
          variant="ghost"
          onClick={handleLogout}
        >
          Sair
        </Button>
      </div>
    </nav>
  );
}
