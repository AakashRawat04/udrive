"use client";

import { ChevronDown, LanguagesIcon } from "lucide-react";
import { type PointerEvent, useState } from "react";

import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { Button } from "@/components/ui/button";
import { labels } from "@/config/i18n";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import type { LocaleOptions } from "@/types/i18n";
import { useTranslation } from "react-i18next";

interface I18nToggleProps {
  messages: {
    toggleLanguage: string;
  };
}

const locales = Object.entries(labels);

export function I18nToggle({ messages }: I18nToggleProps) {
  const isMobile = useIsMobile();
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  function openDropdown() {
    setOpen(() => true);
  }

  function closeDropdown(element: PointerEvent<HTMLElement>) {
    const target = element.relatedTarget as Element;

    if ("closest" in target && target.closest("[role=menu]")) return;

    setOpen(() => false);
  }

  function changeLocale(locale: LocaleOptions) {
    i18n.changeLanguage(locale);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-expanded={open}
          className="group pointer-events-auto relative flex w-fit gap-1 px-2"
          onClick={() => isMobile && openDropdown()}
          onPointerEnter={() => !isMobile && openDropdown()}
          onPointerLeave={(event) => !isMobile && closeDropdown(event)}
        >
          <LanguagesIcon className="size-[1.2rem] transition-all dark:rotate-0 dark:scale-100" />

          <ChevronDown className="size-3 transition duration-300 group-aria-[expanded=true]:rotate-180" />

          <span className="sr-only">{messages.toggleLanguage}</span>
          <span className="pointer-events-auto absolute z-10 block h-14 w-full" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex flex-col items-center"
        align="center"
        role="menu"
        onPointerLeave={closeDropdown}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="w-full">
          {locales.map(([locale, label]) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => changeLocale(locale as LocaleOptions)}
              disabled={i18n.resolvedLanguage === locale}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
