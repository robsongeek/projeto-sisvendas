import { Router } from "express";
import FornecedorController from "../controllers/FornecedorController";
const router = Router();

router.get("/", FornecedorController.allFornecedor);
router.post("/create", FornecedorController.createFornecedor);
router.post("/update/:id", FornecedorController.updateFornecedor);
router.get("/:id", FornecedorController.getFornecedorById);
router.delete("/remove/:id", FornecedorController.deleteFornecedor);

export default router;
