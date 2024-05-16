"use client";

import React, { useState, useEffect } from "react";
import { map } from "lodash";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { useAccounts, useCurrentAccount, useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";
import { useToast } from "@/components/ui/toast";
import { getGameInfo, FillGrid } from "@/api";
import { unit8Array2String } from "@/lib/utils";
import ColorItem from "./components/colorItem";
import PickColor from "./components/pickColor";
import styles from "./index.module.css";

type GameInfo = {
  content: {
    fields: {
      cnt: string;
      colors: SharedArrayBuffer[];
      cols: string;
      grid_player: string[][];
      grids: string[][];
      id: string;
      payment: string;
      rows: string;
      total_reward: string;
    };
  };
};

function ColorGrid() {
  const [openColor, setOpenColor] = useState(false);
  const [gridList, setGridList] = useState<string[][]>([]);
  const [gridRowCol, setGridRowCol] = useState<string[]>([]);
  const [pickIndex, setPickIndex] = useState<[number, number]>();
  const [pickColors, setPickColors] = useState<string[]>([]);

  const { showToast } = useToast();
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  const currentAccount = useCurrentAccount();

  const client = new SuiClient({ url: getFullnodeUrl("testnet") });
  const gameId =
    "0xda9f33ef073fec0ea3d97799ec158cd2d80fb3097b8e918571c69002067b9676";

  const openPickColor = (row: number, col: number) => {
    setPickIndex([row, col]);
    setOpenColor(true);
  };

  // 选中颜色
  const changeColor = async (value: string) => {
    if (pickIndex) {
      const row = pickIndex[0];
      const col = pickIndex[1];

      console.log(gameId, "1000000000", `${row}`, `${col}`, value);

      const txb: any = FillGrid(
        gameId,
        "1000000000",
        `${row}`,
        `${col}`,
        value,
        currentAccount?.address!
      );

      // const dryrunRes = await client.dryRunTransactionBlock({
      //   transactionBlock: await txb.build({ client: client }),
      // });
      // console.log("dryrunRes===>", dryrunRes);

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
            showToast("Success !");

            console.log(res);
            initGrid();
            setOpenColor(false);
          },
          onError: (err) => {
            showToast("Tx Failed!");
            setOpenColor(false);
            console.log(err);
          },
        }
      );
    }
  };

  const initGrid = () => {
    getGameInfo(client, gameId).then((res) => {
      const gameData = res.data as unknown as GameInfo;
      // 列
      const cols = gameData.content.fields.cols;
      // 行
      const rows = gameData.content.fields.rows;
      const unit8Colors = gameData.content.fields.colors;
      const gridsObject = gameData.content.fields.grids;
      // 格子的钱包地址
      // const grid_player = gameData.content.fields.grid_player;
      // pick color 组件可用的颜色
      const colors = map(unit8Colors, (item) => {
        const arr = new Uint8Array(item);
        return unit8Array2String(arr);
      });
      // 格子颜色
      const gridsColors = map(gridsObject, (row) => {
        return map(row, (item: { fields: { color: string } }) => {
          const colorValue = item.fields.color;
          return `#${colorValue}`;
        });
      });

      setPickColors(colors);
      setGridRowCol([rows, cols]);
      setGridList(gridsColors as unknown as string[][]);
    });
  };

  useEffect(() => {
    initGrid();
  }, []);

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
