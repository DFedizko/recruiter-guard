'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyApplications } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'ON_HOLD' | 'REJECTED';

interface MyApplication {
  id: string;
  matchScore: number;
  status: ApplicationStatus;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company?: string | null;
    user: {
      id: string;
      name: string;
      role: string;
    };
  };
}

const STATUS_META: Record<ApplicationStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-muted text-foreground border-muted' },
  SHORTLISTED: { label: 'Shortlist', className: 'bg-green-600 text-white border-green-600' },
  ON_HOLD: { label: 'Em espera', className: 'bg-amber-500 text-white border-amber-500' },
  REJECTED: { label: 'Recusado', className: 'bg-destructive text-destructive-foreground border-destructive' },
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then(setApps)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <p className="text-lg font-medium">Carregando candidaturas...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background">
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Minhas candidaturas</CardTitle>
            <CardDescription>Vagas para as quais você já aplicou.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {apps.length === 0 ? (
              <p className="text-sm text-muted-foreground">Você ainda não enviou candidaturas.</p>
            ) : (
              <ul className="divide-y divide-border">
                {apps.map((app) => (
                  <li key={app.id} className="py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <Link href={`/jobs/${app.job.id}`} className="text-lg font-semibold hover:text-primary">
                          {app.job.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {app.job.company || 'Empresa não informada'} • Criado por {app.job.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Candidatado em {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={STATUS_META[app.status]?.className}
                        >
                          {STATUS_META[app.status]?.label}
                        </Badge>
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          {app.matchScore.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

