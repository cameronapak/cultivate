import { Check, Moon, Palette, Sun } from "lucide-react"
import { useEffect, useState } from "react";

import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { setTheme, getTheme, APP_COLOR_THEMES } from "../../lib/utils"

export function AppColorThemeToggle() {
  const [themeState, setThemeState] = useState(getTheme());

  useEffect(() => {
    if (themeState) {
      console.log("setting theme", themeState);
      setTheme(themeState);
    }
  }, [themeState]);

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
          <DropdownMenuItem className="flex items-center justify-between" key={theme} onClick={() => setThemeState(theme)}>
            {theme}
            {themeState === theme && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
