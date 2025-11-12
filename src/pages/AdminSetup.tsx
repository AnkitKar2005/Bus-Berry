import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Shield, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminSetup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
          <CardDescription>
            Secure admin account configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Admin Setup Secured:</strong> Admin account creation has been secured and requires 
              backend configuration. Please contact your system administrator to set up the admin account.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Security Improvements</h3>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>Admin credentials are no longer hardcoded</li>
                <li>Function requires service role authentication</li>
                <li>Password complexity requirements enforced</li>
                <li>Prevents unauthorized admin account creation</li>
              </ul>
            </div>

            <Alert className="bg-blue-500/10 border-blue-500/50">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                <strong>For Administrators:</strong> Use the backend dashboard to configure 
                the admin account using the secure setup process.
              </AlertDescription>
            </Alert>
          </div>

          <div className="text-center space-y-2">
            <Button
              onClick={() => navigate("/admin/login")}
              className="w-full"
            >
              Go to Admin Login
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
