"use client"; // This tells Next.js this is a client-side component

import { useEffect } from "react";

export default function AuthInitializer() {
  useEffect(() => {
    // Only runs on the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const guestId = localStorage.getItem("guest_id");

      if (!token && !guestId) {
        const newGuestId = "guest_" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("guest_id", newGuestId);
        console.log("Guest ID Created:", newGuestId);
      }
    }
  }, []);

  return null; // This component doesn't render anything visible
}