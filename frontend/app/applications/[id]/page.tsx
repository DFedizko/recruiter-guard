'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getApplication } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

interface Application {
  id: string;
  candidate: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  job: {
    id: string;
    title: string;
    description: string;
    requiredSkills: string[];
  };
  extractedSkills: string[];
  matchScore: number;
  sanitizedResumeText: string;
  createdAt: string;
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const loadApplication = useCallback(async () => {
    try {
      const data = await getApplication(applicationId);
      setApplication(data);
    } catch (error) {
      console.error('Failed to load application:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [applicationId, router]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  if (loading || !application) {
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
      <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/jobs/${application.job.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à Vaga
            </Link>
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">
                    {application.candidate.fullName}
                  </CardTitle>
                  <CardDescription>{application.candidate.email}</CardDescription>
                  {application.candidate.phone && (
                    <CardDescription>{application.candidate.phone}</CardDescription>
                  )}
                </div>
                <div className="text-right">
                  <Label className="text-sm text-muted-foreground mb-1 block">Pontuação</Label>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-2xl px-4 py-2">
                    {application.matchScore.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-2 block">Vaga Candidatada</Label>
                <p className="font-medium">{application.job.title}</p>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-2 block">Habilidades Extraídas</Label>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(application.extractedSkills) &&
                    application.extractedSkills.map((skill) => (
                      <Badge key={skill} variant="default">
                        {skill}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Currículo Sanitizado</CardTitle>
              <CardDescription>
                Informações pessoais identificáveis foram removidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {application.sanitizedResumeText}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

