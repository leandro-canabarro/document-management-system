const documentRepository = require('../repositories/document.repository');

function uploadDocument(file) {
  if (!file) {
    const err = new Error('Nenhum arquivo enviado.');
    err.status = 400;
    throw err;
  }

  return documentRepository.save({
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
  });
}

function listDocuments() {
  return documentRepository.findAll();
}

function getDocumentById(id) {
  const doc = documentRepository.findById(id);
  if (!doc) {
    const err = new Error('Documento não encontrado.');
    err.status = 404;
    throw err;
  }
  return doc;
}

module.exports = { uploadDocument, listDocuments, getDocumentById };
