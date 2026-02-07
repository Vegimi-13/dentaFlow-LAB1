import { Router } from "express";

import authController from "../controllers/auth.controller.js";
import protect from "../middlewares/auth.middleware.js";
import allow from "../middlewares/role.middleware.js";

const router = Router();

// 🔓 Public auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// 🔒 Authenticated user info
router.get("/me", protect, (req, res) => {
  res.json({
    message: "Authenticated user",
    user: req.user,
  });
});

// 🔒 User profile management
router.get("/profile", protect, authController.getMyProfile);
router.put("/profile", protect, authController.updateMyProfile);

// 🎭 Role-based test routes

// ADMIN only
router.get("/admin-test", protect, allow("ADMIN"), (req, res) => {
  res.json({ message: "Welcome Admin 👑" });
});

// DOCTOR + ADMIN
router.get("/doctor-test", protect, allow("DOCTOR", "ADMIN"), (req, res) => {
  res.json({ message: "Welcome Doctor 🦷" });
});

// PATIENT only
router.get("/patient-test", protect, allow("PATIENT"), (req, res) => {
  res.json({ message: "Welcome Patient 😊" });
});

export default router;
