import type { Metadata } from "next";
import "./globals.css";
import Navbar from './components/Navbar'

export const metadata: Metadata = {
  title: "Sekai Sort",
  description: "A nextjs-based Project Sekai Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Huninn:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          backgroundImage: `url('/images/background.jpg')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center'
        }}
      >
      <div className="w-[100vw] h-[100vh] bg-light-blue/50 ">
        <Navbar />
        {children}
      </div>
      </body>
    </html>
  );
}
