const BASE = '/api';

export async function listDocuments() {
  const res = await fetch(`${BASE}/documents`);
  if (!res.ok) throw new Error('Erro ao listar documentos.');
  return res.json();
}

export async function uploadDocument(file) {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body });
  if (!res.ok) throw new Error('Erro ao enviar o arquivo.');
  return res.json();
}

export function getDownloadUrl(id) {
  return `${BASE}/documents/${id}/download`;
}
