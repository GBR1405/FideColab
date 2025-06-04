// Configuración base para Fetch
const baseUrl = 'http://192.168.0.4:3000'; // Tu backend

export const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    credentials: 'include', // Esto es crucial para enviar cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en la solicitud');
  }

  return response.json();
};

// Para formularios con archivos
export const fetchWithFormData = async (url, formData) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  return response.json();
};