import { NextResponse } from "next/server";

type Body = {
  transcript: { role: "agent" | "customer"; text: string }[];
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const apiKey = process.env.OPENAI_API_KEY;

  // ✅ Key yoksa mock skor döndür (demo yine çalışır)
  if (!apiKey) {
    return NextResponse.json({
      summary: "Müşteri teslimat sorunu yaşadı. Temsilci empati kurdu ve çözüm önerdi.",
      scores: { empathy: 7, procedure: 6, clarity: 8, closing: 7, overall: 7.0 },
      feedback: [
        "Empati cümlelerin iyi.",
        "Prosedür adımlarını daha net anlatabilirsin.",
        "Kapanışta net zaman taahhüdü vermen güven verir."
      ]
    });
  }

  const transcriptText = body.transcript
    .map((m) => `${m.role === "agent" ? "Temsilci" : "Müşteri"}: ${m.text}`)
    .join("\n");

  const systemPrompt = `
Sen bir çağrı merkezi eğitim koçusun.
Aşağıdaki konuşmayı değerlendir ve şu rubriğe göre puanla:
- empathy (0-10)
- procedure (0-10)
- clarity (0-10)
- closing (0-10)
- overall (ortalama)

Ayrıca:
- 2-3 cümle konuşma özeti
- 3 maddelik geliştirme geri bildirimi ver

Yanıtı şu JSON formatında ver:
{
 "summary": "...",
 "scores": { "empathy": 0, "procedure": 0, "clarity": 0, "closing": 0, "overall": 0 },
 "feedback": ["...","...","..."]
}
Sadece JSON d
