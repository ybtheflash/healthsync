"use client";
import React from "react";
import PageWrapper from "@/components/PageWrapper";
import UpdateProfile from "@/components/UpdateProfile";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const session = useAuth()
  if(!session.authState.user) {
    return ;
  } // Replace with actual user ID

  return (
    <PageWrapper>
      <div className="container mx-auto p-4">
        <UpdateProfile userId={session.authState.user.uid} />
      </div>
    </PageWrapper>
  );
}