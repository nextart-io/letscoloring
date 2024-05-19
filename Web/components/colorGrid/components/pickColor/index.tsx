"use client";

import React from "react";
import { CirclePicker } from "react-color";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PickColorProps {
  pickColors: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changeColor: (color: string) => void;
}

function PickColor(props: PickColorProps) {
  const handleColorChange = (color: { hex: string }) => {
    props.changeColor(color.hex);
  };
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="w-max bg-red-100" hideCloseButton={true}>
        <CirclePicker
          circleSize={32}
          circleSpacing={15}
          colors={props.pickColors}
          onChange={handleColorChange}
          className="justify-center"
        />
      </DialogContent>
    </Dialog>
  );
}

export default PickColor;
