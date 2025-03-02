import { db } from "@/lib/db";

export const getVerificationTokenByToken = async (token: string) => {
  try {
    // 使用findUnique，where上会提示类型问题
    const verificationToken = await db.verificationToken.findFirst({
      where: { token },
    });

    return verificationToken;
  } catch {
    return null;
  }
};
export const getVerificationTokenByEmail = async (email: string) => {
  try {
    // 使用findUnique，where上会提示类型问题
    const verificationToken = await db.verificationToken.findFirst({
      where: { email },
    });

    return verificationToken;
  } catch {
    return null;
  }
};
