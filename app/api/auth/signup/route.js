import { NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash password (basic hash for prototype)
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    const newUser = createUser({ name, email, passwordHash });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session_id", newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Don't send password hash back
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
