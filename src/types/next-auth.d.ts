import type { UserRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    uuid?: string;
  }
  interface Session {
    user: {
      id: string;
      uuid: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    uuid?: string;
    id?: string;
  }
}
