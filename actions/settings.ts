"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

// currently, the version of Authjs is V5 beta.25
// so the method 'unstable_update' may been changed to another name in the future
import { unstable_update as update } from "@/auth";
import { db } from "@/lib/db";
import { SettingsSchema } from "@/schemas";
import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  // 1. validate authentication
  const user = await currentUser();
  console.log("settings action, user: ", user);
  if (!user) {
    return { error: "Unauthorized" };
  }

  // 2. validate if user exists in DB
  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return { error: "Unauthorized" };
  }

  // 3. OAuth user can't update these fields
  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  // 4. in this case, user update their email, so it need to be confirmed.
  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);
    if (existingUser && existingUser.id !== user.id) {
      return { error: "Email already in use!" };
    }

    // if user want to change email, it need to confirm the new email first
    const verificationToken = await generateVerificationToken(values.email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { success: "Verification email sent!" };
  }

  // 5. hash password
  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(
      values.password,
      dbUser.password
    );

    if (!passwordsMatch) {
      return { error: "Incorrect password!" };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  // used for filter out empty values
  const updateData = { ...values };
  if (updateData.password === "") delete updateData.password;
  if (updateData.newPassword === "") delete updateData.newPassword;

  // 6. update user
  const updatedUser = await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...updateData,
    },
  });

  // this is a callback from Authjs，it will update the session data,
  // so, if you update some user info, you will find the change immediately on the page;
  // this is an alternation of update in settings page;
  update({
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      role: updatedUser.role,
    },
  });

  return { success: "Settings Updated!" };
};
