import { getVerificationTokenByEmail } from "@/data/verification-token";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  // expire in one hour
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  // check if we have token already
  const existingToken = await getVerificationTokenByEmail(email);
  // if token exists, then delete it
  if (existingToken) {
    await db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }
  const verificationToken = await db.verificationToken.create({
    data: { email, token, expires },
  });
  return verificationToken;
};
