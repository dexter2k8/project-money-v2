"use client";
import { Suspense, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { cx } from "class-variance-authority";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Tooltip } from "react-tooltip";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  CONTAINER,
  CONTENT,
  FORM,
  PANEL_BASE,
  signIn,
  signUp,
  toggleContainer,
  togglePanel,
} from "./constants";
import { PostUser, SignIn } from "./services/fetchers/auth";
import { signInSchema, signUpSchema } from "./validations/auth";
import type { TPostUserArgs } from "./api/auth/post-user/types";
import type { TSignInArgs } from "./api/auth/sign-in/types";

function AuthPageContent() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const signUpForm = useForm<TPostUserArgs>({
    resolver: yupResolver(signUpSchema),
  });
  const signInForm = useForm<TSignInArgs>({
    resolver: yupResolver(signInSchema),
  });

  const handleSignUp = async (data: TPostUserArgs) => {
    setLoading(true);
    const result = await PostUser(data);
    if (result) setIsSignIn(true);
    setLoading(false);
  };

  const handleSignIn = async (data: TSignInArgs) => {
    setLoading(true);
    const result = await SignIn(data);
    if (result) router.replace(returnTo ? decodeURIComponent(returnTo) : "/dashboard");
    setLoading(false);
  };

  return (
    <main className={CONTAINER}>
      <div className={CONTENT}>
        <section className={signUp({ isSignIn })}>
          <form
            className={cx(FORM, "pointer-events-none")}
            onSubmit={signUpForm.handleSubmit(handleSignUp)}
          >
            <h1>Create Account</h1>
            <Input.Controlled label="Name" name="displayName" control={signUpForm.control} />
            <Input.Controlled
              type="email"
              label="Email"
              name="email"
              control={signUpForm.control}
            />
            <Input.Controlled
              type="password"
              label="Password"
              name="password"
              control={signUpForm.control}
            />
            <Input.Controlled
              type="password"
              label="Confirm Password"
              name="confirmPassword"
              control={signUpForm.control}
            />
            <Input.Controlled label="Avatar URL" name="photoURL" control={signUpForm.control} />

            <small className="text-red-400">
              <em>Sign Up is not available on this demo</em>
            </small>

            <Button className="px-10" variant="primary" type="submit" loading={loading}>
              SIGN UP
            </Button>
          </form>
        </section>

        <section className={signIn({ isSignIn })}>
          <form className={FORM} onSubmit={signInForm.handleSubmit(handleSignIn)}>
            <h1>Sign In</h1>
            <Input.Controlled
              type="email"
              label="Email"
              name="email"
              control={signInForm.control}
            />
            <Input.Controlled
              type="password"
              label="Password"
              name="password"
              control={signInForm.control}
            />

            <small
              className="text-green-400 cursor-default"
              data-tooltip-id="demo-tooltip"
              data-tooltip-content="For demo: email:user@mail.com password:123456"
            >
              <em>Hover over here to see demo credentials</em>
            </small>
            <Tooltip place="bottom" id="demo-tooltip" style={{ maxWidth: "12rem" }} />

            <Button className="px-10" variant="primary" type="submit" loading={loading}>
              SIGN IN
            </Button>
          </form>
        </section>

        <section className={toggleContainer({ isSignIn })}>
          <div className={togglePanel({ isSignIn })}>
            <div className={PANEL_BASE}>
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <div>
                <p>Already have an account?</p>
                <Button size="lg" variant="link-reverse" onClick={() => setIsSignIn(true)}>
                  Go to Sign In
                </Button>
              </div>
            </div>

            <div className={cx("right-0", PANEL_BASE)}>
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <div>
                <p>Don&apos;t have an account?</p>
                <Button size="lg" variant="link-reverse" onClick={() => setIsSignIn(false)}>
                  Go to Sign Up
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  );
}
