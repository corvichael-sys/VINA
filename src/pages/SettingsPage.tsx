import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteAllTransactionsDialog } from "@/components/settings/DeleteAllTransactionsDialog";
import { UpdateProfileForm } from "@/components/settings/UpdateProfileForm";
import { UpdatePasswordForm } from "@/components/settings/UpdatePasswordForm";
import { ThemeSwitcher } from "@/components/settings/ThemeSwitcher";
import { AccentColorSwitcher } from "@/components/settings/AccentColorSwitcher";

const SettingsPage = () => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings here.</p>
        </div>

        <UpdateProfileForm />
        <UpdatePasswordForm />
        <ThemeSwitcher />
        <AccentColorSwitcher />

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              These actions are permanent and cannot be undone. Please proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">Delete All Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently remove all of your transaction history.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                Delete History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteAllTransactionsDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
};

export default SettingsPage;