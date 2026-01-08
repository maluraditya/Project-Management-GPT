'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { format } from 'date-fns';

type Update = {
    id: string;
    content: string;
    sentiment: string;
    forDate: string;
    project?: { name: string };
};

const sentimentConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    ON_TRACK: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    AT_RISK: { icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    BLOCKED: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function UpdatesPage() {
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUpdates() {
            const { data } = await supabase
                .from('Update')
                .select('*, project:Project(name)')
                .order('forDate', { ascending: false });
            setUpdates(data || []);
            setLoading(false);
        }
        fetchUpdates();
    }, []);

    // Group by date
    const groupedUpdates = updates.reduce((acc, update) => {
        const date = format(new Date(update.forDate), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(update);
        return acc;
    }, {} as Record<string, Update[]>);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto p-8 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                        Updates Pulse
                    </h1>
                    <p className="text-muted-foreground mt-1">Daily status updates and team pulse</p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="shadow-sm border-l-4 border-emerald-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <CheckCircle className="h-8 w-8 text-emerald-500" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {updates.filter(u => u.sentiment === 'ON_TRACK').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">On Track</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-l-4 border-amber-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <TrendingUp className="h-8 w-8 text-amber-500" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {updates.filter(u => u.sentiment === 'AT_RISK').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">At Risk</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-l-4 border-red-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {updates.filter(u => u.sentiment === 'BLOCKED').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Blocked</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Timeline */}
                {Object.keys(groupedUpdates).length === 0 ? (
                    <Card className="shadow-lg">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No updates yet</h3>
                            <p className="text-muted-foreground">Use ChatGPT to log daily updates and track project health</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedUpdates).map(([date, dayUpdates]) => (
                            <div key={date}>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                                </h3>
                                <div className="space-y-3 pl-6 border-l-2 border-slate-200">
                                    {dayUpdates.map((update) => {
                                        const config = sentimentConfig[update.sentiment] || sentimentConfig.ON_TRACK;
                                        const Icon = config.icon;
                                        return (
                                            <Card key={update.id} className={`shadow-sm ${config.bg} border-0`}>
                                                <CardContent className="py-4">
                                                    <div className="flex items-start gap-4">
                                                        <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                                                        <div className="flex-1">
                                                            <p className="text-sm">{update.content}</p>
                                                            {update.project?.name && (
                                                                <p className="text-xs text-muted-foreground mt-2">
                                                                    Project: {update.project.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Badge variant={update.sentiment === 'BLOCKED' ? 'destructive' : update.sentiment === 'AT_RISK' ? 'warning' : 'success'}>
                                                            {update.sentiment.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
