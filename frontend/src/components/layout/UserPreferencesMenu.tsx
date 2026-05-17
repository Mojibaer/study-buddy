'use client'

import { LogOut, Sun, Moon, Monitor, Languages, PaletteIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { setLocale } from '@/app/actions'
import type { Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/providers/AuthProvider'

export function UserPreferencesMenu() {
  const t = useTranslations()
  const locale = useLocale()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const { user, status, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLocaleChange = (newLocale: string) => {
    startTransition(async () => {
      await setLocale(newLocale as Locale)
      router.refresh()
    })
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      router.push('/login')
    } finally {
      setLoggingOut(false)
    }
  }

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email
      ? user.email.slice(0, 2).toUpperCase()
      : 'SB'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="w-8 h-8">
            <AvatarImage src="" alt="User" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {status === 'authenticated' && user && (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  {t('auth.menu.signedInAs')}
                </span>
                <span className="text-sm font-medium truncate">
                  {user.username ?? user.email}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {t('auth.menu.role')}: {user.role}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PaletteIcon />
              {t('theme.label')}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">
                    <Sun className="w-4 h-4" />
                    {t('theme.light')}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon className="w-4 h-4" />
                    {t('theme.dark')}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Monitor className="w-4 h-4" />
                    {t('theme.system')}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages />
              {t('language.label')}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
                  <DropdownMenuRadioItem value="en">
                    {t('language.en')}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="de">
                    {t('language.de')}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        {status === 'authenticated' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                void handleLogout()
              }}
              disabled={loggingOut}
              variant="destructive"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? t('auth.menu.loggingOut') : t('auth.menu.logout')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
