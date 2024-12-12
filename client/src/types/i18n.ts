import { locale } from '@/config/i18n'

export type Locales = (keyof typeof locale)[]
export type LocaleOptions = Locales[number]