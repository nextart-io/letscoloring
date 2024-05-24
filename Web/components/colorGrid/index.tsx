"use client";

import React, { useState, useEffect } from "react";
import { map } from "lodash";
import {
  useSuiClient,
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { useToast } from "@/components/ui/toast";
import { FillGrid, FillGridUsingCustomToken } from "@/api";
import ColorItem from "./components/colorItem";
import PickColor from "./components/pickColor";
import styles from "./index.module.css";
import { useGameData } from "../GameDataProvider";

function ColorGrid() {
  const [openColor, setOpenColor] = useState(false);
  const [gridList, setGridList] = useState<string[][]>([]);
  const [gridRowCol, setGridRowCol] = useState<string[]>([]);
  const [pickIndex, setPickIndex] = useState<[number, number]>();
  const [pickColors, setPickColors] = useState<string[]>([]);

  const { showToast } = useToast();
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  const client: any = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { data, fetchData } = useGameData();

  const openPickColor = (row: number, col: number) => {
    setPickIndex([row, col]);
    setOpenColor(true);
  };

  useEffect(() => {
    if (data) {
      setGridList(data.grids);
      setGridRowCol([
        data.grids.length.toString(),
        data.grids[0].length.toString(),
      ]);
      setPickColors(data.colors);
    }
  }, [data]);

  // 选中颜色
  const changeColor = async (value: string) => {
    if (!pickIndex || !data?.colors.includes(value)) {
      showToast("transaction failed");
      return;
    }

    const row = pickIndex[0];
    const col = pickIndex[1];

    const txb = await FillGridUsingCustomToken(
      data?.id!,
      BigInt(data?.payment!),
      `${row}`,
      `${col}`,
      value,
      currentAccount?.address!,
      client
    );

    signAndExecuteTransactionBlock(
      {
        transactionBlock: txb,
        options: {
          showEffects: true,
        },
      },
      {
        onSuccess: (res) => {
          showToast("Success !");
          fetchData();
          setOpenColor(false);
        },
        onError: (err) => {
          showToast("Tx Failed!");
          fetchData();
          setOpenColor(false);
          console.log(err);
        },
      }
    );
  };

  return (
    <div className={styles.colorGrid}>
      <div
        className={styles.gridContainer}
        style={{
          gridTemplateRows: `repeat(${gridRowCol[0]}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${gridRowCol[1]}, minmax(0, 1fr))`,
        }}
      >
        {map(gridList, (row, rowIndex) =>
          row.map((color, colIndex) => (
            <ColorItem
              key={`${rowIndex}-${colIndex}`}
              color={color}
              openPickColor={() => openPickColor(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
      <PickColor
        pickColors={pickColors}
        open={openColor}
        onOpenChange={() => setOpenColor(false)}
        changeColor={changeColor}
      />
    </div>
  );
}

export default ColorGrid;
