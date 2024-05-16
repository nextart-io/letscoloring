import Image from "next/image";
import ScreenElements from "@/components/screenElements";
import ColorGrid from "@/components/colorGrid";
import StartGame from "@/components/startGame";

const MainPage = () => {
  return (
    <div className="flex justify-center">
      <ScreenElements />
      {/* <StartGame /> */}
      <ColorGrid />
    </div>
  );
};

export default MainPage;
