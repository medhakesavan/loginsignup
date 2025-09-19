import { useState } from "react";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-black via-gray-900 to-black overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] bg-purple-600 opacity-30 rounded-full blur-3xl animate-pulse -top-40 -left-40"></div>
        <div className="absolute w-[600px] h-[600px] bg-blue-600 opacity-30 rounded-full blur-3xl animate-pulse -bottom-40 -right-40"></div>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-sm bg-black bg-opacity-60 backdrop-blur-lg rounded-xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>

        <form className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-700" />
          <span className="text-gray-400 px-2">OR</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        {/* Google Button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 font-medium py-2 rounded-lg border hover:bg-gray-100 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Toggle Auth */}
        <p className="text-center text-gray-400 mt-6">
          {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
