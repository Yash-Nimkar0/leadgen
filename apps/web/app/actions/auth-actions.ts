"use server";

import { prisma } from "@repo/database";
import bcrypt from "bcrypt";

export async function registerUser(email: string, passwordPlain: string) {
  try {
    if (!email || !passwordPlain) {
      return { error: "Email and password are required" };
    }

    if (passwordPlain.length < 8) {
      return { error: "Password must be at least 8 characters long" };
    }

    const emailLower = email.toLowerCase();
    
    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (existing) {
      return { error: "An account with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    await prisma.user.create({
      data: {
        email: emailLower,
        password: hashedPassword,
        preferences: {
          create: {
            minimumIntentScore: 60,
            notificationFrequency: "REALTIME"
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}
