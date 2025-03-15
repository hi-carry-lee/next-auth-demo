"use server";

import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";

// the whole process invole four steps
export const newVerification = async (token: string) => {
  // verify token
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }
  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  // verify user
  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  // update user
  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      // update email is not required, it depends on business needs,
      email: existingToken.email,
    },
  });

  // delete token
  await db.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Email verified!" };
};
