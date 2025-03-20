import { auth } from "@/auth";

/*
these two can be used in all server side: Server Component, Server Actions;
Compare to those two hooks, they can only be used in client side;
*/
export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user?.role;
};
