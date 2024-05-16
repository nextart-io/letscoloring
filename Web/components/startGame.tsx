"use client";

import React, { useState } from "react";
import { keys, take } from "lodash";
import {
  ConnectModal,
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { StartNewGame, getGameInfo } from "@/api";
import { colorConfig } from "@/lib/config";
import { useToast } from "@/components/ui/toast";

import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";

function StartGame() {
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
  const currentAccount = useCurrentAccount();
  const { showToast } = useToast();

  const client = new SuiClient({ url: getFullnodeUrl("testnet") });

  const [openConnect, setOpenConnect] = useState(false);

  const handleStartGame = () => {
    if (!currentAccount) {
      setOpenConnect(true);
      return;
    }

    const txb: any = StartNewGame(
      "10000000",
      "3",
      "3",
      take(keys(colorConfig), 5)
    );

    signAndExecuteTransactionBlock(
      {
        transactionBlock: txb,
        options: {
          showEffects: true,
          showBalanceChanges: true,
          showEvents: true,
          showInput: true,
          showObjectChanges: true,
          showRawInput: true,
        },
      },
      {
        onSuccess: (res) => {
          const { effects } = res;

          showToast("Lets Gaming !");

          if (effects && effects.created && effects.created.length > 1) {
            getGameInfo(client, effects?.created[1].reference.objectId).then(
              (res2) => {
                console.log(res2);
              }
            );
          }
        },
        onError: (err) => {
          showToast("Tx Failed!");
          console.log(err);
        },
      }
    );
  };

  return (
    <ConnectModal
      trigger={
        <div
          className="flex justify-center items-center"
          style={{ marginTop: "-20%" }}
        >
          <div
            className="text-2xl font-bold cursor-pointer"
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
