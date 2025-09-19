const express = require('express');
const router = express.Router();

// TODO: Implement destination routes
router.get('/', (req, res) => {
  res.json({ message: 'Destination routes coming soon' });
});

module.exports = router;