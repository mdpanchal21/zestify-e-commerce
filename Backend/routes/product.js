const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/categories', productController.getAllCategories);
// CRUDz
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Aggregation
router.get('/stats/category', productController.getCategoryStats);
router.get('/categories', productController.getAllCategories);
module.exports = router;
