"use client";

import React, { useState, useEffect } from "react";
import { map, cloneDeep } from "lodash";
import ColorItem from "./components/colorItem";
import PickColor from "./components/pickColor";
import styles from "./index.module.css";

function ColorGrid() {
  const [openColor, setOpenColor] = useState(false);
  const [colorList, setColorList] = useState<string[]>(new Array(25).fill(""));
  const [pickIndex, setPickIndex] = useState<any>();

  const openPickColor = (color: string, value: number) => {
    // TODO: 选过之后不能再选

    // 已被选择的块，不能再选
    if (color) {
      return;
    }

    setPickIndex(value);
    setOpenColor(true);
  };

  // 选中颜色
  const changeColor = (value: string) => {
    const newArray = cloneDeep(colorList);
    newArray[pickIndex] = value;
    setColorList(newArray);
    setOpenColor(false);
  };

  // TODO: 请求链上 color & 位置数据，填充到 colorList
  //   useEffect(() => {}, []);

  return (
    <div className={styles.colorGrid}>
      <div className={styles.gridContainer}>
        {map(colorList, (color, index) => (
          <ColorItem
            key={index}
            color={color}
            openPickColor={() => openPickColor(color, index)}
          />
        ))}
      </div>
      <PickColor
        open={openColor}
        onOpenChange={() => setOpenColor(false)}
        changeColor={changeColor}
      />
    </div>
  );
}

export default ColorGrid;
