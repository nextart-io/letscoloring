"use client";

import React, { useState } from "react";
import { keys, shuffle } from "lodash";
import {
  ConnectModal,
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { StartNewGame, getGameInfo,} from "@/api";
import { colorConfig } from "@/lib/config";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";

function StartGame() {
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
  const currentAccount = useCurrentAccount();
  const { showToast } = useToast();
  const router = useRouter();

  const [openConnect, setOpenConnect] = useState(false);

  const handleStartGame = () => {
      if (!currentAccount) {
        setOpenConnect(true);
        return;
      }
    
    // 创建 4 * 4 格子，随机 3 个颜色
    const txb: TransactionBlock  = StartNewGame(
      "1000",
      "4",
      "4",
      shuffle(keys(colorConfig)).slice(0, 3)
    );

    signAndExecuteTransactionBlock(
      {
        transactionBlock: txb,
        options: {
          showEvents: true,
        },
      },
      {
        onSuccess: (res: any) => {
          showToast("Lets Gaming !")
          // const game_address = res.events[0]?.parsedJson?.game_address;

          // if (game_address) {
          //   getGameInfo(client, game_address).then((res2) => {
          //     showToast("Lets Gaming !");
          //     const gameId = res2.data?.objectId;

          //     console.log("res2===>", res2, gameId);
          //     router.replace(`/${gameId}`);
          //   });
          // }
        },
        onError: (err) => {
          showToast("Tx Failed!");
          console.log(err);
        },
      }
    );
  };

  return (
    currentAccount?.address=="0x2eb40a1c825b4ead061e8cc6be55a9a010a81a31cef89a23cbdfaee8ade6cf1c"&&
    <ConnectModal
      trigger={
        <div
          className="flex justify-center items-center"
        >
          <div
            className="text-4xl font-bold cursor-pointer"
            style={{ color: "#ff9800" }}
            onClick={handleStartGame}
          >
            Start Game
          </div>
        </div>
      }
      open={currentAccount ? false : openConnect}
      onOpenChange={setOpenConnect}
    />
  );
}

export default StartGame;
