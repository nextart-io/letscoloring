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

  const total_reward = (data?.total_reward as unknown as number) / 1000;

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

      <div className="fixed w-1/3 px-10 py-5 left-1/3 bottom-20 rounded-3xl bg-red-100 flex flex-col justify-center items-center">
        {total_reward > 0 && (
          <div className="text-red-500">Total Reward : {total_reward} FUD</div>
        )}
        {/* {account && (data?.unfilled_grid as unknown as number) < 1 && (
          <Button
            className="w-2/4 mt-2 rounded-full relative"
            onClick={settlement}
          >
            Settlement
            <Image
              src={"/images/arrow.gif"}
              alt={"arrow"}
              width={150}
              height={150}
              className="absolute -top-5 left-32 pointer-events-none"
            ></Image>
          </Button>
        )} */}
      </div>
    </div>
  );
};

export default ScreenElements;
