'use client'

import {useTranslations} from 'next-intl'
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import type {UploadActivityPoint} from '@/lib/admin/analyticsClient'

interface UploadActivityChartProps {
    data: UploadActivityPoint[]
}

function formatDay(date: string): string {
    return new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})
}

export function UploadActivityChart({data}: UploadActivityChartProps) {
    const t = useTranslations('admin.analytics')

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('uploadActivity.title')}</CardTitle>
                <CardDescription>{t('uploadActivity.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data} margin={{top: 8, right: 8, bottom: 0, left: -16}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDay}
                            interval={4}
                            tick={{fontSize: 12, fill: 'var(--muted-foreground)'}}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{fontSize: 12, fill: 'var(--muted-foreground)'}}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            labelFormatter={(label) => formatDay(label as string)}
                            formatter={(value) => [value, t('uploadActivity.uploads')]}
                            contentStyle={{
                                background: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                fontSize: 12,
                            }}
                        />
                        <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}