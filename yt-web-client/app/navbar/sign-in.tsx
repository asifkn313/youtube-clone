"use client";

import { User } from "firebase/auth";
import { signInWithGoogle, signOut } from "../firebase/firebase";

interface SignInProps {
  user: User | null;
}

const SignIn = ({ user }: SignInProps) => {
  return (
    <>
      {user ? (
        <button
          className="inline-block border border-gray-400 text-blue-600 px-5 py-2.5 rounded-3xl font-medium text-sm cursor-pointer hover:bg-blue-100 hover:border-transparent transition-colors"
          onClick={signOut}
        >
          Sign Out
        </button>
      ) : (
        <button
          className="inline-block border border-gray-400 text-blue-600 px-5 py-2.5 rounded-3xl font-medium text-sm cursor-pointer hover:bg-blue-100 hover:border-transparent transition-colors"
          onClick={signInWithGoogle}
        >
          Sign In
        </button>
      )}
    </>
  );
};

export default SignIn;
