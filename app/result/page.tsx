"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("last_result");
    if (raw) setResult(JSON.parse(raw));
  }, []);

  if (!result) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
          <h1 className="text-xl font-bold">Sonuç bulunamadı</h1>
          <p className="text-gray-600 mt-2">Önce bir rol-play oturumu bitirmen gerekiyor.</p>
          <button
            className="mt-4 px-4 py-2 rounded bg-black text-white"
            onClick={() => router.push("/")}
          >
            Senaryolara Dön
          </button>
        </div>
      </main>
    );
  }

  const s = result.scores ?? {};

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold">Oturum Sonucu</h1>
        <p className="text-gray-600 mt-2">{result.summary}</p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {["empathy", "procedure", "clarity", "closing", "overall"].map((k) => (
            <div key={k} className="rounded-lg bg-gray-50 p-4">
              <div className="text-sm font-semibold capitalize">{k}</div>
              <div className="text-2xl font-bold mt-1">{s[k]}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="font-semibold">Geri Bildirim</h2>
          <ul className="list-disc ml-5 text-gray-700 mt-2 space-y-1">
            {(result.feedback ?? []).map((f: string, i: number) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        <button
          className="mt-6 px-4 py-2 rounded bg-black text-white hover:opacity-90"
          onClick={() => router.push("/")}
        >
          Yeni Senaryo Seç
        </button>
      </div>
    </main>
  );
}
