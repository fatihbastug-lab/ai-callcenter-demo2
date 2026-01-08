import { NextResponse } from "next/server";
import { scenarios } from "@/data/scenarios";

type Body = {
  scenarioId: string;
  history: { role: "agent" | "customer"; text: string }[];
  agentMessage: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const scenario = scenarios.find((s) => s.id === body.scenarioId);

  if (!scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // ✅ Key yoksa mock cevap (demo yine çalışır)
  if (!apiKey) {
    return NextResponse.json({
      customerReply: "Şu an gerçekten çok sinirliyim! Paketim nerede?",
      emotion: "angry",
      aiTips: {
        recommendedActions: [
          "Teslimat doğrulama kaydı aç",
          "İade/yeniden gönderim seçeneği sun"
        ],
        suggestedPhrases: [
          "Yaşadığınız durum için üzgünüm, hemen çözüyorum.",
          "Teslimat kaydında komşuya teslim görünüyor, birlikte doğrulayalım.",
          "Dilerseniz hemen yeniden gönderim başlatabilirim."
        ]
      }
    });
  }

  const model = "gpt-4o-mini";

  const systemPrompt = `
Sen bir çağrı merkezi rol-play simülatörüsün.
Senaryoya göre "Müşteri" rolündesin.

Senaryo: ${scenario.title}
Müşteri profili: ${scenario.customerProfile}

CRM:
- İsim: ${scenario.crm.customerName}
- Sipariş: ${scenario.crm.orderId}
- Durum: ${scenario.crm.status}
- Teslim alan: ${scenario.crm.deliveredTo ?? "Bilinmiyor"}

Görev:
1) Temsilcinin mesajına müşteri gibi doğal yanıt ver.
2) Ayrıca "AI yardımcı paneli" üret:
   - emotion: angry / neutral / calm
   - recommendedActions: 2-3 aksiyon
   - suggestedPhrases: 3 kısa cümle

Şu JSON formatında yanıt ver:
{
  "customerReply": "...",
  "emotion": "...",
  "aiTips": {
     "recommendedActions": ["..."],
     "suggestedPhrases": ["...","...","..."]
  }
}
Sadece JSON döndür.
  `.trim();

  const conversation = body.history
    .map((m) => `${m.role === "agent" ? "Temsilci" : "Müşteri"}: ${m.text}`)
    .join("\n");

  const userPrompt = `
Konuşma geçmişi:
${conversation}

Temsilcinin son mesajı:
${body.agentMessage}

Şimdi müşteri olarak cevap ver ve yardımcı paneli üret.
  `.trim();

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;

  try {
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json({
      customerReply: "Paketim ortada yok. Hemen çözüm istiyorum!",
      emotion: "angry",
      aiTips: {
        recommendedActions: ["Teslimat doğrulama kaydı aç", "İade/yeniden gönderim öner"],
        suggestedPhrases: [
          "Sizi anlıyorum, hemen yardımcı olacağım.",
          "Kayıtlardan teslimatı kontrol ediyorum.",
          "Dilerseniz yeniden gönderim başlatabilirim."
        ]
      }
    });
  }
}
