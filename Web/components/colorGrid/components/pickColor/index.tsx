"use client";

import React from "react";
import { CirclePicker } from "react-color";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useGameData } from "@/components/GameDataProvider";
import { GameData } from "@/types";

interface PickColorProps {
  pickColors: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changeColor: (color: string,data:GameData) => void;
}

function PickColor({
  open,
  onOpenChange,
  pickColors = [], // 假设 pickColors 没有默认值
  changeColor,
}: PickColorProps) {
  const {data} = useGameData()
  const handleColorChange = async (color: { hex: string }) => {
     await changeColor(color.hex,data!);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-max bg-red-100" hideCloseButton={true}>
        <CirclePicker
          circleSize={32}
          circleSpacing={15}
          colors={pickColors}
          onChange={handleColorChange}
          className="justify-center"
        />
      </DialogContent>
    </Dialog>
  );
}

export default PickColor;
