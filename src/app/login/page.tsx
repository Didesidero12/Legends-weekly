'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from "@/components/app-logo";

import { useAuth, useFirestore, useUser } from '@/firebase/provider';
import { signInAnonymously } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useState, useEffect } from 'react'; // Add useState here

import { Input } from "@/components/ui/input";  // ← NEW
import { Label } from "@/components/ui/label";  // ← NEW
import { signInWithEmailAndPassword } from "firebase/auth";  // ← NEW

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [isUserLoading, user, router]);

  const handleAnonymousLogin = async () => {
    if (!auth || !firestore) return;
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;
      
      const userRef = doc(firestore, "users", user.uid);
      
      setDocumentNonBlocking(userRef, {
        displayName: `Guest User`,
        email: `guest_${user.uid}@example.com`,
        photoURL: `https://picsum.photos/seed/${user.uid}/32/32`
      }, { merge: true });

    } catch (error) {
      console.error("Error during anonymous login:", error);
    }
  };

  const handleDevLogin = async () => {
  if (!auth || !firestore) return;
  try {
    // Sign in anonymously first (required by Firebase)
    const result = await signInAnonymously(auth);
    
    // THIS IS THE KEY HACK: Use a FIXED UID every time for testing
    const fixedUID = "dev-test-user-12345";  // You can change this string

    // Create/update the user document with our fixed UID
    const userRef = doc(firestore, "users", fixedUID);
    await setDocumentNonBlocking(userRef, {
      displayName: "Dev Tester",
      email: "dev@legendsweekly.com",
      photoURL: "https://picsum.photos/seed/devtester/32/32"
    }, { merge: true });

    console.log("%cDEV MODE ACTIVE: Using fixed UID " + fixedUID, "color: lime; font-weight: bold");
    console.log("All leagues you create will now persist across refreshes!");

    // Redirect to dashboard
    router.push('/dashboard');
  } catch (error) {
    console.error("Dev login failed:", error);
  }
};

  if (isUserLoading || user) {
    return (
       <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

const handleEmailLogin = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    router.push('/dashboard');
  } catch (err: any) {
    toast({ variant: "destructive", title: "Login failed", description: err.message });
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AppLogo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your leagues
          </CardDescription>
        </CardHeader>
        <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={() => handleEmailLogin(email, password)} className="w-full">
            Sign In
          </Button>

          {/* Optional test button */}
          <Button 
            variant="outline" 
            onClick={() => handleEmailLogin("dev@legendsweekly.com", "test1234")}
          >
            [TEST] Dev Login
          </Button>
        </div>

        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="underline text-primary">
            Sign up
          </Link>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}