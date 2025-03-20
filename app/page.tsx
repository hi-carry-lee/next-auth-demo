import { Button } from "@/components/ui/button";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import LoginButton from "@/components/auth/login-button";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-700 ">
      <div className="space-y-6 text-center">
        <h1
          className={cn(
            "text-5xl font-semibold text-white drop-shadow-md",
            font.className
          )}
        >
          🔐 Auth
        </h1>
        <p className="text-white text-lg">A simple authentication services</p>
        <div>
          <LoginButton>
            <Button
              size="lg"
              variant="secondary"
              className="text-xl px-10 py-8 font-semibold"
            >
              Getting Started
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}

/*
1️⃣ what is cn()

2️⃣ 

*/
