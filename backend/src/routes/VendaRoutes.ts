import { Router } from 'express';
import VendaController from '../controllers/VendaController';
const router = Router();

router.get('/', VendaController.allVenda);
router.post('/create', VendaController.createVenda);
router.post('/update/:id', VendaController.updateVenda);
router.get('/:id', VendaController.getVendaById);
router.delete('/remove/:id', VendaController.deleteVenda);
export default router;