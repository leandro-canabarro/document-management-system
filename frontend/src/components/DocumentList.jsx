import DownloadButton from './DownloadButton';

export default function DocumentList({ documents }) {
  if (documents.length === 0) {
    return <p>Nenhum documento encontrado.</p>;
  }

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={thStyle}>Nome</th>
          <th style={thStyle}>Tamanho</th>
          <th style={thStyle}>Data</th>
          <th style={thStyle}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.id}>
            <td style={tdStyle}>{doc.originalName}</td>
            <td style={tdStyle}>{formatSize(doc.size)}</td>
            <td style={tdStyle}>{new Date(doc.uploadedAt).toLocaleString('pt-BR')}</td>
            <td style={tdStyle}>
              <DownloadButton id={doc.id} originalName={doc.originalName} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const thStyle = { textAlign: 'left', borderBottom: '2px solid #ccc', padding: '0.5rem 0.75rem' };
const tdStyle = { padding: '0.5rem 0.75rem', borderBottom: '1px solid #eee' };
