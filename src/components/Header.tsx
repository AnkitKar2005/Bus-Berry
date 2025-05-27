
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"customer" | "operator" | "admin">("customer");
  const navigate = useNavigate();

  const handleLogin = (role: "customer" | "operator" | "admin") => {
    setIsLoggedIn(true);
    setUserRole(role);
    if (role === "operator") navigate("/operator");
    if (role === "admin") navigate("/admin");
  };

  return (
    <header className="bg-background shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🚌</span>
            </div>
            <span className="text-2xl font-bold text-foreground">BusBooker</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/search" className="text-muted-foreground hover:text-primary transition-colors">
              Search
            </Link>
            {isLoggedIn && userRole === "operator" && (
              <Link to="/operator" className="text-muted-foreground hover:text-primary transition-colors">
                Operator Panel
              </Link>
            )}
            {isLoggedIn && userRole === "admin" && (
              <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link to="/account">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    My Account
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsLoggedIn(false)}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Login to BusBooker</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="customer" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="customer">Customer</TabsTrigger>
                      <TabsTrigger value="operator">Operator</TabsTrigger>
                      <TabsTrigger value="admin">Admin</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="customer" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" placeholder="Enter your email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Enter password" />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleLogin("customer")}
                      >
                        Login as Customer
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="operator" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="operator-email">Email</Label>
                        <Input id="operator-email" placeholder="Enter your email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="operator-password">Password</Label>
                        <Input id="operator-password" type="password" placeholder="Enter password" />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleLogin("operator")}
                      >
                        Login as Operator
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="admin" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Email</Label>
                        <Input id="admin-email" placeholder="Enter your email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <Input id="admin-password" type="password" placeholder="Enter password" />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleLogin("admin")}
                      >
                        Login as Admin
                      </Button>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
