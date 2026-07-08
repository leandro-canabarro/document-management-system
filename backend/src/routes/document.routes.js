const path = require('path');
const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/document.controller');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../storage'),
  filename: (_req, file, cb) => {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniquePrefix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;
