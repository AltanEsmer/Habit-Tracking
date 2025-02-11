"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
  const { userId } = useAuth();
  const isAuth = !!userId;
  const router = useRouter();

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center">
      <div className="max-w-2xl p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Habit Tracker</h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        <p className="text-lg text-gray-600 mb-4">
          Welcome to Habit Tracker! Our app helps you build and maintain positive habits. Track your progress, set goals, and achieve more with personalized insights.
        </p>

        <div className="flex justify-center mb-6">
          {!isAuth ? (
            <>
              <SignInButton mode="modal">
                <Button className="mr-3">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign Up</Button>
              </SignUpButton>
            </>
          ) : (
            <Button size="lg" onClick={() => router.push("/MainPage")}>Go to Dashboard</Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">Track Your Habits</h2>
            <p className="text-gray-600">
              Easily log your daily habits and monitor your progress over time.
            </p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">Set Goals</h2>
            <p className="text-gray-600">
              Define your goals and stay motivated with reminders and insights.
            </p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">Analyze Progress</h2>
            <p className="text-gray-600">
              Get detailed reports and analytics to understand your habits better.
            </p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">Community Support</h2>
            <p className="text-gray-600">
              Join a community of like-minded individuals and share your journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
