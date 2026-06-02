import type { Metadata } from "next";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import AppProviders from "@/components/providers/app-providers";
import AppShell from "@/components/app-shell/app-shell";

export const metadata: Metadata = {
  title: "Clasificador de Hojas de Vida",
  description: "Frontend para la preselección de candidatos mediante hojas de vida",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
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