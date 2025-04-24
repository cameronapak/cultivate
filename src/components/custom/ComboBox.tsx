"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "../../lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";

type Status = {
  value: string
  label: string
}

export function Combobox({
  options,
  button,
  onChange,
}: {
  options: Status[];
  button: React.ReactNode;
  onChange: (label: string, value: string) => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {button}
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup onClick={(e) => e.stopPropagation()}>
              {options?.map((option) => (
                // @TODO: Figure out how to get this to not propogate to the link.
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={async (currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    try {
                      await onChange(option.label, option.value)
                    } catch (error) {
                      // Do nothing
                    }
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
