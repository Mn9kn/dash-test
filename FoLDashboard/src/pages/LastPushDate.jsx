import React, { useEffect, useState } from "react";

const LastPushDate = () => {
  const [lastPush, setLastPush] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLastPush = async () => {
      try {
        const res = await fetch("/last-push.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const { last_push } = await res.json();
        setLastPush(new Date(last_push));
      } catch (err) {
        console.error(err);
        setError("Unavailable");
      }
    };
    fetchLastPush();
  }, []);

  return (
    <div className="text-gray-700 text-sm">
      <span className="font-medium">Last update:</span>{" "}
      {error
        ? error
        : lastPush
        ? lastPush.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            // hour: "2-digit",
            // minute: "2-digit",
          })
        : "Loading…"}
    </div>
  );
};

export default LastPushDate;
