import { Router } from "express";
import { sendBill } from "../controller/userController";

const router = Router()
router.post("/sendBill", sendBill)

export default router