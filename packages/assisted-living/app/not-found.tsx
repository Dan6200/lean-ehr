'use client'

import { Button } from '@/components/ui/button'
import { GoBackLink } from '@/components/go-back-link'
import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="grid min-h-svh w-full grid-cols-1 md:grid-cols-2">
      <div className="relative flex flex-col items-center justify-center gap-4 p-8 text-center">
        <GoBackLink className="absolute left-8 top-8">Go Back</GoBackLink>
        <Image
          src="/404-compass.png"
          alt="Compass indicating a lost page"
          width={200}
          height={200}
          className="mb-4 md:hidden" // Show compass on mobile in the text column
        />
        <div className="text-9xl font-bold">404</div>
        <h1 className="text-3xl font-semibold">Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
      <div className="relative hidden md:block">
        <Image
          src="/404-compass.png"
          alt="Compass indicating a lost page"
          fill
          className="object-cover dark:brightness-[0.7] dark:grayscale"
        />
      </div>
    </div>
  )
}
