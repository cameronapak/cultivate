import { Check, Moon, Palette, Sun } from "lucide-react"
import { useEffect, useState } from "react";

import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { setTheme, getTheme, APP_COLOR_THEMES } from "../../lib/utils"

export function AppColorThemeToggle() {
  const [themeState, setThemeState] = useState(getTheme());

  const handleThemeChange = (theme: string) => {
    setThemeState(theme);
    setTheme(theme);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[128px] overflow-y-auto" align="end">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase font-normal bg-muted p-2 rounded-md">
          Themes provided by <a className="hover:underline" href="https://github.com/jnsahaj/tweakcn" target="_blank" rel="noopener noreferrer">tweakcn</a>
        </DropdownMenuLabel>
        {APP_COLOR_THEMES.map((theme) => (
          <DropdownMenuItem className="flex items-center justify-between" key={theme} onClick={() => handleThemeChange(theme)}>
            {theme.replace(/-/g, " ").split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            {themeState === theme && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
