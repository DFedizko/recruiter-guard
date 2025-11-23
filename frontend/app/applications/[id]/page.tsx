'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getApplication, updateApplication } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'ON_HOLD' | 'REJECTED';

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
  status: ApplicationStatus;
  notes?: string | null;
  createdAt: string;
}

const STATUS_META: Record<ApplicationStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pendente',
    className: 'bg-muted text-foreground border-muted',
  },
  SHORTLISTED: {
    label: 'Shortlist',
    className: 'bg-green-600 text-white border-green-600',
  },
  ON_HOLD: {
    label: 'Em espera',
    className: 'bg-amber-500 text-white border-amber-500',
  },
  REJECTED: {
    label: 'Recusado',
    className: 'bg-destructive text-destructive-foreground border-destructive',
  },
};

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ApplicationStatus>('PENDING');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const loadApplication = useCallback(async () => {
    try {
      const data = await getApplication(applicationId);
      setApplication(data);
      setStatus(data.status);
      setNotes(data.notes || '');
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveMessage('');
    setSaving(true);

    try {
      const updated = await updateApplication(applicationId, { status, notes });
      setApplication(updated);
      setStatus(updated.status);
      setNotes(updated.notes || '');
      setSaveMessage('Triagem atualizada');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar');
    } finally {
      setSaving(false);
    }
  };

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
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/jobs/${application.job.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à Vaga
          </Link>
        </Button>
        <div className="px-4 py-6 sm:px-0 flex flex-col gap-6">

          <Card>
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
                <div className="text-right space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">Pontuação</Label>
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-2xl px-4 py-2">
                      {application.matchScore.toFixed(1)}%
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">Status</Label>
                    <Badge
                      variant="outline"
                      className={`${STATUS_META[status]?.className} text-sm px-3 py-1`}
                    >
                      {STATUS_META[status]?.label || 'Sem status'}
                    </Badge>
                  </div>
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

          <Card>
            <CardHeader>
              <CardTitle>Triagem e Notas</CardTitle>
              <CardDescription>Classifique o candidato e registre observações internas</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                {saveError && (
                  <div className="bg-destructive/15 text-destructive text-sm px-4 py-3 rounded-md border border-destructive/20">
                    {saveError}
                  </div>
                )}
                {saveMessage && (
                  <div className="bg-green-600/15 text-green-600 text-sm px-4 py-3 rounded-md border border-green-600/20">
                    {saveMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    >
                      <option value="PENDING">Pendente</option>
                      <option value="SHORTLISTED">Shortlist</option>
                      <option value="ON_HOLD">Em espera</option>
                      <option value="REJECTED">Recusado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas internas</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Insights sobre a entrevista, pontos fortes, riscos ou próximos passos."
                    />
                    <p className="text-xs text-muted-foreground">Visível apenas para o seu time.</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar triagem'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
