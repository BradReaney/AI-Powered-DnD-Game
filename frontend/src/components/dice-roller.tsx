"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Dices } from "lucide-react"

interface DiceRollResult {
  dice: string
  rolls: number[]
  total: number
  modifier: number
  finalTotal: number
}

interface DiceRollerProps {
  onRoll: (result: DiceRollResult) => void
  className?: string
}

const COMMON_ROLLS = [
  { label: "d20", dice: "1d20" },
  { label: "d12", dice: "1d12" },
  { label: "d10", dice: "1d10" },
  { label: "d8", dice: "1d8" },
  { label: "d6", dice: "1d6" },
  { label: "d4", dice: "1d4" },
  { label: "2d6", dice: "2d6" },
  { label: "3d6", dice: "3d6" },
  { label: "4d6", dice: "4d6" },
]

export function DiceRoller({ onRoll, className }: DiceRollerProps) {
  const [customDice, setCustomDice] = useState("")
  const [modifier, setModifier] = useState(0)
  const [lastRoll, setLastRoll] = useState<DiceRollResult | null>(null)

  const parseDiceNotation = (notation: string): { count: number; sides: number } | null => {
    const match = notation.match(/^(\d+)?d(\d+)$/i)
    if (!match) return null

    const count = Number.parseInt(match[1] || "1")
    const sides = Number.parseInt(match[2])

    if (count < 1 || count > 100 || sides < 2 || sides > 100) return null

    return { count, sides }
  }

  const rollDice = (diceNotation: string, mod = 0) => {
    const parsed = parseDiceNotation(diceNotation)
    if (!parsed) return

    const rolls: number[] = []
    for (let i = 0; i < parsed.count; i++) {
      rolls.push(Math.floor(Math.random() * parsed.sides) + 1)
    }

    const total = rolls.reduce((sum, roll) => sum + roll, 0)
    const finalTotal = total + mod

    const result: DiceRollResult = {
      dice: diceNotation,
      rolls,
      total,
      modifier: mod,
      finalTotal,
    }

    setLastRoll(result)
    onRoll(result)
  }

  const handleCustomRoll = () => {
    if (customDice.trim()) {
      rollDice(customDice.trim(), modifier)
    }
  }

  const getDiceIcon = (value: number) => {
    switch (value) {
      case 1:
        return <Dice1 className="h-4 w-4" />
      case 2:
        return <Dice2 className="h-4 w-4" />
      case 3:
        return <Dice3 className="h-4 w-4" />
      case 4:
        return <Dice4 className="h-4 w-4" />
      case 5:
        return <Dice5 className="h-4 w-4" />
      case 6:
        return <Dice6 className="h-4 w-4" />
      default:
        return <Dices className="h-4 w-4" />
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dices className="h-5 w-5" />
          Dice Roller
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Common Dice */}
        <div>
          <div className="text-sm font-medium mb-2">Quick Rolls</div>
          <div className="grid grid-cols-3 gap-2">
            {COMMON_ROLLS.map((roll) => (
              <Button
                key={roll.dice}
                variant="outline"
                size="sm"
                onClick={() => rollDice(roll.dice, modifier)}
                className="text-xs"
              >
                {roll.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Dice */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Custom Roll</div>
          <div className="flex gap-2">
            <Input
              placeholder="1d20, 3d6, etc."
              value={customDice}
              onChange={(e) => setCustomDice(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleCustomRoll()}
            />
            <Input
              type="number"
              placeholder="Mod"
              value={modifier || ""}
              onChange={(e) => setModifier(Number.parseInt(e.target.value) || 0)}
              className="w-20"
            />
            <Button onClick={handleCustomRoll} size="sm">
              Roll
            </Button>
          </div>
        </div>

        {/* Last Roll Result */}
        {lastRoll && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Last Roll: {lastRoll.dice}</span>
              <Badge variant="outline" className="text-lg font-bold">
                {lastRoll.finalTotal}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {lastRoll.rolls.map((roll, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {getDiceIcon(roll)}
                    <span>{roll}</span>
                  </div>
                ))}
              </div>
              {lastRoll.modifier !== 0 && (
                <span>
                  {lastRoll.modifier > 0 ? "+" : ""}
                  {lastRoll.modifier}
                </span>
              )}
              <span>= {lastRoll.finalTotal}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
