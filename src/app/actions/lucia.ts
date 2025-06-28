import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prismaClient } from "@/lib/prismaClient";
import { Lucia } from "lucia";
import { SubscriptionStatus } from "@prisma/client";
const adapter = new PrismaAdapter(prismaClient.session, prismaClient.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (databaseUserAttributes) => ({
    id: databaseUserAttributes.id,
    username: databaseUserAttributes.username,
    email: databaseUserAttributes.email,
    profileImage: databaseUserAttributes.profileImage,
    createdAt: databaseUserAttributes.createdAt,
    subscriptions: databaseUserAttributes.subscriptions,
  }),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}
interface DatabaseUserAttributes {
  id: string;
  username: string;
  email: string;
  profileImage: string | null;
  createdAt: Date;
  subscriptions: SubscriptionStatus;
}
