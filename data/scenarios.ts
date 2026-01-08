export type Scenario = {
  id: string;
  title: string;
  difficulty: "Kolay" | "Orta" | "Zor";
  description: string;
  customerProfile: string;
  crm: {
    customerName: string;
    orderId: string;
    status: string;
    deliveredTo?: string;
  };
  goals: string[];
  initialCustomerMessage: string;
};

export const scenarios: Scenario[] = [
  {
    id: "SEN-001",
    title: "Teslimat Sorunu (Öfkeli Müşteri)",
    difficulty: "Orta",
    description: "Teslim edildi görünen ürün ortada yok.",
    customerProfile: "Öfkeli, sabırsız, hızlı çözüm istiyor.",
    crm: {
      customerName: "Ayşe K.",
      orderId: "458921",
      status: "Teslim edildi",
      deliveredTo: "Komşu: Ahmet Y."
    },
    goals: [
      "Empati kur",
      "Teslimat doğrulama süreci başlat",
      "İade veya yeniden gönderim öner",
      "Net kapanış yap"
    ],
    initialCustomerMessage:
      "Merhaba. Siparişim teslim edildi görünüyor ama bana ulaşmadı! Bu nasıl iş?"
  }
];
