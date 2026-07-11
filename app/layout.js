import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "Achievers Law Hub",
  description: "Legal education, verified and cited.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body">
        <Nav />
        <main>{children}</main>
        <footer className="border-t border-parchment2 mt-10">
          <div className="max-w-6xl mx-auto px-5 py-8 text-center text-sm font-ui text-sage flex flex-col items-center gap-2">
            <span>Achievers Law Hub — legal education, verified and cited.</span>
            <a href="/admin" className="underline decoration-dotted">Administration</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
