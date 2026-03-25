import express from 'express';
import notionService from '../services/notionService.js';

const router = express.Router();

// Check Notion API configuration status
router.get('/status', async (req, res) => {
  try {
    const result = await notionService.checkStatus();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      configured: false,
      error: 'Failed to reach Notion',
      details: String(error),
    });
  }
});

// Search Notion workspace for pages and databases
router.post('/search', async (req, res) => {
  try {
    const result = await notionService.search(req.body);
    res.status(result.status || 200).json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Search failed',
      details: String(error),
    });
  }
});

// Get a specific Notion page
router.get('/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notionService.getPage(id);
    res.status(result.status || 200).json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Page fetch failed',
      details: String(error),
    });
  }
});

// Get children blocks of a Notion page
router.get('/blocks/:id/children', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notionService.getPageBlocks(id);
    res.status(result.status || 200).json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Blocks fetch failed',
      details: String(error),
    });
  }
});

export default router;
