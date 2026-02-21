'use client'

import { Globe } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const languages = [
  { code: 'en', name: 'English',    flag: '🇬🇧' },
  { code: 'fr', name: 'Français',   flag: '🇫🇷' },
  { code: 'pt', name: 'Português',  flag: '🇧🇷' },
  { code: 'es', name: 'Español',    flag: '🇪🇸' },
] as const

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  const currentLanguage = languages.find(l => l.code === locale) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLocale(language.code)}
            className="cursor-pointer"
          >
            <span className="mr-2">{language.flag}</span>
            <span>{language.name}</span>
            {locale === language.code && (
              <span className="ml-auto text-emerald-500">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
