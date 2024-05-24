"use client";
import Image from "next/image";
import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Settlement } from "@/api";
import { useGameData } from "./GameDataProvider";

const ScreenElements = () => {
  const account = useCurrentAccount();
  const { data, fetchData } = useGameData();
  const { showToast } = useToast();
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  // 结算
  const settlement = () => {
    if ((data?.unfilled_grid as unknown as number) < 1) {
      const txb = Settlement(data?.id as string);
      signAndExecuteTransactionBlock(
        {
          transactionBlock: txb,
          options: {},
        },
        {
          onSuccess: () => {
            fetchData();
            showToast("Success !");
          },
          onError: (err) => {
            showToast("Tx Failed!");
            console.log(err);
          },
        }
      );
    }
  };

  return (
    <div className="relative">
      <Image
        src={"/images/title.png"}
        alt={"title"}
        width={1103 / 2}
        height={508 / 2}
        className="fixed top-20 left-10 animate-bounce"
      ></Image>
      {!account && (
        <Image
          src={"/images/arrow.gif"}
          alt={"arrow"}
          width={150}
          height={150}
          className="fixed top-3 right-1 pointer-events-none"
        ></Image>
      )}
      <Image
        src={"/images/man.gif"}
        alt={"man"}
        width={300}
        height={300}
        className="fixed top-1/3 left-10 scale-x-[-1]"
      ></Image>
      <Image
        src={"/images/peach.webp"}
        alt={"peach"}
        width={200}
        height={100}
        className="fixed bottom-1 left-5 animate-pulse"
      ></Image>
      <Image
        src={"/images/head.gif"}
        alt={"head"}
        width={200}
        height={100}
        className="fixed bottom-1 right-1"
      ></Image>
      {(data?.unfilled_grid as unknown as number) < 1 && (
        <div className="fixed w-1/3 p-10 left-1/3 bottom-20 rounded-3xl bg-red-100 flex justify-center items-center">
          <Button className="w-2/4 rounded-full" onClick={settlement}>
            Settlement
          </Button>
        </div>
      )}
    </div>
  );
};

export default ScreenElements;
