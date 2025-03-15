"use client";

import { NewVerificationForm } from "@/components/auth/new-verification-form";
import { useSearchParams } from "next/navigation";

function EmailVerify() {
  const searchParasm = useSearchParams();
  const token = searchParasm.get("token");
  console.log(token);
  return (
    <div>
      <NewVerificationForm />
    </div>
  );
}

export default EmailVerify;
