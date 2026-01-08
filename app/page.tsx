"use client";

import { scenarios } from "@/data/scenarios";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-2">AI Destekli Çağrı Merkezi Rol-Play (Demo)</h1>
      <p className="text-gray-600 mb-6">Bir senaryo seçip role-play’e başlayın.</p>

      <div className="grid gap-4 md:grid-cols-2">
        {scenarios.map((s) => (
          <div key={s.id} className="bg-white rounded-xl p-5 shadow">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{s.title}</h2>
              <span className="text-sm px-2 py-1 rounded bg-gray-100">{s.difficulty}</span>
            </div>
            <p className="text-gray-600 mt-2">{s.description}</p>

            <button
              className="mt-4 px-4 py-2 rounded bg-black text-white hover:opacity-90"
              onClick={() => router.push(`/chat/${s.id}`)}
            >
              Başla
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
