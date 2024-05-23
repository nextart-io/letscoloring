"use client"
import { useGameData } from "@/components/GameDataProvider";
import ColorGrid from "@/components/colorGrid";
import ScreenElements from "@/components/screenElements";
import StartGame from "@/components/startGame";
import { isValidSuiObjectId } from "@mysten/sui.js/utils";

const MainPage = () => {
  const { last_game_id } = useGameData();

  return (
    <div className="flex justify-center">
      <ScreenElements />
      {!isValidSuiObjectId(last_game_id) ? <StartGame /> : <ColorGrid />}
    </div>
  );
};

export default MainPage;
