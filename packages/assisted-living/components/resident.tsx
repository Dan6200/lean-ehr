'use client'
import { CldImage } from 'next-cloudinary'
import Image from 'next/image'
import type { ResidentData } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/auth/client/config'

const CLOUDINARY_FOLDER = 'lean-ehr/assisted-living/'

export default function Resident({
  id,
  residentData,
}: {
  id: string
  residentData: ResidentData
}) {
  const [, setUser] = useState<User | null>(null)
  const router = useRouter()

  const { resident_name, avatar_url } = residentData

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
      })
      return () => unsubscribe()
    }
  }, [setUser])

  return (
    <div className="p-4 md:p-8 w-full lg:w-2/3">
      <div className="flex flex-col md:flex-row items-center self-center gap-4 md:gap-8">
        {avatar_url ? (
          <CldImage
            width="128"
            height="128"
            src={`${CLOUDINARY_FOLDER}${avatar_url}`.replace('.png', '')}
            alt="resident avatar"
            className="rounded-full"
          />
        ) : (
          <Image
            src="/avatars/placeholder.png"
            alt="placeholder image"
            className="rounded-full"
            width={128}
            height={128}
          />
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left">
          {resident_name ?? 'Resident Name Not Available'}
        </h1>
      </div>
    </div>
  )
}
