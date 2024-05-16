"use client";

import React from "react";
import { keys } from "lodash";
import { CirclePicker } from "react-color";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { colorConfig } from "@/lib/config";

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
      <DialogContent className="w-max">
        <DialogTitle>pick a color</DialogTitle>
        <CirclePicker
          width="324px"
          circleSize={40}
          colors={props.pickColors}
          onChange={handleColorChange}
        />
      </DialogContent>
    </Dialog>
  );
}

export default PickColor;
