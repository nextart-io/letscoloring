import React from "react";
import NavBar from "@/components/navbar";
import { ToastProvider } from "@/components/ui/toast";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <div className="">
        <div className="flex justify-end">
          <NavBar></NavBar>
        </div>
        <main>{children}</main>
      </div>
    </ToastProvider>
  );
};

export default MainLayout;
