'use client';

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

const NavBar = () => {
  const account = useCurrentAccount();
  return (
    <div className="w-full flex justify-end">
      <div className="flex w-1/4 flex-col">
        <nav className="flex items-center m-5 p-2 rounded-3xl bg-red-100">
          <div className="ml-auto">
            <ConnectButton />
          </div>
        </nav>
        <div className="h-96 bg-red-100 rounded-3xl m-5"></div>
      </div>
    </div>
  );
};

export default NavBar;
