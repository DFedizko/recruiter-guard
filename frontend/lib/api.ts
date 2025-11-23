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

export async function register(name: string, email: string, password: string) {
  return fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
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

export async function createJob(data: { title: string; description: string; requiredSkills: string[] }) {
  return fetchAPI('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getJobApplications(jobId: string) {
  return fetchAPI(`/api/jobs/${jobId}/applications`);
}

export async function getApplication(id: string) {
  return fetchAPI(`/api/applications/${id}`);
}

export async function uploadApplication(
  jobId: string,
  data: {
    fullName: string;
    email: string;
    phone?: string;
    resumeText?: string;
    resumeFile?: File;
  }
) {
  const formData = new FormData();
  formData.append('fullName', data.fullName);
  formData.append('email', data.email);
  if (data.phone) formData.append('phone', data.phone);
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

