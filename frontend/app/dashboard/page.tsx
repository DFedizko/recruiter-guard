'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJobs } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HTMLContent } from '@/components/ui/html-content';
import { Plus } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  applications: Array<{ id: string }>;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Vagas</h1>
            <Button asChild>
              <Link href="/jobs/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar Nova Vaga
              </Link>
            </Button>
          </div>

          {jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Ainda não há vagas. Crie sua primeira vaga!</p>
                <Button asChild variant="outline">
                  <Link href="/jobs/new">Criar uma vaga</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={`/jobs/${job.id}`}>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{job.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="line-clamp-3 text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_p]:line-clamp-3 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm">
                        <HTMLContent content={job.description} />
                      </div>
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {job.requiredSkills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                          {job.requiredSkills.length > 3 && (
                            <Badge variant="outline">+{job.requiredSkills.length - 3}</Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{job.applications.length} candidat{job.applications.length !== 1 ? 'os' : 'o'}</span>
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </CardFooter>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

