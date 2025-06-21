
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BusRegistrationForm from '@/components/BusRegistrationForm';
import OperatorBusList from '@/components/OperatorBusList';
import OperatorEarnings from '@/components/OperatorEarnings';
import { Bus, Plus, Wallet, List } from 'lucide-react';

const OperatorDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Operator Dashboard</h1>
        <p className="text-muted-foreground">Manage your buses, routes, and earnings</p>
      </div>

      <Tabs defaultValue="buses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buses" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            My Buses
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Register Bus
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Earnings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buses">
          <OperatorBusList />
        </TabsContent>

        <TabsContent value="register">
          <BusRegistrationForm />
        </TabsContent>

        <TabsContent value="earnings">
          <OperatorEarnings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperatorDashboard;
