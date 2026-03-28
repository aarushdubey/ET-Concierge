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
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Inter:wght@300;400;500;600;700;800;900&family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500;6..72,600;6..72,700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: { "on-background": "#1d1b18", "outline": "#907067", "surface-dim": "#ded9d4", "surface-container": "#f2ede7", "surface-variant": "#e6e2dc", "on-tertiary-fixed": "#001e2e", "primary-fixed": "#ffdbd1", "on-error": "#ffffff", "inverse-primary": "#ffb5a0", "on-primary": "#ffffff", "surface": "#fef9f3", "inverse-on-surface": "#f5f0ea", "on-secondary": "#ffffff", "on-primary-container": "#541200", "on-primary-fixed-variant": "#862200", "error": "#ba1a1a", "primary": "#b02f00", "primary-container": "#ff5722", "on-error-container": "#93000a", "on-primary-fixed": "#3b0900", "tertiary": "#00628c", "on-surface": "#1d1b18", "on-tertiary-container": "#fcfcff", "surface-bright": "#fef9f3", "secondary": "#5f5e5e", "outline-variant": "#e4beb4", "inverse-surface": "#32302c", "tertiary-fixed-dim": "#86cfff", "primary-fixed-dim": "#ffb5a0", "secondary-container": "#e5e2e1", "surface-container-high": "#ece7e2", "secondary-fixed": "#e5e2e1", "on-secondary-container": "#656464", "background": "#fef9f3", "surface-container-low": "#f8f3ed", "on-secondary-fixed": "#1c1b1b", "on-tertiary-fixed-variant": "#004c6d", "surface-tint": "#b02f00", "on-tertiary": "#ffffff", "error-container": "#ffdad6", "surface-container-lowest": "#ffffff", "tertiary-container": "#007caf", "on-secondary-fixed-variant": "#474646", "surface-container-highest": "#e6e2dc", "secondary-fixed-dim": "#c9c6c5", "on-surface-variant": "#5b4039", "tertiary-fixed": "#c8e6ff" },
                fontFamily: { "headline": ["Playfair Display", "serif"], "body": ["DM Sans", "sans-serif"], "label": ["Manrope", "sans-serif"], "serif": ["Newsreader", "serif"] },
                borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"}
              }
            }
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
