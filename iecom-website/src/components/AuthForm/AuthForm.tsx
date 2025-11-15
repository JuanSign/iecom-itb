"use client"

import React, { useState, useEffect, useActionState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { login, register } from "@/actions/server/auth"
import { AuthState } from "@/actions/types/Auth"

const textVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

const initialState: AuthState = { success: false };

function AnimatedTitle({ isLogin }: { isLogin: boolean }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isLogin ? "loginTitle" : "registerTitle"}
        variants={textVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2 }}
      >
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isLogin ? "Welcome Back!" : "Create Account"}
        </CardTitle>
      </motion.div>
    </AnimatePresence>
  )
}

function AnimatedDescription({ isLogin }: { isLogin: boolean }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isLogin ? "loginDesc" : "registerDesc"}
        variants={textVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <CardDescription className="text-muted-foreground">
          {isLogin
            ? "Enter your credentials below to login"
            : "Sign up to join IECOM 2026"}
        </CardDescription>
      </motion.div>
    </AnimatePresence>
  )
}

function AnimatedToggleText({ isLogin }: { isLogin: boolean }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={isLogin ? "loginToggle" : "registerToggle"}
        variants={textVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        {isLogin
          ? "Don't have an account? "
          : "Already have an account? "}
      </motion.span>
    </AnimatePresence>
  )
}

function SubmitButton({ isLogin, isLoading }: { isLogin: boolean, isLoading: boolean }) {
  return (
    <Button
      type="submit"
      className="w-full font-semibold shadow-lg"
      disabled={isLoading}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isLoading ? "pending" : isLogin ? "loginButton" : "registerButton"}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="block"
        >
          {isLoading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

export function AuthForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLogin, setIsLogin] = useState(false)
  
  const [emailValue, setEmailValue] = useState("")
  const [passwordValue, setPasswordValue] = useState("")

  const handleAuth = async (prevState: AuthState, formData: FormData) => {
    const formType = formData.get("formType")
    if (formType === "login") {
      return await login(prevState, formData)
    } else {
      return await register(prevState, formData)
    }
  }

  const [formState, formAction, isPending] = useActionState(handleAuth, initialState)
  const prevFormStateRef = useRef(formState)

  useEffect(() => {
    if (formState === prevFormStateRef.current) return
    prevFormStateRef.current = formState

    if (formState?.error) {
      toast.error(formState.error)
    }
    if (formState?.message) {
      toast.success(formState.message)
    }

    if (formState?.success && !isLogin) {
      const timer = setTimeout(() => {
        setIsLogin(true)               
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [formState, isLogin])

  const toggleForm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsLogin((prev) => !prev)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-background/40 dark:bg-black/40 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <AnimatedTitle isLogin={isLogin} />
          <AnimatedDescription isLogin={isLogin} />
        </CardHeader>

        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="bg-background/60 border-white/10 focus:bg-background focus:border-primary transition-all duration-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                className="bg-background/60 border-white/10 focus:bg-background focus:border-primary transition-all duration-300"
              />
            </div>

            <input
              type="hidden"
              name="formType"
              value={isLogin ? "login" : "register"}
            />
            
            <div className="pt-2">
                <SubmitButton isLogin={isLogin} isLoading={isPending} />
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <div className="w-full text-center text-sm text-muted-foreground">
            <AnimatedToggleText isLogin={isLogin} />
            &nbsp;
            <button
              onClick={toggleForm}
              className="font-bold text-primary underline-offset-4 hover:underline"
              type="button"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}