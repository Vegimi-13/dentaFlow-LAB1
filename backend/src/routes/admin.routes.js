import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import protect from "../middlewares/auth.middleware.js";
import allow from "../middlewares/role.middleware.js";

const router = Router();

// 🔒 all admin routes require login
router.use(protect);

// 👑 ADMIN ONLY routes

// get all users
router.get(
  "/users",
  allow("ADMIN"),
  adminController.getAllUsers
);

// create user (doctor / patient / admin)
router.post(
  "/users",
  allow("ADMIN"),
  adminController.createUser
);

// update user
router.put(
  "/users/:id",
  allow("ADMIN"),
  adminController.updateUser
);

// delete user
router.delete(
  "/users/:id",
  allow("ADMIN"),
  adminController.deleteUser
);
router.patch(
  "/users/:id/reset-password",
  allow("ADMIN"),
  adminController.resetUserPassword
);

export default router;