const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export async function register(
  name: string,
  email: string,
  password: string,
  options?: { role?: 'ADMIN' | 'RECRUITER' | 'CANDIDATE'; phone?: string; avatarUrl?: string }
) {
  return fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, ...options }),
  });
}

export async function login(email: string, password: string) {
  return fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return fetchAPI('/api/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser() {
  return fetchAPI('/api/auth/me');
}

export async function getJobs() {
  return fetchAPI('/api/jobs');
}

export async function getJob(id: string) {
  return fetchAPI(`/api/jobs/${id}`);
}

export async function createJob(data: { title: string; description: string; requiredSkills: string[]; company?: string }) {
  return fetchAPI('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getJobApplications(jobId: string, options?: { status?: string; order?: 'asc' | 'desc' }) {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.order) params.set('order', options.order);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI(`/api/jobs/${jobId}/applications${suffix}`);
}

export async function deleteJob(id: string) {
  return fetchAPI(`/api/jobs/${id}`, {
    method: 'DELETE',
  });
}

export async function getApplication(id: string) {
  return fetchAPI(`/api/applications/${id}`);
}

export async function updateApplication(
  id: string,
  data: {
    status?: 'PENDING' | 'SHORTLISTED' | 'ON_HOLD' | 'REJECTED';
    notes?: string;
  }
) {
  return fetchAPI(`/api/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getMyApplications() {
  return fetchAPI('/api/applications/me');
}

export async function uploadApplication(
  jobId: string,
  data: {
    resumeText?: string;
    resumeFile?: File;
  }
) {
  const formData = new FormData();
  if (data.resumeText) formData.append('resumeText', data.resumeText);
  if (data.resumeFile) formData.append('resume', data.resumeFile);

  const response = await fetch(`${API_URL}/api/jobs/${jobId}/applications`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export async function deleteApplication(id: string) {
  return fetchAPI(`/api/applications/${id}`, {
    method: 'DELETE',
  });
}
