"use client"

import * as React from "react"
import { Check, ChevronsUpDown, HelpCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type FireType, fireTypeInfo } from "@/lib/fire-types"

interface FireTypeSelectorProps {
  value: FireType
  onValueChange: (value: FireType) => void
}

export function FireTypeSelector({ value, onValueChange }: FireTypeSelectorProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {value ? fireTypeInfo[value].label : "选择FIRE类型"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="搜索FIRE类型..." />
            <CommandList>
              <CommandEmpty>未找到匹配的FIRE类型</CommandEmpty>
              <CommandGroup>
                {Object.entries(fireTypeInfo).map(([key, info]) => (
                  <CommandItem
                    key={key}
                    value={key}
                    onSelect={() => {
                      onValueChange(key as FireType)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === key ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <span>{info.label}</span>
                      <span className="text-xs text-muted-foreground">{info.shortDesc}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-4 w-4" />
              <span className="sr-only">FIRE类型说明</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" className="max-w-md p-4">
            <div className="space-y-2">
              <h4 className="font-medium">FIRE类型说明</h4>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left">类型</th>
                    <th className="border px-2 py-1 text-left">默认年支出</th>
                    <th className="border px-2 py-1 text-left">储蓄率默认</th>
                    <th className="border px-2 py-1 text-left">兼职收入</th>
                    <th className="border px-2 py-1 text-left">收入增长</th>
                    <th className="border px-2 py-1 text-left">投资收益</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">Fat FIRE</td>
                    <td className="border px-2 py-1">40~60万</td>
                    <td className="border px-2 py-1">30%</td>
                    <td className="border px-2 py-1">0元</td>
                    <td className="border px-2 py-1">2%/年</td>
                    <td className="border px-2 py-1">6~8%</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Lean FIRE</td>
                    <td className="border px-2 py-1">12~20万</td>
                    <td className="border px-2 py-1">50~70%</td>
                    <td className="border px-2 py-1">0元</td>
                    <td className="border px-2 py-1">0%</td>
                    <td className="border px-2 py-1">5%</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Barista FIRE</td>
                    <td className="border px-2 py-1">20~30万</td>
                    <td className="border px-2 py-1">40%</td>
                    <td className="border px-2 py-1">10~15万</td>
                    <td className="border px-2 py-1">1%</td>
                    <td className="border px-2 py-1">5%</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Coast FIRE</td>
                    <td className="border px-2 py-1">当前存量</td>
                    <td className="border px-2 py-1">0%(未来)</td>
                    <td className="border px-2 py-1">无需</td>
                    <td className="border px-2 py-1">N/A</td>
                    <td className="border px-2 py-1">6~7%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
