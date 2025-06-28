"use server";

import { cookies } from "next/headers";
import { validateRequest } from "../actions/auth";
import { prismaClient } from "@/lib/prismaClient";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { lucia } from "../actions/lucia";

export async function logout() {
  try {
    const { session } = await validateRequest();
    if (!session) throw new Error("Unauthorized");

    await lucia.invalidateSession(session.id);
    const sessionCookie = lucia.createBlankSessionCookie();

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to log out. Please try again.");
  }
}

export const signup = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const existingUser = await prismaClient.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      return {
        status: 400,
        message: "This email is already in use. Kindly login.",
        success: false,
      };
    }

    const userId = generateIdFromEntropySize(10);
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    await prismaClient.user.create({
      data: {
        id: userId,
        username,
        email,
        password: passwordHash,
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return {
      status: 201,
      message: "Account created successfully.",
      success: true,
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      status: 500,
      message: "An error occurred while creating account. Please try again.",
      success: false,
    };
  }
};

export const login = async (email: string, password: string) => {
  try {
    const user = await prismaClient.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return {
        status: 404,
        message: "User not found",
        success: false,
      };
    }

    if (!user.password) {
      return {
        status: 400,
        message: "Account linked with external provider. Use Google login.",
        success: false,
      };
    }

    const isValid = await verify(user.password, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!isValid) {
      return {
        status: 401,
        message: "Incorrect password.",
        success: false,
      };
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return {
      status: 200,
      message: "User logged in successfully.",
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Login error:", error);

    return {
      status: 500,
      message: "An error occurred while logging in. Please try again.",
      success: false,
    };
  }
};
