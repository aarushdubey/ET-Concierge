import "./globals.css";

export const metadata = {
  title: "ET Concierge — Your Personal AI Guide to Economic Times",
  description:
    "AI-powered concierge that understands your financial profile and guides you through the entire ET ecosystem — ET Prime, ET Markets, masterclasses, events, and more.",
  keywords: "ET, Economic Times, AI Concierge, Financial Guide, ET Prime, ET Markets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
