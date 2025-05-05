import { Check, Moon, Palette, Sun } from "lucide-react"

import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { setTheme, getTheme, APP_COLOR_THEMES } from "../../lib/utils"

export function AppColorThemeToggle() {
  const currentTheme = getTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[128px] overflow-y-auto" align="end">
        {APP_COLOR_THEMES.map((theme) => (
          <DropdownMenuItem className="flex items-center justify-between" key={theme} onClick={() => setTheme(theme)}>
            {theme}
            {currentTheme === theme && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
