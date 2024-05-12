import React from "react";
import NavBar from "@/components/navbar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="">
      <div className="flex justify-end">
        <NavBar></NavBar>
      </div>
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;
