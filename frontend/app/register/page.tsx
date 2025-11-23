'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const VALID_DDDS = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28',
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '51', '53', '54', '55',
  '61', '62', '63', '64',
  '65', '66', '67', '68', '69',
  '71', '73', '74', '75', '77', '79',
  '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '91', '92', '93', '94', '95', '96', '97', '98', '99',
]);

const sanitizePhone = (value: string) => value.replace(/\D/g, '');

const formatPhone = (digits: string) => {
  const clean = digits.slice(0, 11);
  if (clean.length <= 2) return clean;
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
};

function isValidBrazilPhone(value: string) {
  const digits = sanitizePhone(value);
  if (!digits) return true;

  if (digits.length !== 10 && digits.length !== 11) return false;

  const ddd = digits.slice(0, 2);
  if (!VALID_DDDS.has(ddd)) return false;

  if (/^(\d)\1+$/.test(digits)) return false;

  const firstLocalDigit = digits[2];
  if (digits.length === 11) {
    return firstLocalDigit === '9';
  }

  return ['2', '3', '4', '5'].includes(firstLocalDigit);
}

const getPhoneError = (value: string) => (isValidBrazilPhone(value) ? '' : 'Telefone inválido');

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'RECRUITER' | 'CANDIDATE'>('RECRUITER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = async (file?: File) => {
    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('A imagem deve ter no máximo 2MB.');
      setAvatarPreview(null);
      return;
    }

    try {
      setAvatarError('');
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarPreview(dataUrl);
    } catch (err) {
      setAvatarError('Não foi possível ler o arquivo.');
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    setPhoneError(getPhoneError(phone));
  };

  const handlePhoneChange = (value: string) => {
    const digits = sanitizePhone(value).slice(0, 11);
    const formatted = formatPhone(digits);
    setPhone(formatted);
    if (phoneTouched) {
      setPhoneError(getPhoneError(formatted));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const phoneValidationError = getPhoneError(phone);
    setPhoneError(phoneValidationError);

    if (phoneValidationError) {
      setPhoneTouched(true);
      return;
    }
    setLoading(true);

    try {
      const sanitizedPhone = sanitizePhone(phone);

      await register(name, email, password, {
        role,
        phone: sanitizedPhone || undefined,
        avatarUrl: avatarPreview || undefined,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Criar sua conta</CardTitle>
            <CardDescription className="text-center">
              Digite suas informações para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm px-4 py-3 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Endereço de e-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={handlePhoneBlur}
                  maxLength={15}
                />
                {phoneError && phoneTouched && (
                  <p className="text-xs text-destructive">{phoneError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Foto (opcional)</Label>
                <div className="flex items-center gap-3">

                  {avatarPreview && (
                    <img src={avatarPreview} alt="Pré-visualização do avatar" className="h-12 w-12 rounded-full" />
                  )}

                  <Input
                    id="avatar"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Formatos de imagem populares, até 2MB.</p>
                {avatarError && <p className="text-xs text-destructive">{avatarError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Perfil</Label>
                <select
                  id="role"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'ADMIN' | 'RECRUITER' | 'CANDIDATE')}
                >
                  <option value="RECRUITER">Recrutador</option>
                  <option value="CANDIDATE">Candidato</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Criando conta...' : 'Registrar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
