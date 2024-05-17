import ScreenElements from "@/components/screenElements";
import ColorGrid from "@/components/colorGrid";
import { GameDataProvider } from "@/components/GameDataProvider";

const gameId =
  "0xda9f33ef073fec0ea3d97799ec158cd2d80fb3097b8e918571c69002067b9676";

const MainPage = () => {
  return (
    <GameDataProvider gameId={gameId}>
      <div className="flex justify-center">
        <ScreenElements />
        <ColorGrid />
      </div>
    </GameDataProvider>
  );
};

export default MainPage;
