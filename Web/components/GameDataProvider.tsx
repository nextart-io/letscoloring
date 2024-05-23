"use client"; // contexts/DataContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { isValidSuiObjectId } from "@mysten/sui.js/utils";
import { formatGameResponseData } from "@/lib/utils";
import { GameData } from "@/types";
import { getGameId } from "@/api";

interface GameDataContextType {
  data: GameData | null;
  error: Error | null;
  fetchData: () => void;
}

const GameDataContext = createContext<GameDataContextType | undefined>(
  undefined
);

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

interface GameDataProviderProps {
  children: ReactNode;
  gameId: string;
}

export const GameDataProvider: React.FC<GameDataProviderProps> = ({
  children,
  gameId,
}): JSX.Element => {
  const [data, setData] = useState<GameData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!isValidSuiObjectId(gameId)) return;
    try {
      const response = await client.getObject({
        options: {
          showContent: true,
        },
        id: gameId,
      });

      const formattedData = formatGameResponseData(response);
      console.log(formattedData);
      const game_id = await getGameId(client)
      console.log(game_id);
      setData(formattedData);
    } catch (err) {
      setError(err as Error);
    }
  }, [gameId]);

  useEffect(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 10000); // Fetch data every 10 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [gameId, fetchData]);

  return (
    <GameDataContext.Provider value={{ data, error, fetchData }}>
      {children}
    </GameDataContext.Provider>
  );
};

export const useGameData = (): GameDataContextType => {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error("useGameData must be used within a GameDataProvider");
  }
  return context;
};
