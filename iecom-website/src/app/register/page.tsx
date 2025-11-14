import Image from 'next/image';

import { AuthForm } from '@/components/AuthForm/AuthForm';
import { Toaster } from "@/components/ui/sonner"

export default async function Register() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Image
        src={'/pages/register/bg.jpg'}
        alt="IECOM 2026 Registration"
        priority
        fill
        className="object-cover pointer-events-none"
        quality={75}
        sizes="100vw"
        style={{ opacity: 0.5 }} 
      />
      <Toaster richColors/>
      <div className="w-full max-w-sm z-10"> 
        <AuthForm />
      </div>
    </div>
  )
}