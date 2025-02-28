"use client";
export const dynamic = 'force-dynamic';

import React from "react";
import PageWrapper from "@/components/PageWrapper";
import UpdateProfile from "@/components/UpdateProfile";
import { useAuth } from "@/context/AuthContext";
import ClientOnly from "@/components/ClientOnly";

export default function ProfilePage() {
  const session = useAuth();
  if (!session.authState.user) {
    return null;
  }

  return (
    <PageWrapper>
      <ClientOnly fallback={<div>Loading profile...</div>}>
        <div className="container mx-auto p-4">
          <UpdateProfile userId={session.authState.user.uid} />
        </div>
      </ClientOnly>
    </PageWrapper>
  );
}