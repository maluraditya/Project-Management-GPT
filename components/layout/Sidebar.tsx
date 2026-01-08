'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FolderKanban, ListTodo, Activity, Settings, Sparkles } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/tasks', icon: ListTodo },
    { name: 'Updates', href: '/updates', icon: Activity },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 border-b px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-500/25">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Ops System</h1>
                        <p className="text-xs text-muted-foreground">Project Management</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-500/10 to-violet-500/10 text-blue-700 dark:text-blue-400 shadow-sm'
                                        : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800'
                                )}
                            >
                                <item.icon className={cn(
                                    'h-5 w-5 transition-colors',
                                    isActive ? 'text-blue-600' : ''
                                )} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t p-4">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                        Settings
                    </Link>
                    <div className="mt-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-violet-500/10 p-4">
                        <p className="text-xs font-medium">Connected to ChatGPT</p>
                        <p className="text-xs text-muted-foreground mt-1">Your AI assistant is ready</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
