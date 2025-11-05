import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MediRate - Hospital Quality Rating System",
  description: "Secure, privacy-preserving hospital quality rating system powered by FHEVM technology",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-gray-900 antialiased">
        {/* Medical background */}
        <div className="fixed inset-0 w-full h-full medical-bg z-[-20]"></div>

        <main className="flex flex-col max-w-screen-xl mx-auto pb-20 min-h-screen">
          {/* Medical header */}
          <nav className="flex w-full px-4 md:px-6 h-fit py-8 justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Medical cross icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-medical-green-500 to-medical-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="relative">
                  <div className="w-6 h-1 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="w-1 h-6 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-medical-green-800">MediRate</span>
                <span className="text-sm text-medical-green-600 font-medium">Hospital Quality Rating</span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-medical-green-50 rounded-full border border-medical-green-200">
              <div className="w-2 h-2 bg-medical-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-medical-green-700">Privacy Protected</span>
            </div>
          </nav>

          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
