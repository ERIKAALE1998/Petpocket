import { type AuthUser } from "wasp/auth";
import { DefaultLayout } from "../../layout/DefaultLayout";

export function AnalyticsDashboardPage({ user }: { user: AuthUser }) {
  return (
    <DefaultLayout user={user}>
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground text-lg">
          Analytics are currently disabled.
        </p>
      </div>
    </DefaultLayout>
  );
}
