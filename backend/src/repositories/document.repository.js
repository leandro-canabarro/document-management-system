const crypto = require('crypto');

// Metadados mantidos em memória nesta fase inicial.
const documents = [];

function save({ originalName, filename, size, mimetype }) {
  const doc = {
    id: crypto.randomUUID(),
    originalName,
    filename,
    size,
    mimetype,
    uploadedAt: new Date().toISOString(),
  };
  documents.push(doc);
  return doc;
}

function findAll() {
  return [...documents];
}

function findById(id) {
  return documents.find((doc) => doc.id === id) || null;
}

module.exports = { save, findAll, findById };
