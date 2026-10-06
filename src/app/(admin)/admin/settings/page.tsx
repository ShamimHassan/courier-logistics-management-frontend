import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Wrench className="h-5 w-5 text-muted-foreground" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform configuration and admin account settings.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Platform Settings</CardTitle>
          <CardDescription>
            Admin profile management and platform toggles will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Settings panel is a placeholder for future configuration options —
            use the sidebar links to manage users, hubs, pricing rules, and audit
            logs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
