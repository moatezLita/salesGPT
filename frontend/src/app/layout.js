// app/layout.js
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { SupabaseProvider } from '@/lib/supabase/context'
import { Providers } from "./providers"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <SupabaseProvider>
          <Providers>
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
          </Providers>
        </SupabaseProvider>
      </body>
    </html>
  )
}