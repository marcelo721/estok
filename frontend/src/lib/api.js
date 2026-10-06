export async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('estok_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response;
  try {
    response = await fetch(`/api${endpoint}`, config);
  } catch (netErr) {
    throw new Error('Falha de conexão com o servidor. Verifique se o backend está rodando na porta 4000.');
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = { message: text };
    } catch {
      data = null;
    }
  }

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('estok_token');
      localStorage.removeItem('estok_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error('Sessão expirada ou não autenticado. Redirecionando para login...');
  }

  if (!response.ok) {
    const errorMessage = data?.error || data?.message || `Erro ${response.status}: Falha na requisição`;
    throw new Error(errorMessage);
  }

  return data;
}