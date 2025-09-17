const express = require('express');
const router = express.Router();

// TODO: Implement AI routes
router.get('/recommendations', (req, res) => {
  res.json({ message: 'AI routes coming soon' });
});

module.exports = router;