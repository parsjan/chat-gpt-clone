"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useUserStore } from "@/store/useUserStore";

export function UserSync() {
  const { user } = useUser();
  const setUserId = useUserStore((state) => state.setUserId);

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    } else {
      setUserId(null);
    }
  }, [user, setUserId]);

  return null; // no UI, just syncing
}
