'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FolderKanban, CheckSquare, Zap, Settings } from 'lucide-react';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: FolderKanban, label: 'Projects', href: '/projects' },
    { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
    { icon: Zap, label: 'Pulse', href: '/pulse' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    Ops System
                </h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-slate-800 text-white shadow-sm"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                    <Settings className="h-5 w-5" />
                    Settings
                </button>
            </div>
        </div>
    );
}
