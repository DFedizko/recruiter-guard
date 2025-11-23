'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getJob, getJobApplications, uploadApplication, getCurrentUser, deleteJob } from '@/lib/api';
import { getMyApplications } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { HTMLContent } from '@/components/ui/html-content';
import { ArrowLeft, Upload, X, Trash } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  company?: string | null;
  user: {
    id: string;
    name: string;
    role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE';
  };
}

type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'ON_HOLD' | 'REJECTED';

interface Application {
  id: string;
  candidate: {
    id: string;
    fullName: string;
    email: string;
  };
  extractedSkills: string[];
  matchScore: number;
  status: ApplicationStatus;
  notes?: string | null;
  submittedBy?: {
    id: string;
  } | null;
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

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('ALL');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [currentUser, setCurrentUser] = useState<null | { id: string; role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE' }>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [canViewApplications, setCanViewApplications] = useState(true);
  const [checkingMine, setCheckingMine] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  useEffect(() => {
    loadApplications();
  }, [statusFilter, order, currentUser]);

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        const userShape = { id: data.user.id, role: data.user.role as 'ADMIN' | 'RECRUITER' | 'CANDIDATE' };
        setCurrentUser(userShape);
        loadApplications();
        if (data.user.role === 'CANDIDATE' || data.user.role === 'RECRUITER' || data.user.role === 'ADMIN') {
          setCheckingMine(true);
          getMyApplications()
            .then((apps) => {
              const already = apps.some((app: any) => app.job.id === jobId);
              setHasApplied(already);
            })
            .catch(() => {})
            .finally(() => setCheckingMine(false));
        }
      })
      .catch(() => setCurrentUser(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadJob = async () => {
    try {
      const data = await getJob(jobId);
      setJob(data);
    } catch (error) {
      console.error('Failed to load job:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const data = await getJobApplications(jobId, {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        order,
      });
      setApplications(data);
      setCanViewApplications(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load applications';
      if (message.toLowerCase().includes('forbidden')) {
        setCanViewApplications(false);
        setApplications([]);
      } else {
        console.error('Failed to load applications:', error);
      }
    }
  };

  const loadMyApplications = async () => {
    if (!currentUser) return;
    setCheckingMine(true);
    try {
      const mine = await getMyApplications();
      const applied = mine.some((app: any) => app.job.id === jobId);
      setHasApplied(applied);
    } catch (error) {
      console.error('Failed to load my applications:', error);
    } finally {
      setCheckingMine(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!job) return;
    const confirmed = window.confirm('Deseja excluir esta vaga?');
    if (!confirmed) return;
    try {
      await deleteJob(job.id);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasApplied) {
      return;
    }
    setUploadError('');
    setUploading(true);

    try {
      await uploadApplication(jobId, {
        resumeText: resumeText || undefined,
        resumeFile: resumeFile || undefined,
      });

      setResumeText('');
      setResumeFile(null);
      setShowUploadForm(false);

      await loadApplications();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.toLowerCase().includes('already applied')) {
        setHasApplied(true);
        setUploadError('Você já enviou uma candidatura para esta vaga.');
      } else if (message.toLowerCase().includes('forbidden')) {
        setUploadError('Você não tem permissão para enviar candidatura nesta vaga.');
      } else {
        setUploadError('Não foi possível enviar a candidatura. Tente novamente.');
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading || !job) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
        </div>
      </main>
    );
  }

  const canDeleteJob = currentUser 
    && (currentUser.role === 'ADMIN' || (currentUser.role === 'RECRUITER'
    && job.user?.id === currentUser.id));

  return (
    <main className="flex-1 bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Painel
            </Link>
          </Button>

          <Card className="mb-6">
            <CardHeader className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {job.company ? job.company : 'Empresa não informada'}
                  </p>
                </div>
                {canDeleteJob && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteJob}>
                    <Trash className="mr-2 h-4 w-4" />
                    Excluir vaga
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <HTMLContent 
                content={job.description} 
                className="prose prose-sm dark:prose-invert max-w-none"
              />
            </CardContent>
            <CardContent className="text-sm text-muted-foreground">
              <span>Criado por: {job.user?.name || 'Usuário desconhecido'}</span>
            </CardContent>
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <CardContent>
                <div className="space-y-2">
                  <Label>Habilidades Necessárias:</Label>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, idx) => (
                      <Badge key={idx} variant="default">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Candidaturas</CardTitle>
                  <div className="text-sm text-muted-foreground">Filtre por status e ordene pela pontuação</div>
                </div>
                <div className="flex flex-wrap gap-2 md:items-center">
                  <label className="text-sm text-muted-foreground" htmlFor="status-select">Status:</label>
                  <select
                    id="status-select"
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ApplicationStatus)}
                  >
                    <option value="ALL">Todos</option>
                    <option value="PENDING">Pendente</option>
                    <option value="SHORTLISTED">Shortlist</option>
                    <option value="ON_HOLD">Em espera</option>
                    <option value="REJECTED">Recusado</option>
                  </select>

                  <label className="text-sm text-muted-foreground" htmlFor="order-select">Ordenar:</label>
                  <select
                    id="order-select"
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={order}
                    onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="desc">Maior pontuação primeiro</option>
                    <option value="asc">Menor pontuação primeiro</option>
                  </select>

                  <Button
                    onClick={() => !hasApplied && setShowUploadForm(!showUploadForm)}
                    variant={showUploadForm ? "outline" : "default"}
                    disabled={hasApplied}
                  >
                    {hasApplied ? (
                      'Já enviada'
                    ) : showUploadForm ? (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Enviar candidatura
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!canViewApplications && (
                <p className="text-sm text-muted-foreground mb-4">Apenas o dono da vaga ou administradores podem ver as candidaturas.</p>
              )}
              {showUploadForm && !hasApplied && (
                <form onSubmit={handleUploadSubmit} className="mb-6 p-4 bg-muted rounded-lg space-y-4">
                  {uploadError && (
                    <div className="bg-destructive/15 text-destructive text-sm px-4 py-3 rounded-md border border-destructive/20">
                      {uploadError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="resumeFile">Arquivo do Currículo (PDF, DOCX ou TXT)</Label>
                    <Input
                      id="resumeFile"
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      className="cursor-pointer"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">Usaremos seu nome e e-mail do perfil.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resumeText">Ou cole o texto do currículo</Label>
                    <Textarea
                      id="resumeText"
                      rows={6}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Cole o texto do currículo aqui..."
                    />
                  </div>

                  <Button type="submit" disabled={uploading || hasApplied}>
                    {hasApplied ? 'Já enviada' : uploading ? 'Enviando...' : 'Enviar Candidatura'}
                  </Button>
                </form>
              )}

              {hasApplied && (
                <p className="text-sm text-muted-foreground mb-4">Você já enviou uma candidatura para esta vaga.</p>
              )}

              {canViewApplications && 
                (applications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Ainda não há candidaturas.</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidato</TableHead>
                          <TableHead>Pontuação</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Habilidades</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>
                              <div className="font-medium">{app.candidate.fullName}</div>
                              <div className="text-sm text-muted-foreground">{app.candidate.email}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                {app.matchScore.toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={STATUS_META[app.status]?.className}
                              >
                                {STATUS_META[app.status]?.label || 'Sem status'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(app.extractedSkills) &&
                                  app.extractedSkills.slice(0, 3).map((skill, idx) => (
                                    <Badge key={idx} variant="secondary">
                                      {skill}
                                    </Badge>
                                  ))}
                                {Array.isArray(app.extractedSkills) &&
                                  app.extractedSkills.length > 3 && (
                                    <Badge variant="outline">
                                      +{app.extractedSkills.length - 3} mais
                                    </Badge>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="link" asChild>
                                <Link href={`/applications/${app.id}`}>Ver Detalhes</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
