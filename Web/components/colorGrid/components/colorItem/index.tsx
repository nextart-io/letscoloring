"use client";

import React, { useState } from "react";
import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";
import { useToast } from "@/components/ui/toast";
import { colorConfig } from "@/lib/config";
import styles from "./index.module.css";

interface ColorItemProps {
  color: string;
  children?: React.ReactNode;
  openPickColor: (open: boolean) => void;
}

function ColorItem({ color, children, openPickColor }: ColorItemProps) {
  const currentAccount = useCurrentAccount();
  const { showToast } = useToast();

  const [openConnect, setOpenConnect] = useState(false);

  const handleColor = () => {
    // 未连接钱包
    if (!currentAccount) {
      setOpenConnect(true);
      return;
    }
    // 已被选
    if (color) {
      showToast("has been choised!");
      return;
    }

    openPickColor(true);
  };

  return (
    <ConnectModal
      trigger={
        <div
          className={styles.colorItem}
          style={{
            background: color
              ? `linear-gradient(135deg, ${color} 0%, ${colorConfig[color]} 100%)`
              : "",
          }}
          onClick={handleColor}
        >
          {children}
        </div>
      }
      open={currentAccount ? false : openConnect}
      onOpenChange={setOpenConnect}
    />
  );
}

export default ColorItem;
