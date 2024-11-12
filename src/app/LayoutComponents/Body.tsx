'use client';
import "@/app/globals.css";
import Nav from "./header/Nav";
import Main from "@/app/LayoutComponents/main/Main";
import Footer from "./footer/Footer";
import StoreProvider from "../StoreProvider";
import dynamic from "next/dynamic";
import TokenCheckWrapper from "../components/TokenCheckWrapper";

// Dynamically import SiteContent component with ssr: false (for client-side rendering)
const DynamicContent = dynamic(() => import("@/app/LayoutComponents/SiteContent"), {
  ssr: false,
});

export default function Body({ children }: { children: React.ReactNode }) {
  return (
    <body>
      <StoreProvider>
        <TokenCheckWrapper>
        <div className="min-h-screen merriweather-regular flex flex-col">
          <DynamicContent>
            <header className="bg-gray-950 fixed top-0 w-full max-h-fit z-10">
              <Nav />
            </header>

            {/* Main content should take the remaining space */}
            <main className="flex-grow bg-slate-950 pt-[60px] overflow-auto flex-1 flex flex-col items-center justify-center"> {/* Adjust padding to account for fixed header */}
              <Main>{children}</Main>
            </main>

            <footer className="bg-slate-900 max-h-fit">
              <Footer />
            </footer>
          </DynamicContent>
        </div>
        </TokenCheckWrapper>
      </StoreProvider>
    </body>
  );
}
