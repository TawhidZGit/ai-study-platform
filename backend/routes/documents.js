const express = require('express');
const pool = require('../config/db');
const upload = require('../config/upload');
const authenticateToken = require('../middleware/auth');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const aiService = require('../services/aiService');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, filename, path: filepath } = req.file;
    let content = '';

    // Extract text based on file type
    if (originalname.endsWith('.pdf')) {
      const dataBuffer = await fs.readFile(filepath);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
    } else if (originalname.endsWith('.txt')) {
      content = await fs.readFile(filepath, 'utf-8');
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    // Save to database
    const result = await pool.query(
      'INSERT INTO documents (user_id, filename, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, originalname, content]
    );

    res.json({
      message: 'Document uploaded successfully',
      document: {
        id: result.rows[0].id,
        filename: result.rows[0].filename,
        uploadDate: result.rows[0].upload_date
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get all user documents
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, filename, upload_date FROM documents WHERE user_id = $1 ORDER BY upload_date DESC',
      [req.user.id]
    );

    res.json({ documents: result.rows });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get single document
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document: result.rows[0] });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Generate summary/notes for document
router.post('/:id/summary', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT content FROM documents WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const summary = await aiService.generateSummary(result.rows[0].content);
    res.json({ summary });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;