import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, Clock, PlayCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent updates logged by the Brain yet.
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have no pending tasks.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const stats = [
  {
    title: "Active Projects",
    value: "12",
    description: "+2 from last month",
    icon: PlayCircle,
  },
  {
    title: "Due Soon",
    value: "4",
    description: "Tasks due within 48h",
    icon: Clock,
  },
  {
    title: "Completed",
    value: "23",
    description: "Tasks finished this week",
    icon: CheckCircle2,
  },
  {
    title: "System Health",
    value: "98%",
    description: "Operational status",
    icon: Activity,
  },
];
