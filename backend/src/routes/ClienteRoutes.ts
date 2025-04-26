import { Router } from "express";
import  ClienteController  from "../controllers/ClienteController";
const router = Router();

router.get("/", ClienteController.allCliente);
router.post("/create", ClienteController.createCliente);
router.post("/update/:id", ClienteController.updateCliente);
router.get("/:id", ClienteController.getClienteById);
router.delete("/remove/:id", ClienteController.deleteCliente);

export default router;