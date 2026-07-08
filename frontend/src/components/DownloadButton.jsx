import { getDownloadUrl } from '../services/api';

export default function DownloadButton({ id, originalName }) {
  return (
    <a href={getDownloadUrl(id)} download={originalName}>
      Baixar
    </a>
  );
}
