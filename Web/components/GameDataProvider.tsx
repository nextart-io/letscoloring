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
import { getLastGameId } from "@/api";

interface GameDataContextType {
  data: GameData | null;
  error: Error | null;
  last_game_id:string;
  fetchData: () => void;
}

const GameDataContext = createContext<GameDataContextType | undefined>(
  undefined
);

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

interface GameDataProviderProps {
  children: ReactNode;
}

export const GameDataProvider: React.FC<GameDataProviderProps> = ({
  children
}): JSX.Element => {
  const [data, setData] = useState<GameData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [last_game_id,setLastGameId] = useState<string>('');
  
  const fetchData = useCallback(async () => {
    const id = await getLastGameId(client);
    setLastGameId(id);
    if (!isValidSuiObjectId(last_game_id!)) return;
    try {
      const response = await client.getObject({
        options: {
          showContent: true,
        },
        id: last_game_id!,
      });

      const formattedData = await formatGameResponseData(response);
      console.log(formattedData);
      setData(formattedData);
    } catch (err) {
      setError(err as Error);
    }
  }, [last_game_id]);

  useEffect(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 10000); // Fetch data every 10 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [last_game_id, fetchData]);

  return (
    <GameDataContext.Provider value={{ data, error, last_game_id,fetchData }}>
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
