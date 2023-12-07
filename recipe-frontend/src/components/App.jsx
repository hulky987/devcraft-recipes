"use client";
import { SessionProvider } from "next-auth/react";
import {NavBar} from "../components/NavBar";

export default function App({ session, children }) {
  return <SessionProvider session={session}>
    {children}
  </SessionProvider>;
}
