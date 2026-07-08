# Especificação — Document Management System

## 1. Objetivo

Prover uma aplicação web que permita a um usuário fazer upload, listar e baixar documentos, com armazenamento local no servidor via multer.

---

## 2. Escopo

### Dentro do escopo

- Upload de documentos (multipart/form-data)
- Listagem de documentos com metadados
- Download de documento por identificador
- Identificação simples do dono por campo `owner` na requisição

### Fora do escopo

- Autenticação/autorização formal (JWT, sessões)
- Armazenamento externo ou em nuvem
- Versionamento de documentos
- Exclusão de documentos
- Paginação da listagem

---

## 3. Requisitos Funcionais

| ID    | Requisito                                                                                                                                          |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um arquivo via formulário multipart; o sistema armazena o arquivo em `backend/storage/` e persiste os metadados em memória   |
| RF-02 | O usuário pode listar todos os documentos enviados, recebendo id, nome original, tamanho, data de upload e dono                                    |
| RF-03 | O usuário pode baixar um documento pelo seu identificador único; o sistema devolve o conteúdo binário do arquivo                                   |
| RF-04 | O sistema rejeita uploads sem arquivo com resposta HTTP 400                                                                                        |
| RF-05 | O sistema retorna HTTP 404 quando um documento solicitado para download não existe                                                                 |

---

## 4. Requisitos Não Funcionais

| ID     | Requisito                                                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-01 | Arquivos gravados exclusivamente no filesystem local (`backend/storage/`) via multer com `diskStorage`                                 |
| RNF-02 | Metadados mantidos em um array em memória (sem banco de dados nesta fase)                                                              |
| RNF-03 | Configuração via variáveis de ambiente: `PORT` (padrão `3000`), `STORAGE_PATH` (padrão `./storage`)                                   |
| RNF-04 | Backend: Node.js + Express 5, CommonJS; Frontend: React 19 + Vite 8, ESM                                                              |
| RNF-05 | Testes de backend com `node:test` (runner nativo do Node)                                                                              |
| RNF-06 | Comunicação frontend→backend via `fetch` com prefixo `/api` (proxy Vite)                                                              |

---

## 5. Modelo de Dados — Metadados do Documento

| Campo          | Tipo     | Descrição                                     | Exemplo                                        |
| -------------- | -------- | --------------------------------------------- | ---------------------------------------------- |
| `id`           | `string` | UUID v4 gerado no upload                      | `"a1b2c3d4-..."`                               |
| `originalName` | `string` | Nome original do arquivo enviado pelo cliente | `"relatorio-q1.pdf"`                           |
| `storedName`   | `string` | Nome do arquivo em disco (gerado pelo multer) | `"a1b2c3d4-relatorio-q1.pdf"`                  |
| `size`         | `number` | Tamanho em bytes                              | `204800`                                       |
| `mimeType`     | `string` | Tipo MIME detectado pelo multer               | `"application/pdf"`                            |
| `uploadedAt`   | `string` | Data/hora do upload em ISO 8601               | `"2026-07-08T14:30:00.000Z"`                   |
| `owner`        | `string` | Identificador do usuário dono (campo do form) | `"user-42"`                                    |

---

## 6. Contratos de API

Todos os endpoints são montados sob o prefixo raiz `/` no backend. O frontend acessa via `/api/*` (proxy Vite remove o `/api`).

### `POST /upload`

**Propósito:** Receber um arquivo e persistir seus metadados.

| Item          | Detalhe                                             |
| ------------- | --------------------------------------------------- |
| Content-Type  | `multipart/form-data`                               |
| Campo arquivo | `file` (obrigatório)                                |
| Campo owner   | `owner` — string, opcional (padrão `"anonymous"`)  |

