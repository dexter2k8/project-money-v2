"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/Button";
import { CONTENT, OVERLAY } from "@/components/Modal/constants";
import { useSessionTimer } from "../providers/SessionTimerProvider";

export default function SessionExpiringModal() {
  const { remainingSeconds, isExpiringSoon, refreshSession } = useSessionTimer();
  const [loading, setLoading] = useState(false);

  if (!isExpiringSoon) return null;

  const handleRefresh = async () => {
    setLoading(true);
    await refreshSession();
    setLoading(false);
  };

  return createPortal(
    <div className={OVERLAY}>
      <div className={CONTENT} onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200">
          <h4>Session expiring</h4>
          <p className="text-sm text-gray-500 mt-1">
            Your session will expire in <span className="font-semibold">{remainingSeconds}s</span>.
          </p>
        </div>
        <div className="p-4 text-sm text-gray-600">
          Click &quot;Continue session&quot; to revalidate and stay signed in.
        </div>
        <div className="flex justify-end gap-4 p-4 border-t border-gray-200">
          <Button variant="primary" onClick={handleRefresh} loading={loading}>
            Continue session
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
