'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

type MonthlyStats = {
  month: string;
  views: number;
  messages: number;
  favorites: number;
};

export default function AnalyticsDashboard() {
  const [chartData, setChartData] = useState<MonthlyStats[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalFavorites, setTotalFavorites] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/user/analytics');
      if (res.ok) {
        const data = await res.json();

        // Regrouper par mois
        const grouped = Array(6)
          .fill(0)
          .map((_, i) => {
            const monthDate = new Date();
            monthDate.setMonth(monthDate.getMonth() - (5 - i));
            const monthLabel = monthDate.toLocaleString('fr-FR', {
              month: 'short',
            });

            const monthAds = data.filter((ad: any) => {
              const adDate = new Date(ad.createdAt);
              return (
                adDate.getMonth() === monthDate.getMonth() &&
                adDate.getFullYear() === monthDate.getFullYear()
              );
            });

            return {
              month: monthLabel,
              views: monthAds.reduce(
                (sum: number, ad: any) => sum + (ad.adAnalytics?.views || 0),
                0
              ),
              messages: monthAds.reduce(
                (sum: number, ad: any) =>
                  sum + (ad.adAnalytics?.messagesCount || 0),
                0
              ),
              favorites: monthAds.reduce(
                (sum: number, ad: any) =>
                  sum + (ad.adAnalytics?.favoritesCount || 0),
                0
              ),
            };
          });

        setChartData(grouped);
        setTotalViews(grouped.reduce((acc, curr) => acc + curr.views, 0));
        setTotalMessages(grouped.reduce((acc, curr) => acc + curr.messages, 0));
        setTotalFavorites(
          grouped.reduce((acc, curr) => acc + curr.favorites, 0)
        );
      }
    };
    fetchStats();
  }, []);
  const chartConfig = {
    views: { label: 'Vues', color: 'hsl(var(--chart-1))' },
    messages: { label: 'Messages', color: 'hsl(var(--chart-2))' },
    favorites: { label: 'Favoris', color: 'hsl(var(--chart-3))' },
  } satisfies ChartConfig;
  const RoundedBar = (props: any) => {
    const { fill, x, y, width, height, radius } = props;

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={fill}
      />
    );
  };
  return (
    <div className="w-full flex flex-col gap-8">
      {/* Titre + Chart */}
      <Card className="rounded-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Statistiques des 6 derniers mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-gray-400 text-sm">Chargement des données...</p>
          ) : (
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="views"
                  stackId="a"
                  fill="#f97316"
                  shape={<RoundedBar radius={15} />}
                  radius={[4, 4, 0, 0]}
                  name="Vues"
                />
                <Bar
                  dataKey="messages"
                  stackId="a"
                  shape={<RoundedBar radius={10} />}
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Messages"
                />
                <Bar
                  dataKey="favorites"
                  stackId="a"
                  shape={<RoundedBar radius={10} />}
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Favoris"
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Totaux en dessous */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-lg text-center py-6">
          <CardTitle className="text-gray-500 text-sm">TOTAL VUES</CardTitle>
          <p className="text-4xl font-bold text-orange-500">{totalViews}</p>
        </Card>
        <Card className="rounded-2xl shadow-lg text-center py-6">
          <CardTitle className="text-gray-500 text-sm">
            TOTAL MESSAGES
          </CardTitle>
          <p className="text-4xl font-bold text-blue-500">{totalMessages}</p>
        </Card>
        <Card className="rounded-2xl shadow-lg text-center py-6">
          <CardTitle className="text-gray-500 text-sm">TOTAL FAVORIS</CardTitle>
          <p className="text-4xl font-bold text-green-500">{totalFavorites}</p>
        </Card>
      </div>
    </div>
  );
}
