"use client";

import { testInsertion } from "@/app/actions";
import { useState } from "react";

export default function TestInsertButton() {
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await testInsertion();
      alert(res.message);
    } catch (err) {
      alert("Fatal error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleTest}
      disabled={loading}
      className="mt-4 text-xs text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest font-bold"
    >
      {loading ? "Testing..." : "Debug: Test Prisma Insertion"}
    </button>
  );
}
