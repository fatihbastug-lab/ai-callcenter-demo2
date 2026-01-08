import "./globals.css";

export const metadata = {
  title: "AI Callcenter Roleplay Demo",
  description: "AI destekli çağrı merkezi rol-play demo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
