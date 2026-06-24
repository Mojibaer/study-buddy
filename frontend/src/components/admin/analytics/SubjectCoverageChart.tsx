'use client'

import {useTranslations} from 'next-intl'
import {
    Bar,
    BarChart,
    Cell,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import type {SubjectCoverage} from '@/lib/admin/analyticsClient'

interface SubjectCoverageChartProps {
    data: SubjectCoverage[]
}

const COVERED_COLOR = 'var(--chart-2)'
const EMPTY_COLOR = 'var(--destructive)'

export function SubjectCoverageChart({data}: SubjectCoverageChartProps) {
    const t = useTranslations('admin.analytics')
    const emptyCount = data.filter((subject) => subject.document_count === 0).length
    const height = Math.max(220, data.length * 34)

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('subjectCoverage.title')}</CardTitle>
                <CardDescription>
                    {t('subjectCoverage.description', {count: emptyCount})}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart data={data} layout="vertical" margin={{left: 8, right: 24}}>
                        <XAxis type="number" allowDecimals={false} hide/>
                        <YAxis
                            type="category"
                            dataKey="subject_name"
                            width={150}
                            tick={{fontSize: 12, fill: 'var(--muted-foreground)'}}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{fill: 'var(--border)', opacity: 0.3}}
                            formatter={(value) => [value, t('subjectCoverage.documents')]}
                            contentStyle={{
                                background: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                fontSize: 12,
                            }}
                        />
                        <Bar dataKey="document_count" radius={[0, 4, 4, 0]}>
                            {data.map((subject) => (
                                <Cell
                                    key={subject.subject_id}
                                    fill={subject.document_count === 0 ? EMPTY_COLOR : COVERED_COLOR}
                                />
                            ))}
                            <LabelList
                                dataKey="document_count"
                                position="right"
                                style={{fontSize: 12, fill: 'var(--muted-foreground)'}}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}