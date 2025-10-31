
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Wallet, TrendingUp, Download } from 'lucide-react';

interface Earning {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  withdrawn_at: string | null;
  booking_id: string | null;
}

const OperatorEarnings = () => {
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [availableForWithdraw, setAvailableForWithdraw] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('operator_earnings')
        .select('*')
        .eq('operator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEarnings(data || []);
      
      const total = data?.reduce((sum, earning) => sum + earning.amount, 0) || 0;
      const available = data?.filter(e => e.status === 'pending').reduce((sum, earning) => sum + earning.amount, 0) || 0;
      
      setTotalEarnings(total);
      setAvailableForWithdraw(available);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch earnings data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    if (amount > availableForWithdraw) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive"
      });
      return;
    }

    setIsWithdrawing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find pending earnings to mark for withdrawal request
      const { data: pendingEarnings, error: fetchError } = await supabase
        .from('operator_earnings')
        .select('*')
        .eq('operator_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      let remainingAmount = amount;
      const earningsToUpdate = [];

      for (const earning of pendingEarnings || []) {
        if (remainingAmount <= 0) break;
        
        if (earning.amount <= remainingAmount) {
          earningsToUpdate.push(earning.id);
          remainingAmount -= earning.amount;
        }
      }

      // Mark earnings as pending_review instead of withdrawn
      // This creates a withdrawal request that requires admin approval
      const { error: updateError } = await supabase
        .from('operator_earnings')
        .update({ 
          status: 'pending_review'
        })
        .in('id', earningsToUpdate);

      if (updateError) throw updateError;

      toast({
        title: "Withdrawal Request Submitted",
        description: `₹${amount.toFixed(2)} withdrawal request has been submitted for admin review. You will be notified once approved and processed.`
      });

      setWithdrawAmount('');
      fetchEarnings();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Available</Badge>;
      case 'pending_review':
        return <Badge variant="outline">Under Review</Badge>;
      case 'withdrawn':
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available for Withdraw</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{availableForWithdraw.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawn</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalEarnings - availableForWithdraw).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Form */}
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="withdrawAmount">Amount to Withdraw (₹)</Label>
              <Input
                id="withdrawAmount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={availableForWithdraw}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Available: ₹{availableForWithdraw.toFixed(2)}
              </p>
            </div>
            <Button 
              onClick={handleWithdraw} 
              disabled={isWithdrawing || !withdrawAmount || availableForWithdraw === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              {isWithdrawing ? 'Processing...' : 'Withdraw'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading earnings...</p>
          ) : earnings.length === 0 ? (
            <p className="text-muted-foreground">No earnings yet</p>
          ) : (
            <div className="space-y-4">
              {earnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">₹{earning.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(earning.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {earning.withdrawn_at && (
                      <p className="text-xs text-muted-foreground">
                        Withdrawn: {new Date(earning.withdrawn_at).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(earning.status)}
                    {earning.booking_id && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Booking: {earning.booking_id.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorEarnings;
