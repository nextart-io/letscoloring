import { GameData } from "@/types";
import { SuiObjectResponse } from "@mysten/sui.js/client";
import { SUI_DECIMALS } from "@mysten/sui.js/utils";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const unit8Array2String = (uint8Array: Uint8Array): string => {
  const decoder = new TextDecoder();
  return decoder.decode(uint8Array);
};

export const string2Uint8Array = (str: string): Uint8Array => {
  return new Uint8Array(str.split(",").map(Number));
};

export const formatGameResponseData = (response: SuiObjectResponse) => {
  // Format the data as needed
  const content = response?.data?.content as any;
  if (content) {
    const fields = content.fields;
    const unfilled_grid = fields.cnt;
    const formatColors = fields.colors.map((color: any) => {
      return unit8Array2String(new Uint8Array(color));
    });
    const formatGrids = fields.grids.map((grids: any) => {
      return grids.map((grid: any) => {
        return grid.fields.color;
      });
    });
    fields.grids.map((grids: any) => {
      grids.map((grid: any) => {
        grid = unit8Array2String(new Uint8Array(grid));
      });
    });
    const formatFilledByColor = formatColors.reduce((acc: any, color: any) => {
      let count = formatGrids
        .flatMap((arr: any) => arr)
        .filter((c: any) => c === color).length;
      return { ...acc, [color]: count };
    }, {} as Record<string, string>);
    const formatResponse: GameData = {
      id: fields.id.id,
      unfilled_grid: unfilled_grid,
      total_grid: (fields.cols * fields.rows).toString(),
      total_reward: fields.total_reward,
      filled_by_color: formatFilledByColor,
      colors: formatColors,
      grids: formatGrids,
      grid_player: fields.grid_player,
      payment: fields.payment,
    };
    return formatResponse;
  }
  return null;
};
