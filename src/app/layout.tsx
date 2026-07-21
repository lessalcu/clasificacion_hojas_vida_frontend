import type { Metadata } from "next";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "react-toastify/dist/ReactToastify.css";

import "./globals.css";

import AppShell from "@/components/app-shell/app-shell";
import AppProviders from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: "Clasificador de Hojas de Vida",
  description:
    "Sistema web para la evaluación, clasificación y ranking automático de hojas de vida.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="es">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
};

export default RootLayout;
