const express = require('express');
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Verify project ownership middleware
const verifyProjectOwnership = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.user.id]
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

// Get all notes for a project
router.get('/project/:projectId', verifyProjectOwnership, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE project_id = $1 ORDER BY updated_at DESC',
      [req.params.projectId]
    );

    res.json({ notes: result.rows });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, p.user_id 
       FROM notes n
       JOIN projects p ON n.project_id = p.id
       WHERE n.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ note: result.rows[0] });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create new note
router.post('/project/:projectId', verifyProjectOwnership, async (req, res) => {
  try {
    const { title = 'Untitled Note', content = '' } = req.body;

    const result = await pool.query(
      `INSERT INTO notes (project_id, title, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [req.params.projectId, title, content]
    );

    // Update project timestamp
    await pool.query(
      'UPDATE projects SET updated_at = NOW() WHERE id = $1',
      [req.params.projectId]
    );

    res.json({ note: result.rows[0] });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;

    // Verify ownership
    const checkResult = await pool.query(
      `SELECT n.id, p.user_id 
       FROM notes n
       JOIN projects p ON n.project_id = p.id
       WHERE n.id = $1`,
      [req.params.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (checkResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update note
    const result = await pool.query(
      `UPDATE notes 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [title, content, req.params.id]
    );

    res.json({ note: result.rows[0] });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM notes 
       WHERE id = $1 
       AND project_id IN (SELECT id FROM projects WHERE user_id = $2)
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;