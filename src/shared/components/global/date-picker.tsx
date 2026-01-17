"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar } from "lucide-react"
import { cn } from "@/src/shared/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/shared/components/global/ui/popover"
import { Button } from "@/src/shared/components/global/ui/button"

export interface DateRange {
  from: Date | null
  to: Date | null
}

type PresetOption =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "last7Days"
  | "last28Days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"

interface DateRangePickerProps {
  value?: DateRange | Date | null
  onDateChange?: (dateRange: DateRange | Date | null) => void
  mode?: "range" | "single"
  placeholder?: string
}

export function DateRangePicker({ value, onDateChange, mode = "range", placeholder = "Selecione um período" }: DateRangePickerProps) {
  const [internalDateRange, setInternalDateRange] = useState<DateRange>({
    from: null,
    to: null,
  })
  const [internalSingleDate, setInternalSingleDate] = useState<Date | null>(null)

  const normalizeValue = (val: DateRange | Date | null | undefined): DateRange => {
    if (!val) return { from: null, to: null }
    if (val instanceof Date) return { from: val, to: null }
    return val
  }

  const normalizedValue = normalizeValue(value)
  
  const normalizedFromTime = normalizedValue.from?.getTime()
  const normalizedToTime = normalizedValue.to?.getTime()
  
  useEffect(() => {
    if (normalizedValue.from || normalizedValue.to) {
      if (mode === "single") {
        setInternalSingleDate(normalizedValue.from)
      } else {
        setInternalDateRange(normalizedValue)
      }
    }
  }, [normalizedFromTime, normalizedToTime, mode, normalizedValue])

  // Usa o valor normalizado se existir, senão usa o estado interno
  const dateRange = useMemo(() => {
    if (normalizedValue.from || normalizedValue.to) {
      return normalizedValue
    }
    return mode === "single" ? { from: internalSingleDate, to: null } : internalDateRange
  }, [normalizedValue, internalSingleDate, internalDateRange, mode])
  
  const setDateRange = (newRange: DateRange) => {
    if (mode === "single") {
      const singleDate = newRange.from
      setInternalSingleDate(singleDate)
      if (onDateChange) {
        onDateChange(singleDate)
      }
    } else {
      setInternalDateRange(newRange)
      if (onDateChange) {
        onDateChange(newRange)
      }
    }
  }
  
  const [selectedPreset, setSelectedPreset] = useState<PresetOption | undefined>(undefined)
  
  // Atualiza currentMonth quando dateRange muda
  const currentMonth = useMemo(() => {
    return dateRange.from || dateRange.to || new Date()
  }, [dateRange.from, dateRange.to])
  
  const [displayMonth, setDisplayMonth] = useState(currentMonth)
  
  // Sincroniza displayMonth com currentMonth
  useEffect(() => {
    setDisplayMonth(currentMonth)
  }, [currentMonth])

  const formatDateRange = (from: Date, to: Date | null) => {
    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }
    if (mode === "single" || !to || from.toDateString() === to.toDateString()) {
      return from.toLocaleDateString("pt-BR", options)
    }
    return `${from.toLocaleDateString("pt-BR", options)} - ${to.toLocaleDateString("pt-BR", options)}`
  }

  const getPresetDates = (preset: PresetOption): DateRange => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const day = today.getDate()

    switch (preset) {
      case "today":
        return { from: today, to: today }
      case "yesterday": {
        const yesterday = new Date(year, month, day - 1)
        return { from: yesterday, to: yesterday }
      }
      case "thisWeek": {
        const firstDay = new Date(year, month, day - today.getDay())
        return { from: firstDay, to: today }
      }
      case "last7Days":
        return { from: new Date(year, month, day - 6), to: today }
      case "last28Days":
        return { from: new Date(year, month, day - 27), to: today }
      case "thisMonth":
        return { from: new Date(year, month, 1), to: today }
      case "lastMonth": {
        const lastMonthStart = new Date(year, month - 1, 1)
        const lastMonthEnd = new Date(year, month, 0)
        return { from: lastMonthStart, to: lastMonthEnd }
      }
      case "thisYear":
        return { from: new Date(year, 0, 1), to: today }
      default:
        return { from: today, to: today }
    }
  }

  const handlePresetClick = (preset: PresetOption) => {
    setSelectedPreset(preset)
    const newRange = getPresetDates(preset)
    setDateRange(newRange)
    setDisplayMonth(newRange.from || displayMonth)
  }

  const handleDateClick = (date: Date) => {
    // Normaliza a data para remover horas/minutos/segundos
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    if (mode === "single") {
      // Modo single: apenas seleciona a data
      setDateRange({ from: normalizedDate, to: null })
      setSelectedPreset(undefined as unknown as PresetOption)
    } else {
      // Modo range: seleciona intervalo
      if (!dateRange.from || dateRange.to) {
        // Primeiro clique ou recomeçar: define apenas 'from'
        setDateRange({ from: normalizedDate, to: null })
        setSelectedPreset(undefined as unknown as PresetOption)
      } else {
        // Segundo clique: completa o intervalo
        const fromNormalized = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate())
        if (normalizedDate < fromNormalized) {
          setDateRange({ from: normalizedDate, to: dateRange.from })
        } else {
          setDateRange({ from: dateRange.from, to: normalizedDate })
        }
        setSelectedPreset(undefined as unknown as PresetOption)
      }
    }
  }

  const isDateInRange = (date: Date) => {
    if (mode === "single") return false
    if (!dateRange.from || !dateRange.to) return false
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const fromOnly = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate())
    const toOnly = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate())
    return dateOnly >= fromOnly && dateOnly <= toOnly
  }

  const isDateSelected = (date: Date) => {
    return (
      (dateRange.from && date.toDateString() === dateRange.from.toDateString()) ||
      (dateRange.to && date.toDateString() === dateRange.to.toDateString())
    )
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }

  const goToPreviousMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))
  }

  const presets: { label: string; value: PresetOption }[] = [
    { label: "Hoje", value: "today" },
    { label: "Ontem", value: "yesterday" },
    { label: "Esta Semana", value: "thisWeek" },
    { label: "Últimos 7 Dias", value: "last7Days" },
    { label: "Últimos 28 Dias", value: "last28Days" },
    { label: "Este Mês", value: "thisMonth" },
    { label: "Último Mês", value: "lastMonth" },
    { label: "Este Ano", value: "thisYear" },
  ]

  const days = getDaysInMonth(displayMonth)
  const monthYear = displayMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal text-sm leading-[21px] font-montserrat h-[40px] w-full min-w-0",
            !dateRange.from && "text-muted-foreground"
          )}
        >
          <Calendar className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {dateRange?.from ? (
              formatDateRange(dateRange.from, dateRange.to)
            ) : (
              placeholder
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="start">
        <div className="flex overflow-hidden">
          {/* Sidebar with presets */}
          {mode === "range" && (
            <div className="flex flex-col border-r border-border shrink-0">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={cn(
                    "px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors whitespace-nowrap cursor-pointer",
                    selectedPreset === preset.value && "bg-muted",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Calendar */}
          <div className="p-4 shrink-0">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div className="font-medium text-sm">{monthYear}</div>
              <button onClick={goToNextMonth} className="p-1 hover:bg-muted rounded transition-colors cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Do", "Se", "Te", "Qa", "Qi", "Sx", "Sá"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground w-9 h-9 flex items-center justify-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isSelected = isDateSelected(day.date)
                const isInRange = isDateInRange(day.date)

                return (
                  <button
                    key={index}
                    onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
                    disabled={!day.isCurrentMonth}
                    className={cn(
                      "w-9 h-9 text-sm rounded-md transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      !day.isCurrentMonth && "text-muted-foreground opacity-50 cursor-not-allowed",
                      day.isCurrentMonth && "cursor-pointer",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                      isInRange && !isSelected && "bg-accent",
                      day.isCurrentMonth && "font-normal",
                    )}
                  >
                    {day.date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
