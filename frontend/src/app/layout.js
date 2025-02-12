import "./globals.css";

import { Navbar } from "@/components/Layout/Navbar";
import { Providers } from "./providers";

// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          <Navbar />
          <main className="pt-16"> {/* Add padding-top to account for fixed navbar */}
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}