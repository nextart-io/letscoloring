"use client";
import Image from "next/image";
import { useCurrentAccount } from "@mysten/dapp-kit";

const ScreenElements = () => {
  const account = useCurrentAccount();
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
        src={"/images/head.gif"}
        alt={"head"}
        width={200}
        height={100}
        className="fixed bottom-1 left-1 scale-x-[-1]"
      ></Image>
      <Image
        src={"/images/head.gif"}
        alt={"head"}
        width={200}
        height={100}
        className="fixed bottom-1 right-1"
      ></Image>
      <div className="fixed w-1/3 p-10 left-1/3 bottom-20 rounded-3xl bg-red-100">
        <h1 className="text-center text-red-500">We need a Billboard Here</h1>
      </div>
    </div>
  );
};

export default ScreenElements;
