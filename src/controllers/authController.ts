import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as authService from "../services/authService.js";

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register({ email, password, name });
    res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    res.status(400).json({ error: message });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    res.status(401).json({ error: message });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await authService.getUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json({ user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch user";
    res.status(400).json({ error: message });
  }
}
