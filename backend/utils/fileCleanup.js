const fs = require('fs').promises;
const path = require('path');

/**
 * Delete a file from the uploads directory
 * @param {string} filename - Name of the file to delete
 * @returns {Promise<boolean>} - True if deleted, false if file didn't exist
 */
async function deleteUploadedFile(filename) {
  if (!filename) return false;
  
  try {
    const filepath = path.join(__dirname, '../uploads', filename);
    await fs.access(filepath); // Check if file exists
    await fs.unlink(filepath);
    console.log(`✓ Deleted file: ${filename}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`File not found (already deleted?): ${filename}`);
      return false;
    }
    console.error(`Error deleting file ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Clean up orphaned files in uploads directory
 * Call this periodically or on server startup
 */
async function cleanupOrphanedFiles(pool) {
  try {
    // Get all filenames from database
    const result = await pool.query(
      'SELECT DISTINCT filename FROM sources'
    );
    const dbFilenames = new Set(result.rows.map(row => row.filename));

    // Get all files in uploads directory
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = await fs.readdir(uploadsDir);

    let deletedCount = 0;
    for (const file of files) {
      // Skip .gitkeep or other system files
      if (file.startsWith('.')) continue;
      
      if (!dbFilenames.has(file)) {
        await deleteUploadedFile(file);
        deletedCount++;
      }
    }

    console.log(`Cleanup complete: ${deletedCount} orphaned files deleted`);
    return deletedCount;
  } catch (error) {
    console.error('Error during orphaned file cleanup:', error);
    throw error;
  }
}

module.exports = {
  deleteUploadedFile,
  cleanupOrphanedFiles
};