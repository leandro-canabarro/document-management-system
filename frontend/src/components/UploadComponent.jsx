import { useState } from 'react';
import { uploadDocument } from '../services/api';

export default function UploadComponent({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setErro('');
    try {
      await uploadDocument(file);
      setFile(null);
      e.target.reset();
      onUpload();
    } catch (err) {
      setErro(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
      <label htmlFor="file-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
        Selecionar arquivo
      </label>
      <input
        id="file-input"
        type="file"
        onChange={(e) => setFile(e.target.files[0] ?? null)}
        disabled={uploading}
      />
      <button type="submit" disabled={!file || uploading} style={{ marginLeft: '0.75rem' }}>
        {uploading ? 'Enviando…' : 'Enviar'}
      </button>
      {erro && <p style={{ color: 'red', marginTop: '0.5rem' }}>{erro}</p>}
    </form>
  );
}
