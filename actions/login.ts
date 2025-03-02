"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas/index";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { AuthError } from "next-auth";
import { generateVerificationToken } from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  console.log("login action, data is: ", values);
  const validatedFields = LoginSchema.safeParse(values);

  // it's said that the following is wrong, since safeParse always return object
  // to be tested
  // if (!validatedFields) this will bring type warning from TypeScript
  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    return { success: "Confirmation email first" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    // if no this code, it's said redirecting not work????
    throw error;
  }
};
