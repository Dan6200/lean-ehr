'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

const navLinks = [
  { name: 'Emergency Contacts', href: '/emergency-contacts' },
  { name: 'Allergies', href: '/allergies' },
  { name: 'Current Medications', href: '/medications' },
  { name: 'Medical Records', href: '/records' },
]

export function ResidentNav({ residentId }: { residentId: string }) {
  const pathname = usePathname()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navLinks.map((link) => {
          const fullHref = `/admin/residents/${residentId}${link.href}`
          const isActive = pathname === fullHref
          return (
            <NavigationMenuItem key={link.name}>
              <Link href={fullHref} legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} active={isActive}>
                  {link.name}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
