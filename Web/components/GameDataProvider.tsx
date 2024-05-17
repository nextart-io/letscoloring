"use client"; // contexts/DataContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import {
  getFullnodeUrl,
  SuiClient,
} from "@mysten/sui.js/client";
import { isValidSuiObjectId } from "@mysten/sui.js/utils";
import { formatGameResponseData} from "@/lib/utils";
import { GameData } from "@/types";

interface GameDataContextType {
  data: GameData | null;
  error: Error | null;
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

  useEffect(() => {
    if (!isValidSuiObjectId(gameId)) return;
    const fetchData = async () => {
      try {
        const response = await client.getObject({
          options: {
            showContent: true,
          },
          id: gameId, // Provide the necessary object ID here
        });

        const formattedData = formatGameResponseData(response);
        console.log(formattedData);
        setData(formattedData);
      } catch (err) {
        setError(err as Error);
      }
    };

    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 10000); // Fetch data every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [gameId]);



  return (
    <GameDataContext.Provider value={{ data, error }}>
      {children}
    </GameDataContext.Provider>
  );
};

export const useData = (): GameDataContextType => {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
