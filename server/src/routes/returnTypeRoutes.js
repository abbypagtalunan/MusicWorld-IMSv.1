const {
  getAllReturnTypes,
  addReturnType,
  updateReturnType,
  deleteReturnType,
  getOrCreateReturnTypeID, // 👈 Import here
} = require('../controllers/returnTypeController');

// Map endpoints
router.get('/', getAllReturnTypes);
router.post('/', addReturnType);
router.put('/:id', updateReturnType);
router.delete('/:id', deleteReturnType);

// Add this route 👇
router.post('/get-or-create', getOrCreateReturnTypeID);
