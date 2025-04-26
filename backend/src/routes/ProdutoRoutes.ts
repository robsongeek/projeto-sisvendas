import { Router } from 'express';
import ProdutoController from '../controllers/ProdutoController';
const router = Router();

router.get('/', ProdutoController.allProduto);
router.post('/create', ProdutoController.createProduto);
router.post('/update/:id', ProdutoController.updateProduto);
router.get('/:id', ProdutoController.getProdutoById);
router.delete('/remove/:id', ProdutoController.deleteProduto);
export default router;