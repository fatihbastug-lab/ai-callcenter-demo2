"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { scenarios } from "@/data/scenarios";

type Msg = { role: "agent" | "customer"; text: string };

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const scenario = useMemo(() => scenarios.find((s) => s.id === params.id), [params.id]);

  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [emotion, setEmotion] = useState("neutral");
  const [aiTips, setAiTips] = useState<{ recommendedActions?: string[]; suggestedPhrases?: string[] }>({});

  useEffect(() => {
    if (scenario) {
      setHistory([{ role: "customer", text: scenario.initialCustomerMessage }]);
      setAiTips({
        recommendedActions: ["Müşteriyi sakinleştir", "Kayıtları kontrol et"],
        suggestedPhrases: [
          "Yaşadığınız durum için üzgünüm, hemen yardımcı olacağım.",
          "Sistemde siparişinizi kontrol ediyorum.",
          "Sizin için en hızlı çözümü sunacağım."
        ]
      });
    }
  }, [scenario]);

  if (!scenario) return <div className="p-8">Senaryo bulunamadı.</div>;

  async function sendMessage() {
    if (!input.trim()) return;

    const agentMsg: Msg = { role: "agent", text: input.trim() };
    const newHistory = [...history, agentMsg];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenarioId: scenario.id,
        history: newHistory,
        agentMessage: agentMsg.text
      })
    });

    const data = await resp.json();
    const customerMsg: Msg = { role: "customer", text: data.customerReply };
    setHistory((prev) => [...prev, customerMsg]);
    setEmotion(data.emotion ?? "neutral");
    setAiTips(data.aiTips ?? {});
    setLoading(false);
  }

  async function endSession() {
    const resp = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: history })
    });
    const result = await resp.json();
    localStorage.setItem("last_result", JSON.stringify(result));
    router.push("/result");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-[2fr_1fr]">
        {/* Chat */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col h-[80vh]">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h1 className="font-semibold">{scenario.title}</h1>
              <p className="text-sm text-gray-600">
                Müşteri: {scenario.crm.customerName} • Sipariş: {scenario.crm.orderId}
              </p>
            </div>

            <button
              onClick={endSession}
              className="px-3 py-2 rounded bg-black text-white text-sm hover:opacity-90"
            >
              Oturumu Bitir (Skor)
            </button>
          </div>

          <div className="flex-1 overflow-auto mt-3 space-y-3 pr-2">
            {history.map((m, idx) => (
              <div key={idx} className={m.role === "agent" ? "text-right" : "text-left"}>
                <div
                  className={[
                    "inline-block max-w-[80%] px-3 py-2 rounded-2xl text-sm",
                    m.role === "agent" ? "bg-black text-white" : "bg-gray-100 text-gray-900"
                  ].join(" ")}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-left">
                <div className="inline-block bg-gray-100 px-3 py-2 rounded-2xl text-sm">
                  Yazıyor...
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2 text-sm"
              placeholder="Temsilci mesajını yaz..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="px-4 py-2 rounded bg-black text-white text-sm hover:opacity-90"
              onClick={sendMessage}
            >
              Gönder
            </button>
          </div>
        </div>

        {/* AI Panel */}
        <div className="bg-white rounded-xl shadow p-4 h-[80vh] overflow-auto">
          <h2 className="font-semibold mb-2">AI Yardımcı Panel</h2>

          <div className="rounded-lg bg-gray-50 p-3 mb-4">
            <div className="text-sm font-semibold">CRM</div>
            <div className="text-sm text-gray-700 mt-1">
              <div><b>İsim:</b> {scenario.crm.customerName}</div>
              <div><b>Sipariş:</b> {scenario.crm.orderId}</div>
              <div><b>Durum:</b> {scenario.crm.status}</div>
              {scenario.crm.deliveredTo && <div><b>Teslim Alan:</b> {scenario.crm.deliveredTo}</div>}
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 mb-4">
            <div className="text-sm font-semibold">Duygu Durumu</div>
            <div className="text-sm mt-1">
              <span className="px-2 py-1 rounded bg-white border">{emotion}</span>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 mb-4">
            <div className="text-sm font-semibold">Önerilen Aksiyonlar</div>
            <ul className="list-disc ml-5 text-sm text-gray-700 mt-2 space-y-1">
              {(aiTips.recommendedActions ?? []).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-sm font-semibold">Önerilen Cümleler</div>
            <div className="mt-2 space-y-2">
              {(aiTips.suggestedPhrases ?? []).map((p, i) => (
                <button
                  key={i}
                  onClick={() => setInput((prev) => (prev ? prev + " " + p : p))}
                  className="w-full text-left text-sm px-3 py-2 rounded bg-white border hover:bg-gray-100"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
