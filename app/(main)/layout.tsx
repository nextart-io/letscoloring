import React from "react";
import NavBar from "@/components/navbar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col space-y-20 mx-24 mt-10">
      <NavBar></NavBar>
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;
