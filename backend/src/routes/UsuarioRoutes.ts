import { Router } from 'express';
import UsuarioController from '../controllers/UsuarioController';
const router = Router();

router.get('/', UsuarioController.allUsuario);
router.post('/create', UsuarioController.createUsuario);
router.post('/login', UsuarioController.login);
router.post('/update/:id', UsuarioController.updateUsuario);
router.get('/:id', UsuarioController.getUsuarioById);
router.delete('/remove/:id', UsuarioController.deleteUsuario);

export default router;