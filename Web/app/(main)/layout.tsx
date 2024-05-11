import React from "react";
import NavBar from "@/components/navbar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="">
      <NavBar></NavBar>
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;
