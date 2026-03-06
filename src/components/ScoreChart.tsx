"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ScoreChartProps {
    score: number;
}

export function ScoreChart({ score }: ScoreChartProps) {
    const data = [
        { name: "Score", value: score },
        { name: "Remaining", value: 100 - score },
    ];

    const COLORS = [
        score >= 80 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#dc2626", // green/yellow/red based on score
        "#f3f4f6", // gray for remaining
    ];

    return (
        <div className="h-48 w-48 relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={10}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-gray-800">{score}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Score</span>
            </div>
        </div>
    );
}
