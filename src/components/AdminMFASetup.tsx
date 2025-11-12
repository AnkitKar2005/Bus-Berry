import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Key } from "lucide-react";
import { toast } from "sonner";

const AdminMFASetup = () => {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);

  const enrollMFA = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Admin Account",
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setFactorId(data.id);
      toast.success("Scan the QR code with your authenticator app");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!factorId) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verificationCode,
      });

      if (error) throw error;

      toast.success("MFA enabled successfully!");
      setQrCode(null);
      setVerificationCode("");
      setFactorId(null);
    } catch (error: any) {
      toast.error("Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your admin account with TOTP-based MFA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrCode ? (
          <Button onClick={enrollMFA} disabled={loading}>
            <Key className="mr-2 h-4 w-4" />
            Setup MFA
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={qrCode} alt="MFA QR Code" className="border rounded-lg p-4" />
            </div>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
              <Button onClick={verifyAndEnable} disabled={loading || verificationCode.length !== 6} className="w-full">
                Verify and Enable
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminMFASetup;
