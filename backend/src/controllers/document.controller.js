const path = require('path');
const documentService = require('../services/document.service');

function upload(req, res) {
  try {
    const doc = documentService.uploadDocument(req.file);
    res.status(201).json(doc);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

function list(req, res) {
  try {
    const docs = documentService.listDocuments();
    res.json(docs);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

function download(req, res) {
  try {
    const doc = documentService.getDocumentById(req.params.id);
    const filePath = path.join(__dirname, '../../storage', doc.filename);
    res.download(filePath, doc.originalName, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ error: 'Erro ao baixar o arquivo.' });
      }
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { upload, list, download };
