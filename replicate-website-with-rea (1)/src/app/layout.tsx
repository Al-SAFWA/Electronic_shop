import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import CartProvider from "@/components/CartProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { I18nProvider } from "@/components/I18nProvider";
import { getI18n } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const { l } = await getI18n();
  return {
    title: l("لوبت | هواتف وحواسيب وأجهزة مجددة ومعتمدة في موريتانيا", "Loopt | Téléphones, ordinateurs et tech reconditionnés en Mauritanie"),
    description: l(
      "تسوق آيفون وسامسونج وحواسيب وأجهزة لوحية مجددة ومعتمدة. فحص من 60 نقطة، ضمان 12 شهراً، وتوصيل سريع. اطلب عبر واتساب.",
      "Achetez iPhone, Samsung, ordinateurs et tablettes reconditionnés certifiés. Contrôle en 60 points, garantie 12 mois et livraison rapide. Commandez sur WhatsApp.",
    ),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { lang, dir } = await getI18n();
  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Montserrat:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <I18nProvider lang={lang}>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
