"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validation
  if (!name || !email || !password) {
    return { error: "Semua field harus diisi" };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter" };
  }

  if (!email.includes("@")) {
    return { error: "Email tidak valid" };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return { error: "Email sudah terdaftar" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user (no auto sign-in to avoid race condition)
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[Auth] Registration error:", error);
    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }
}
