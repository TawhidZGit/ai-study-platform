const express = require('express');
const pool = require('../config/db');
const upload = require('../config/upload');
const authenticateToken = require('../middleware/auth');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const { deleteUploadedFile } = require('../utils/fileCleanup');

const router = express.Router();
router.use(authenticateToken);

// Verify project ownership middleware
const verifyProjectOwnership = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.projectId || req.body.projectId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    req.project = result.rows[0];
    next();
  } catch (error) {
    console.error('Project verification error:', error);
    res.status(500).json({ error: 'Failed to verify project ownership' });
  }
};

// Get all sources for a project
router.get('/project/:projectId', verifyProjectOwnership, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, filename, file_type, word_count, uploaded_at FROM sources WHERE project_id = $1 ORDER BY uploaded_at DESC',
      [req.params.projectId]
    );

    res.json({ sources: result.rows });
  } catch (error) {
    console.error('Get sources error:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

// Get single source with content
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, p.user_id 
       FROM sources s
       JOIN projects p ON s.project_id = p.id
       WHERE s.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Source not found' });
    }

    if (result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ source: result.rows[0] });
  } catch (error) {
    console.error('Get source error:', error);
    res.status(500).json({ error: 'Failed to fetch source' });
  }
});

// Upload source
router.post('/upload/:projectId', verifyProjectOwnership, upload.single('file'), async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, path: filepath } = req.file;
    uploadedFilePath = filepath;
    
    let content = '';
    let fileType = 'txt';

    // Extract text based on file type
    if (originalname.endsWith('.pdf')) {
      fileType = 'pdf';
      const dataBuffer = await fs.readFile(filepath);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
    } else if (originalname.endsWith('.txt')) {
      fileType = 'txt';
      content = await fs.readFile(filepath, 'utf-8');
    }

    if (!content || content.trim().length === 0) {
      // Clean up the uploaded file
      if (uploadedFilePath) {
        await fs.unlink(uploadedFilePath).catch(console.error);
      }
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

    // Save to database
    const result = await pool.query(
      `INSERT INTO sources (project_id, filename, file_type, content, word_count) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, filename, file_type, word_count, uploaded_at`,
      [req.params.projectId, originalname, fileType, content, wordCount]
    );

    // Update project timestamp
    await pool.query(
      'UPDATE projects SET updated_at = NOW() WHERE id = $1',
      [req.params.projectId]
    );

    res.json({ source: result.rows[0] });
  } catch (error) {
    // Clean up uploaded file on error
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(console.error);
    }
    
    console.error('Upload source error:', error);
    res.status(500).json({ error: 'Failed to upload source' });
  }
});

// Delete source
router.delete('/:id', async (req, res) => {
  try {
    // Get the source info before deleting
    const sourceResult = await pool.query(
      `SELECT s.filename, s.project_id, p.user_id 
       FROM sources s
       JOIN projects p ON s.project_id = p.id
       WHERE s.id = $1`,
      [req.params.id]
    );

    if (sourceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Source not found' });
    }

    const source = sourceResult.rows[0];

    if (source.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete from database
    await pool.query('DELETE FROM sources WHERE id = $1', [req.params.id]);

    // Try to delete the physical file
    await deleteUploadedFile(source.filename);

    res.json({ message: 'Source deleted successfully' });
  } catch (error) {
    console.error('Delete source error:', error);
    res.status(500).json({ error: 'Failed to delete source' });
  }
});

module.exports = router;