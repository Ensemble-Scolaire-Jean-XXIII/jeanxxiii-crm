import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as userService from "../services/userService";
import * as settingService from "../services/settingService";
import { authenticate } from "../middleware/auth";
import { sendMail } from "../services/mailService";
import { emailRegex, passwordRegex } from "../utils/validators";
import { FRONTEND_URL } from "../config/appConfig";

const router = Router();

router.get("/", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }
    if (!passwordRegex.test(req.body.password_hash)) {
      return res.status(400).json({
        error: "Mot de passe trop faible",
      });
    }

    const existingUser = await userService.getUserByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    const id = await userService.createUser(req.body, req.user.id);

    await sendMail(
      req.body.email,
      "Création de votre compte CRM Jean XXIII",
      `Votre compte a été créé. Accédez au CRM ici : ${FRONTEND_URL}. Votre identifiant est ${req.body.email} et votre mot de passe : ${req.body.password_hash}`,
      `<div style="font-family: sans-serif; color: #333; line-height: 1.4;">Bonjour <strong>${req.body.first_name} ${req.body.last_name}</strong>,<br><br>Un administrateur vient de vous créer un compte sur le CRM Jean XXIII.<br>Vous pouvez vous connecter dès maintenant en cliquant sur ce lien : <a href="${FRONTEND_URL}">Accéder au CRM</a>.<br><br>Voici vos identifiants de connexion :<ul style="margin-top: 5px;"><li><strong>Email :</strong> ${req.body.email}</li><li><strong>Mot de passe temporaire :</strong> ${req.body.password_hash}</li></ul></div>`,
    );

    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.body.email);
    if (!user) {
      return res.status(404).json({ error: "Email introuvable" });
    }

    const isMatch = await bcrypt.compare(
      req.body.password_hash,
      user.password_hash,
    );
    if (!isMatch) {
      return res.status(401).json({ error: "Mot de passe invalide" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" },
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/reauthenticate", authenticate, async (req: any, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "6h" },
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/me", authenticate, async (req: any, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/me", authenticate, async (req: any, res) => {
  try {
    const { first_name, last_name, email, password_hash, old_password } =
      req.body;
    const currentUser = await userService.getUserById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ error: "Not found" });
    }

    if (email) {
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Format d'email invalide" });
      }
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ error: "Email déjà utilisé" });
      }
    }

    if (password_hash) {
      if (!old_password) {
        return res
          .status(400)
          .json({ error: "L'ancien mot de passe est requis" });
      }
      const isOldMatch = await bcrypt.compare(
        old_password,
        currentUser.password_hash,
      );
      if (!isOldMatch) {
        return res.status(400).json({ error: "Ancien mot de passe incorrect" });
      }

      if (!passwordRegex.test(password_hash)) {
        return res.status(400).json({ error: "Mot de passe trop faible" });
      }
      const isSame = await bcrypt.compare(
        password_hash,
        currentUser.password_hash,
      );
      if (isSame) {
        return res.status(400).json({
          error: "Le nouveau mot de passe doit être différent de l'ancien",
        });
      }
    }

    const updateData: any = { first_name, last_name, email };
    if (password_hash) updateData.password_hash = password_hash;

    await userService.updateUser(req.user.id, updateData, req.user.id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (req.body.email && !emailRegex.test(req.body.email)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }

    if (req.body.password_hash) {
      if (!passwordRegex.test(req.body.password_hash)) {
        return res.status(400).json({ error: "Mot de passe trop faible" });
      }
    }

    if (req.body.email) {
      const existingUser = await userService.getUserByEmail(req.body.email);
      if (existingUser && existingUser.id !== req.params.id) {
        return res.status(400).json({ error: "Email déjà utilisé" });
      }
    }

    await userService.updateUser(req.params.id, req.body, req.user.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    await userService.deleteUser(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const isEnabled = await settingService.getSetting("password_reset_enabled");
    if (isEnabled !== "true")
      return res.status(403).json({ error: "Fonctionnalité désactivée" });

    const user = await userService.getUserByEmail(req.body.email);
    if (!user) {
      return res
        .status(200)
        .json({ message: "Si l'email existe, un lien a été envoyé." });
    }

    const token = await userService.createResetToken(user.id);
    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

    await sendMail(
      user.email,
      "Réinitialisation de votre mot de passe",
      `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`,
      `<p>Bonjour,</p><p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p><a href="${resetLink}">Cliquez ici pour choisir un nouveau mot de passe</a></p><p>Ce lien expirera dans 1 heure.</p>`,
    );

    res
      .status(200)
      .json({ message: "Si l'email existe, un lien a été envoyé." });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password_hash } = req.body;

    if (!passwordRegex.test(password_hash)) {
      return res.status(400).json({ error: "Mot de passe trop faible" });
    }

    const userId = await userService.validateResetToken(token);
    if (!userId) {
      return res.status(400).json({ error: "Lien invalide ou expiré" });
    }

    const user = await userService.getUserById(userId);
    if (user) {
      const isSame = await bcrypt.compare(password_hash, user.password_hash);
      if (isSame) {
        return res.status(400).json({
          error: "Le nouveau mot de passe doit être différent de l'ancien",
        });
      }
    }

    await userService.resetPassword(userId, password_hash);
    res.status(200).json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
