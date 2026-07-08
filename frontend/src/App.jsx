import { useState, useEffect, useCallback } from 'react';
import { listDocuments } from './services/api';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Document Management System</h1>
      <UploadComponent onUpload={fetchDocuments} />
      <h2>Documentos</h2>
      {loading && <p>Carregando…</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {!loading && !erro && <DocumentList documents={documents} />}
    </main>
  );
}