**Resposta 201 Created:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "originalName": "relatorio-q1.pdf",
  "size": 204800,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-07-08T14:30:00.000Z",
  "owner": "user-42"
}
```

**Resposta 400 Bad Request** — nenhum arquivo enviado:

```json
{ "error": "Nenhum arquivo enviado." }
```

---

### `GET /documents`

**Propósito:** Listar todos os documentos armazenados.

**Resposta 200 OK:**

```json
[
  {
    "id": "a1b2c3d4-...",
    "originalName": "relatorio-q1.pdf",
    "size": 204800,
    "mimeType": "application/pdf",
    "uploadedAt": "2026-07-08T14:30:00.000Z",
    "owner": "user-42"
  }
]
```

> `storedName` **não é exposto** ao cliente (detalhe interno de infraestrutura).

---

### `GET /documents/:id/download`

**Propósito:** Fazer stream do arquivo para o cliente.

**Resposta 200 OK:**

- Header `Content-Disposition: attachment; filename="<originalName>"`
- Header `Content-Type: <mimeType>`
- Corpo: conteúdo binário do arquivo

**Resposta 404 Not Found:**

```json
{ "error": "Documento não encontrado." }
```

---

### `GET /health` *(já existente)*

```json
{ "status": "ok" }
```

---

## 7. Decisões Arquiteturais

| Decisão                                                                                               | Justificativa                                                                            |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Clean Architecture em 4 camadas (`routes → controllers → services → repositories`)                   | Separação de responsabilidades sem overengineering                                       |
| Metadados em memória (`documentRepository.js`)                                                        | Suficiente para esta fase; substituível por banco sem alterar as camadas superiores      |
| `uuid` para geração de IDs                                                                            | Evita colisão entre uploads; não requer banco para garantir unicidade                    |
| `multer` com `diskStorage` e `filename` customizado (prefixado com o UUID)                            | Garante nomes únicos em disco mesmo para arquivos com o mesmo nome original              |
| `STORAGE_PATH` como variável de ambiente                                                              | Segue 12-Factor; facilita testes com pasta temporária                                    |
| Prefixo `/api` no frontend com proxy Vite                                                             | Desacopla endereço do backend durante desenvolvimento sem CORS                           |
| Testes com `node:test` (sem dependência extra)                                                        | Alinhado com o `package.json` existente                                                  |

**Riscos identificados:**

| Risco                                                                                                            | Mitigação                                                                                          |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Perda de metadados ao reiniciar o servidor (dados em memória)                                                    | Documentado como limitação da fase; repositório desacoplado permite migrar para SQLite/outro BD    |
| Arquivos órfãos em disco se o processo travar após salvar o arquivo e antes de registrar o metadado              | Baixo impacto nesta fase; a atomicidade pode ser adicionada na evolução                            |
| Ausência de limitação de tipo/tamanho de arquivo                                                                 | Adicionar `fileFilter` e `limits.fileSize` no multer como melhoria imediata                        |

---

## 8. Plano de Execução

### Etapa 1 — Configuração do multer e repositório em memória

**Arquivos criados/alterados:**

- `backend/src/repositories/documentRepository.js` — CRUD em memória (array)
- `backend/src/config/multer.js` — configuração `diskStorage` com `STORAGE_PATH`

**Critérios de aceite:**

- `documentRepository` expõe `save(doc)`, `findAll()`, `findById(id)`
- Multer grava em `backend/storage/` com filename `<uuid>-<originalname>`
- `STORAGE_PATH` é lido de `process.env` com fallback

---

### Etapa 2 — Camada de serviço

**Arquivos criados/alterados:**

- `backend/src/services/documentService.js`

**Critérios de aceite:**

- `uploadDocument(file, owner)` → gera UUID, monta metadados, persiste via repositório, retorna o objeto
- `listDocuments()` → delega ao repositório, não expõe `storedName`
- `getDocumentById(id)` → retorna metadados completos (incluindo `storedName`) ou `null`

---

### Etapa 3 — Camada de controllers

**Arquivos criados/alterados:**

- `backend/src/controllers/documentController.js`

**Critérios de aceite:**

- `uploadController` valida presença do arquivo (400 se ausente), chama o serviço, responde 201
- `listController` responde 200 com array (vazio se não há documentos)
- `downloadController` busca o documento, responde 404 se não encontrado, faz `res.download()` com `originalName`

---

### Etapa 4 — Camada de rotas e integração no `app.js`

**Arquivos criados/alterados:**

- `backend/src/routes/documentRoutes.js`
- `backend/src/app.js` — registrar o roteador

**Critérios de aceite:**

- `POST /upload`, `GET /documents`, `GET /documents/:id/download` respondem corretamente
- `GET /health` continua funcionando
- Rota desconhecida retorna 404

---

### Etapa 5 — Testes de backend

**Arquivos criados/alterados:**

- `backend/test/app.test.js` — expandir com testes de integração HTTP

**Critérios de aceite:**

- Teste de upload retorna 201 com metadados corretos
- Teste de listagem retorna o documento recém-enviado
- Teste de download retorna o arquivo com headers corretos
- Teste de download com ID inexistente retorna 404
- Upload sem arquivo retorna 400
- `npm test` passa sem erros

---

### Etapa 6 — Frontend: serviço de API

**Arquivos criados/alterados:**

- `frontend/src/services/documentService.js`

**Critérios de aceite:**

- `uploadDocument(file, owner)` → `fetch POST /api/upload`
- `listDocuments()` → `fetch GET /api/documents`
- `downloadDocument(id, filename)` → `fetch GET /api/documents/:id/download` + trigger de download via `<a>`
- Erros HTTP são propagados como exceções

---

### Etapa 7 — Frontend: componentes React

**Arquivos criados/alterados:**

- `frontend/src/components/UploadForm.jsx`
- `frontend/src/components/DocumentList.jsx`
- `frontend/src/components/DownloadButton.jsx`
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/App.jsx` — substituir seed pelo roteador/página

**Critérios de aceite:**

- `UploadForm` exibe campo de arquivo + campo owner + botão; mostra feedback de sucesso/erro
- `DocumentList` exibe tabela com nome, tamanho, data e dono; recarrega após upload
- `DownloadButton` aciona o download do arquivo ao clicar
- A página completa funciona no navegador sem erros no console

---

### Resumo de dependências entre etapas

```
Etapa 1 (multer + repositório)
  └─► Etapa 2 (serviços)
        └─► Etapa 3 (controllers)
              └─► Etapa 4 (rotas + app.js)
                    └─► Etapa 5 (testes backend)
                    └─► Etapa 6 (serviço frontend)
                          └─► Etapa 7 (componentes)
```
