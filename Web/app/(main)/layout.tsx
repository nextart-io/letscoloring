import React from "react";
import NavBar from "@/components/navbar";
import { ToastProvider } from "@/components/ui/toast";
import { GameDataProvider } from "@/components/GameDataProvider";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <GameDataProvider>
        <div className="">
          <div className="flex justify-end">
            <NavBar></NavBar>
          </div>
          <main>{children}</main>
        </div>
      </GameDataProvider>
    </ToastProvider>
  );
};

export default MainLayout;
