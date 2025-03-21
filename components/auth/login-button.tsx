"use client";

// 🔥 be carefull, not from next/router
import { useRouter } from "next/navigation";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
}

function LoginButton({
  children,
  mode = "redirect",
  asChild,
}: LoginButtonProps) {
  const router = useRouter();

  const onClick = () => {
    console.log("LOGIN BUTTON CLICKED");
    router.push("/auth/login");
  };

  if (mode === "modal") {
    return <div>TODO: Implement modal</div>;
  }

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
}

export default LoginButton;
