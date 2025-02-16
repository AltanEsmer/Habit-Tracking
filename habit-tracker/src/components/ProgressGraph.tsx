"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressGraphProps {
  data: {
    date: string;
    completions: number;
    xp: number;
  }[];
}

export function ProgressGraph({ data }: ProgressGraphProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="completions" stroke="#8884d8" name="Completions" />
        <Line yAxisId="right" type="monotone" dataKey="xp" stroke="#82ca9d" name="XP Gained" />
      </LineChart>
    </ResponsiveContainer>
  );
} 