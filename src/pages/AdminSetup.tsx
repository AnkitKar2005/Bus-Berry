import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Shield, Check, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  const handleSetup = async () => {
    try {
      setLoading(true);
      setResult(null);

      const { data, error } = await supabase.functions.invoke("setup-admin", {
        body: {},
      });

      if (error) {
        toast.error("Setup failed: " + error.message);
        return;
      }

      setResult(data);
      
      if (data.success) {
        toast.success("Admin setup completed successfully!");
      }
    } catch (error: any) {
      toast.error("Setup failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
            One-time setup to create the admin account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This setup should only be run once to create the admin account.
              After setup, use the Admin Login page to access the admin panel.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Admin Credentials</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Email:</strong> admin@busbooker.com</p>
                <p><strong>Password:</strong> BusBooker@Admin2024!</p>
              </div>
            </div>

            <Alert className="bg-yellow-500/10 border-yellow-500/50">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                <strong>Security Note:</strong> After logging in for the first time, 
                change the admin password immediately through your account settings.
              </AlertDescription>
            </Alert>
          </div>

          {result && (
            <Alert className={result.success ? "bg-green-500/10 border-green-500/50" : "bg-red-500/10 border-red-500/50"}>
              {result.success ? (
                <>
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    <strong>Success!</strong> {result.message}
                    {result.note && <div className="mt-2">{result.note}</div>}
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-600 dark:text-red-400">
                    <strong>Error:</strong> {result.error || result.message}
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={handleSetup} 
              disabled={loading || (result?.success)}
              className="flex-1"
            >
              {loading ? "Setting up..." : result?.success ? "Setup Complete" : "Run Admin Setup"}
            </Button>
            
            {result?.success && (
              <Button 
                onClick={() => navigate("/admin/login")}
                variant="outline"
                className="flex-1"
              >
                Go to Admin Login
              </Button>
            )}
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-sm"
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
