import { pool } from "../config/db";
import { User } from "../models/types";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export const getAllUsers = async (): Promise<User[]> => {
  const [rows] = await pool.query(
    "SELECT id, email, first_name, last_name, role, created_at FROM users",
  );
  return rows as User[];
};

export const getUserById = async (id: string): Promise<User | null> => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  const users = rows as User[];
  return users.length > 0 ? users[0] : null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  const users = rows as User[];
  return users.length > 0 ? users[0] : null;
};

export const createUser = async (
  data: Omit<User, "id" | "created_at">,
): Promise<string> => {
  const id = uuidv4();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password_hash, salt);

  await pool.query(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.email,
      hashedPassword,
      data.first_name,
      data.last_name,
      data.role,
    ],
  );
  return id;
};

export const updateUser = async (
  id: string,
  data: Partial<User>,
): Promise<void> => {
  const updateData: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && key !== "id" && key !== "created_at") {
      if (key === "password_hash" && typeof value === "string") {
        const isAlreadyHashed =
          value.startsWith("$2a$") || value.startsWith("$2b$");
        if (!isAlreadyHashed) {
          const salt = await bcrypt.genSalt(10);
          updateData[key] = await bcrypt.hash(value, salt);
        }
      } else {
        updateData[key] = value;
      }
    }
  }

  if (Object.keys(updateData).length === 0) return;

  const fields = Object.keys(updateData)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(updateData);
  values.push(id);

  await pool.query(`UPDATE users SET ${fields} WHERE id = ?`, values);
};

export const deleteUser = async (id: string): Promise<void> => {
  await pool.query("DELETE FROM users WHERE id = ?", [id]);
};
