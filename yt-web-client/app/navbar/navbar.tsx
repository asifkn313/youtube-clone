"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SignIn from "./sign-in";
import { onAuthStateChangedHelper } from "../firebase/firebase";
import { User } from "firebase/auth";
import Upload from "./upload";

const NavBar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  });

  return (
    <nav className="flex justify-between items-center p-4">
      <Link href="/">
        <Image
          width={90}
          height={20}
          src="/youtube-logo.svg"
          alt="YouTube Logo"
        />
      </Link>
      {user && <Upload />}
      <SignIn user={user} />
    </nav>
  );
};

export default NavBar;
