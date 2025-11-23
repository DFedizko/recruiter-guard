'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createJob, getCurrentUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { ArrowLeft } from 'lucide-react';

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'RECRUITER' | 'CANDIDATE' | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((data) => setRole(data.user.role))
      .catch(() => setRole(null));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const skillsArray = requiredSkills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await createJob({
        title,
        description,
        requiredSkills: skillsArray,
        company: company || undefined,
      });

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-background">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Painel
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Criar Nova Vaga</CardTitle>
              <CardDescription>
                Adicione uma nova vaga para começar a receber candidaturas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {role === 'CANDIDATE' ? (
                <div className="text-sm text-muted-foreground">
                  Somente recrutadores ou administradores podem criar vagas.
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/15 text-destructive text-sm px-4 py-3 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    type="text"
                    id="company"
                    placeholder="ex: Tech Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título da Vaga *</Label>
                  <Input
                    type="text"
                    id="title"
                    required
                    placeholder="ex: Desenvolvedor Sênior"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <MarkdownEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Descreva a função, responsabilidades e requisitos da vaga... Use os botões acima para formatar o texto (negrito, títulos, listas, etc.)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredSkills">Habilidades Necessárias (separadas por vírgula)</Label>
                  <Input
                    type="text"
                    id="requiredSkills"
                    placeholder="ex: JavaScript, React, Node.js"
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Separe múltiplas habilidades com vírgulas
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Criando...' : 'Criar Vaga'}
                  </Button>
                </div>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
