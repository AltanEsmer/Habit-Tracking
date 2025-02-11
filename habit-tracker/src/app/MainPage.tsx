"use client";

export default function MainPage() {
  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
      <div className="max-w-2xl p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to the Main Page!</h1>
        <p className="text-lg text-gray-600">
          This is your main dashboard where you can manage your habits and track your progress.
        </p>
      </div>
    </div>
  );
}