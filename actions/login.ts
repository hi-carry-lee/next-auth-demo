"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas/index";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  console.log("login action, data is: ", values);
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields) {
    return { error: "Invalid fields" };
  }

  return { success: "Email sent!" };
};
