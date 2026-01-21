"use client"

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

interface GaugeChartProps {
  value: number
  maxValue?: number
  label: string
  color?: string
  className?: string
}

export function GaugeChart({
  value,
  maxValue = 100,
  label,
  color = "var(--chart-1)",
  className,
}: GaugeChartProps) {
  const remaining = maxValue - value
  const chartData = [{ value, remaining }]

  const chartConfig = {
    value: {
      label: label,
      color: color,
    },
    remaining: {
      label: "Remaining",
      color: "var(--muted)",
    },
  } satisfies ChartConfig

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="overflow-hidden">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-[140px] -mb-[50px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius={50}
            outerRadius={70}
          >
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 12}
                          className="fill-foreground text-xl font-bold"
                        >
                          {value}
                          {maxValue === 100 && (
                            <tspan className="text-xs font-normal text-muted-foreground">%</tspan>
                          )}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 6}
                          className="fill-muted-foreground text-[10px]"
                        >
                          {label}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="value"
              stackId="a"
              cornerRadius={5}
              fill={color}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="remaining"
              stackId="a"
              cornerRadius={5}
              fill="var(--muted)"
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </div>
    </div>
  )
}

interface StatsGaugesProps {
  stats: {
    label: string
    value: number
    maxValue?: number
    sublabel?: string
    color?: string
  }[]
  className?: string
}

export function StatsGauges({ stats, className }: StatsGaugesProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-6", className)}>
      {stats.map((stat, index) => (
        <GaugeChart
          key={stat.label}
          value={stat.value}
          maxValue={stat.maxValue}
          label={stat.label}
          color={stat.color || `var(--chart-${(index % 5) + 1})`}
        />
      ))}
    </div>
  )
}
