'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type Role = 'ADMIN' | 'RECRUITER' | 'CANDIDATE';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: Role;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user as UserProfile))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));

    console.log(user);
  }, [router]);

  if (loading || !user) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <p className="text-lg font-medium">Carregando perfil...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background">
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar src={user.avatarUrl || undefined} fallback={user.name} className="h-14 w-14" />
              <div>
                <CardTitle className="text-2xl leading-tight">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="uppercase tracking-wide">
              {roleLabel(user.role)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <section className="grid gap-4 sm:grid-cols-2" aria-label="Detalhes do usuário">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <p className="text-sm text-muted-foreground">{user.phone || 'Não informado'}</p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <p className="text-sm text-muted-foreground">{roleLabel(user.role)}</p>
              </div>
            </section>
            <Separator />
            <section aria-label="Resumo">
              <p className="text-sm text-muted-foreground">
                Estas informações são usadas para identificar suas ações na plataforma (criação de vagas, candidaturas e gestão).
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function roleLabel(role: Role) {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'RECRUITER':
      return 'Recrutador';
    default:
      return 'Candidato';
  }
}

