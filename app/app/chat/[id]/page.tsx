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
