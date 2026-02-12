import { Router } from "express";
import { sendOtp } from "../controller/userController";

const router = Router()
router.post("/sendOtp", sendOtp)

export default router