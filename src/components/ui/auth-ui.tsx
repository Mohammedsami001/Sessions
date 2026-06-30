"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import { VideoBackground } from "./video-background";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id} className="text-xs font-semibold text-gray-700">{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

function SocialAuth() {
  const [error, setError] = useState("");
  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) setError(error.message);
    } catch (err: any) {
      setError(err.message || `Failed to initialize ${provider} login.`);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm rounded-md p-3 text-center">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-3 mt-2">
        <Button variant="outline" type="button" className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl h-12 font-semibold shadow-sm cursor-pointer" onClick={() => handleOAuthLogin('google')}>
          <svg className="mr-2 h-4 w-4 text-rose-500" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Continue with Google
        </Button>
        <Button variant="outline" type="button" className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl h-12 font-semibold shadow-sm cursor-pointer" onClick={() => handleOAuthLogin('github')}>
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
            <path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
          </svg>
          Continue with GitHub
        </Button>
      </div>
    </>
  );
}

function SignInForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-6 w-full max-w-[360px] mx-auto">
      <div className="flex flex-col items-center gap-2 text-center mb-2">
        <div className="flex items-center gap-2 mb-6 text-black">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hexagon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <span className="font-semibold text-lg tracking-tight">Sessions</span>
        </div>
        
        <h1 className="text-4xl font-serif tracking-tight text-black">Welcome Back</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your email and password to access your account</p>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm rounded-md p-3 text-center">
          {error}
        </div>
      )}

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Email</Label>
          <Input id="email" name="email" type="email" placeholder="Enter your email" required autoComplete="email" className="bg-gray-50/50 border border-gray-100 rounded-xl shadow-none text-black placeholder:text-gray-400" />
        </div>
        
        <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="Enter your password" className="bg-gray-50/50 border border-gray-100 rounded-xl shadow-none text-black placeholder:text-gray-400" />
        
        <div className="flex items-center justify-between text-xs mt-[-4px]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="remember" name="remember" className="rounded border-gray-300 text-black focus:ring-black accent-black w-3.5 h-3.5" />
            <span className="text-gray-600 font-medium">Remember me</span>
          </label>
          <a href="#" className="font-semibold text-black hover:underline">Forgot Password</a>
        </div>

        <Button type="submit" className="mt-2 bg-black text-white rounded-xl h-12 hover:bg-black/90 font-medium text-sm transition-all cursor-pointer" disabled={loading}>
          {loading ? "Authenticating..." : "Sign In"}
        </Button>
        
        <SocialAuth />
      </div>
    </form>
  );
}

function SignUpForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        }
      });

      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-6 w-full max-w-[360px] mx-auto">
      <div className="flex flex-col items-center gap-2 text-center mb-2">
        <div className="flex items-center gap-2 mb-6 text-black">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hexagon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <span className="font-semibold text-lg tracking-tight">Sessions</span>
        </div>

        <h1 className="text-4xl font-serif tracking-tight text-black">Create an account</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your details below to sign up</p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm rounded-md p-3 text-center">
          {error}
        </div>
      )}

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-xs font-semibold text-gray-700">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" className="bg-gray-50/50 border border-gray-100 rounded-xl shadow-none text-black placeholder:text-gray-400" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Email</Label>
          <Input id="email" name="email" type="email" placeholder="Enter your email" required autoComplete="email" className="bg-gray-50/50 border border-gray-100 rounded-xl shadow-none text-black placeholder:text-gray-400" />
        </div>
        
        <PasswordInput name="password" label="Password" required autoComplete="new-password" placeholder="Enter your password" className="bg-gray-50/50 border border-gray-100 rounded-xl shadow-none text-black placeholder:text-gray-400"/>
        
        <Button type="submit" className="mt-2 bg-black text-white rounded-xl h-12 hover:bg-black/90 font-medium text-sm transition-all cursor-pointer" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
        
        <SocialAuth />
      </div>
    </form>
  );
}

function AuthFormContainer({ isSignIn, onToggle }: { isSignIn: boolean; onToggle: () => void; }) {
    return (
        <div className="mx-auto flex flex-col w-full px-4 gap-2">
            {isSignIn ? <SignInForm /> : <SignUpForm />}
            <div className="text-center text-xs mt-8 font-medium text-gray-600">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <button type="button" className="font-bold text-black hover:underline" onClick={onToggle}>
                    {isSignIn ? "Sign Up" : "Sign In"}
                </button>
            </div>
        </div>
    )
}

interface AuthContentProps {
    image?: {
        src: string;
        alt: string;
    };
    quote?: {
        text: string;
        author: string;
    }
}

interface AuthUIProps {
    signInContent?: AuthContentProps;
    signUpContent?: AuthContentProps;
    initialIsSignIn?: boolean;
}

export function AuthUI({ initialIsSignIn = true }: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(initialIsSignIn);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  useEffect(() => {
    setIsSignIn(initialIsSignIn);
  }, [initialIsSignIn]);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden">
      <VideoBackground />
      <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-xl" />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
        
        .font-serif {
          font-family: 'Playfair Display', ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
        }
      `}</style>
      
      <a href="/" className="absolute top-6 left-6 sm:top-10 sm:left-10 z-50 text-white/70 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Home
      </a>
      
      <div className="w-full max-w-[1200px] bg-white rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative min-h-[750px] z-10">
        {/* Left Panel (Image & Quotes) */}
        <div className="hidden md:flex md:w-[45%] relative m-3 rounded-[1.5rem] overflow-hidden bg-black flex-col justify-between p-10">
          <div className="absolute inset-0 z-0">
             <img src="/fluid-bg.png" alt="Fluid abstract background" className="w-full h-full object-cover opacity-90" />
          </div>
          
          <div className="relative z-10 flex items-center gap-4 text-white text-[10px] tracking-[0.2em] font-semibold uppercase">
             DISTRACTION-FREE STUDY <div className="h-[1px] w-12 bg-white/50"></div>
          </div>

          <div className="relative z-10 text-white mt-auto pb-4">
             <h2 className="text-[3.5rem] font-serif leading-[1.1] tracking-tight mb-6">
                Enter<br/>Deep<br/>Focus
             </h2>
             <p className="text-xs font-light text-white/80 max-w-[280px] leading-relaxed">
                Connect with peers in authoritative, synchronized rooms engineered to induce absolute flow.
             </p>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div className="w-full md:w-[55%] flex items-center justify-center p-6 sm:p-12 bg-white rounded-r-[2rem]">
          <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} />
        </div>
      </div>
    </div>
  );
}
