import React from "react";
import NavBar from "@/components/navbar";
import { ToastProvider } from "@/components/ui/toast";
import { GameDataProvider } from "@/components/GameDataProvider";

const gameId =
  "0xda9f33ef073fec0ea3d97799ec158cd2d80fb3097b8e918571c69002067b9676";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <GameDataProvider gameId={gameId}>
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
