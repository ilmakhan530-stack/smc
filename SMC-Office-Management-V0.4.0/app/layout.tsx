import "./globals.css";
export const metadata = { title: "SMC Office Management System", description: "SMC Office Management System" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
