'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getJobs } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'ON_HOLD' | 'REJECTED';

interface Application {
  id: string;
  matchScore: number;
  status?: ApplicationStatus;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  applications: Application[];
  createdAt: string;
}

export default function InsightsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const totals = useMemo(() => {
    const totalJobs = jobs.length;
    const totalApplications = jobs.reduce((sum, job) => sum + job.applications.length, 0);
    const averageScore = (() => {
      const allScores = jobs.flatMap((job) => job.applications.map((a) => a.matchScore));
      if (allScores.length === 0) return 0;
      const sum = allScores.reduce((acc, score) => acc + score, 0);
      return +(sum / allScores.length).toFixed(1);
    })();

    const statusCounts: Record<ApplicationStatus, number> = {
      PENDING: 0,
      SHORTLISTED: 0,
      ON_HOLD: 0,
      REJECTED: 0,
    };

    jobs.forEach((job) => {
      job.applications.forEach((app) => {
        const status = app.status || 'PENDING';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
    });

    const topJob = (() => {
      if (jobs.length === 0) return null;
      const sorted = [...jobs].sort((a, b) => b.applications.length - a.applications.length);
      return sorted[0];
    })();

    const topCandidates = (() => {
      const all = jobs.flatMap((job) => job.applications.map((app) => ({ ...app, job })));
      return all
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
    })();

    return { totalJobs, totalApplications, averageScore, statusCounts, topJob, topCandidates };
  }, [jobs]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <p className="text-lg font-medium">Carregando insights...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <header className="px-4 sm:px-0 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Insights de Recrutamento</CardTitle>
              <CardDescription>Monitore o funil e encontre rapidamente candidatos de destaque.</CardDescription>
            </CardHeader>
          </Card>
        </header>

        <section className="grid gap-4 px-4 sm:px-0 md:grid-cols-3" aria-label="Indicadores principais">
          <Card>
            <CardHeader>
              <CardDescription>Total de vagas</CardDescription>
              <CardTitle className="text-4xl">{totals.totalJobs}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Candidaturas recebidas</CardDescription>
              <CardTitle className="text-4xl">{totals.totalApplications}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Match médio</CardDescription>
              <CardTitle className="text-4xl">{totals.averageScore}%</CardTitle>
            </CardHeader>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 px-4 sm:px-0 lg:grid-cols-3" aria-label="Distribuição e destaques">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Distribuição por status</CardTitle>
              <CardDescription>Veja como os candidatos estão progredindo.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(['SHORTLISTED', 'PENDING', 'ON_HOLD', 'REJECTED'] as ApplicationStatus[]).map((status) => {
                  const count = totals.statusCounts[status] || 0;
                  const total = totals.totalApplications || 1;
                  const percent = Math.round((count / total) * 100);
                  return (
                    <article key={status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{statusLabel(status)}</Badge>
                          <span className="text-muted-foreground">{count} cand.</span>
                        </div>
                        <span className="text-muted-foreground">{percent}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percent}%` }}
                          aria-hidden
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vaga mais movimentada</CardTitle>
              <CardDescription>Qual posição recebeu mais interesse.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {totals.topJob ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg leading-tight">{totals.topJob.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {totals.topJob.applications.length} candidaturas • {new Date(totals.topJob.createdAt).toLocaleDateString()}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/jobs/${totals.topJob.id}`}>Ver candidaturas</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Ainda não há vagas.</p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 px-4 sm:px-0" aria-label="Candidatos em destaque">
          <Card>
            <CardHeader>
              <CardTitle>Top candidaturas por match</CardTitle>
              <CardDescription>As cinco candidaturas com maior compatibilidade.</CardDescription>
            </CardHeader>
            <CardContent>
              {totals.topCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma candidatura enviada ainda.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vaga</TableHead>
                      <TableHead>Enviado em</TableHead>
                      <TableHead className="text-right">Match</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {totals.topCandidates.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium leading-tight">{item.job.title}</span>
                            <span className="text-xs text-muted-foreground">ID: {item.id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            {item.matchScore.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function statusLabel(status: ApplicationStatus) {
  switch (status) {
    case 'SHORTLISTED':
      return 'Shortlist';
    case 'ON_HOLD':
      return 'Em espera';
    case 'REJECTED':
      return 'Recusado';
    default:
      return 'Pendente';
  }
}

