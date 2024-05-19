"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useGameData } from "./GameDataProvider";

const NavBar = () => {
  const account = useCurrentAccount();
  const gamedata = useGameData();
  return (
    <div className="w-full flex justify-end">
      <div className="flex m-5 p-2 h-16 gap-2">
        {gamedata?.data?.filled_by_color &&
          Object.entries(gamedata?.data?.filled_by_color!).map(
            ([color, count]) => {
              return (
                <div
                  key={color}
                  className="flex items-center p-2 rounded-3xl bg-red-100"
                >
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: `${color}` }}
                  ></div>
                  <span className="ml-2">{count}</span>
                </div>
              );
            }
          )}
      </div>
      <div className="flex w-1/4 flex-col">
        <nav className="flex items-center m-5 p-2 rounded-3xl bg-red-100">
          <h1 className="ml-5 text-red-500">We need a Logo</h1>
          <div className="ml-auto">
            <ConnectButton />
          </div>
        </nav>
        <div
          className="bg-red-100 rounded-3xl m-5 px-5 py-5 text-lg tracking-widest space-y-5"
          style={{ color: "#ff9800" }}
        >
          <h1 className="text-red-500">How to Play</h1>
          <p>1.choise a gird</p>
          <p>2.pick a color you love</p>
          <p>
            3.at the end of the game, the color with the most filled grids will
            share 70% of the reward, while the color with the fewest filled
            grids will share the remaining 30%. The distribution is based on the
            number of filled grids, not user addresses, so if a user fills
            multiple grids, the reward will be calculated based on the number of
            grids they filled.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
