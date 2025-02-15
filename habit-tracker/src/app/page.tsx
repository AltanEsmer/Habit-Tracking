"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const { userId } = useAuth();
  const { user } = useUser();
  const isAuth = !!userId;
  const router = useRouter();

  useEffect(() => {
    const syncUserData = async () => {
      if (!userId || !user) return;

      try {
        // 🔹 Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching user:", fetchError);
          return;
        }

        if (!existingUser) {
          // 🔹 Insert new user (handling unique constraint)
          const { error: insertError } = await supabase.from("users").insert([
            {
              user_id: userId,
              name: user.fullName || user.username || "Anonymous",
            },
          ]);

          if (insertError) {
            console.error("Error inserting user data:", insertError.message);
          }
        } else {
          // 🔹 Update existing user
          const { error: updateError } = await supabase
            .from("users")
            .update({ name: user.fullName || user.username || "Anonymous" })
            .eq("user_id", userId);

          if (updateError) {
            console.error("Error updating user data:", updateError.message);
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    if (isAuth) {
      syncUserData();
    }
  }, [isAuth, userId, user]);

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-emerald-100 via-teal-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="max-w-4xl p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Habit Tracker
          </h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          Welcome to Habit Tracker! Transform your daily routines into lasting positive changes. 
          Our intuitive platform helps you build and maintain meaningful habits while providing 
          insightful analytics to track your journey.
        </p>

        <div className="flex justify-center mb-12">
          {!isAuth ? (
            <>
              <SignInButton mode="modal">
                <Button className="mr-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 py-6 text-lg">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-white text-emerald-600 border-2 border-emerald-500 hover:bg-emerald-50 px-8 py-6 text-lg">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          ) : (
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-12 py-6 text-lg"
              onClick={() => router.push("/MainPage")}
            >
              Go to Dashboard
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard 
            title="Track Your Habits"
            description="Easily log your daily habits and monitor your progress over time with our intuitive tracking system."
            icon="📊"
          />
          <FeatureCard 
            title="Set Goals"
            description="Define your goals and stay motivated with smart reminders and personalized insights."
            icon="🎯"
          />
          <FeatureCard 
            title="Analyze Progress"
            description="Get detailed reports and analytics to understand your habits better and optimize your routine."
            icon="📈"
          />
          <FeatureCard 
            title="Community Support"
            description="Join a community of like-minded individuals and share your journey to success."
            icon="🤝"
          />
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: string }) => (
  <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
    <div className="text-4xl mb-4">{icon}</div>
    <h2 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h2>
    <p className="text-gray-600 leading-relaxed">
      {description}
    </p>
  </div>
);