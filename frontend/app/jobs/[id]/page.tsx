'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getJob, getJobApplications, uploadApplication } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { HTMLContent } from '@/components/ui/html-content';
import { ArrowLeft, Upload, X } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
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

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  useEffect(() => {
    loadApplications();
  }, [statusFilter, order]);

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
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploading(true);

    try {
      await uploadApplication(jobId, {
        fullName,
        email,
        phone: phone || undefined,
        resumeText: resumeText || undefined,
        resumeFile: resumeFile || undefined,
      });

      setFullName('');
      setEmail('');
      setPhone('');
      setResumeText('');
      setResumeFile(null);
      setShowUploadForm(false);

      await loadApplications();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload application');
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
            <CardHeader>
              <CardTitle className="text-3xl">{job.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <HTMLContent 
                content={job.description} 
                className="prose prose-sm dark:prose-invert max-w-none"
              />
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
                  <label className="text-sm text-muted-foreground">Status:</label>
                  <select
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

                  <label className="text-sm text-muted-foreground">Ordenar:</label>
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={order}
                    onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="desc">Maior pontuação primeiro</option>
                    <option value="asc">Menor pontuação primeiro</option>
                  </select>

                  <Button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    variant={showUploadForm ? "outline" : "default"}
                  >
                    {showUploadForm ? (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Enviar Candidato
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showUploadForm && (
                <form onSubmit={handleUploadSubmit} className="mb-6 p-4 bg-muted rounded-lg space-y-4">
                  {uploadError && (
                    <div className="bg-destructive/15 text-destructive text-sm px-4 py-3 rounded-md border border-destructive/20">
                      {uploadError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resumeFile">Arquivo do Currículo (PDF, DOCX ou TXT)</Label>
                      <Input
                        id="resumeFile"
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      />
                    </div>
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

                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Enviando...' : 'Enviar Candidatura'}
                  </Button>
                </form>
              )}

              {applications.length === 0 ? (
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
