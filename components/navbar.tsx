'use client';

import { ConnectButton } from "@mysten/dapp-kit";

const NavBar = () => {
  return (
    <nav className="flex p-6 border-4 rounded-3xl border-foreground">
      <aside className="font-bold basis-1/4">
        <h1 className="text-4xl">{"Let's Coloring !!!"}</h1>
      </aside>
      <div className="ml-auto">
        <ConnectButton />
      </div>
    </nav>
  );
};

export default NavBar;
