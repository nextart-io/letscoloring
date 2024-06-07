import { bcs } from "@mysten/bcs";
import {
  GetObjectParams,
  SuiClient,
  SuiObjectResponse,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { isValidSuiObjectId } from "@mysten/sui.js/utils";

const Package =
  "0x851947332fd8a977fbaa82dc841e9ec805a83987d0cfa57e331c4e3de9d12e1d";
const Gm = "0xf24e356f64844405688547f552a0a81646e0c9b06fa56b47bca8ea1d1fb6d2ca";
const Rt = "0xa5b13dcfcabe967bd6acc7da203229b781fed3d9a27d18944aeda09dfd8ff9b7";
const Coin_Package =
  "0x74160e8d5b214fda1d11129b93a0b56a1b7ca3d37dc847863d0b660ab90f6017";
const Coin_Treasury =
  "0x2ac9063e4b39d70bd056ae288bf7aae53271612a3ec56714e2dc30f9bd82e0fc";
const Coin_Type =
  "0x74160e8d5b214fda1d11129b93a0b56a1b7ca3d37dc847863d0b660ab90f6017::Coin::COIN";

/*
public entry fun mint(
        treasury_cap: &mut TreasuryCap<COIN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    )
*/
export const getTestCoin = (recipient: string): TransactionBlock => {
  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${Coin_Package}::Coin::mint`,
    arguments: [
      txb.object(`${Coin_Treasury}`),
      txb.pure(`100000`),
      txb.pure(recipient),
    ],
  });
  return txb;
};

//public fun claim_reward<T>(game: &mut Game<T>, ctx:&mut TxContext)
export const claimReward = (gameId:string) =>{
  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${Package}::coloring::claim_reward`,
    arguments: [
      txb.object(`${gameId}`),
    ],
    typeArguments: [`${Coin_Type}`],
  });
  return txb;
}
// 初始化可以通过 Gm 取 Game ID
export const getGameId = async (
  client: SuiClient
): Promise<SuiObjectResponse> => {
  const params: GetObjectParams = {
    id: Gm,
    options: {
      showContent: true,
    },
  };
  return await client.getObject(params);
};

export const getRewardPlayer = async (id:string,client:SuiClient) =>{
  if(!isValidSuiObjectId(id)) return;
  const data = await client.getDynamicFields(
    {
      parentId: `${id}`,
    }
  )
  console.log(data)
}

export const getLastGameId = async (client: SuiClient) => {
  const gm_object_id = await client.getObject({
    id: `${Gm}`,
    options: {
      showContent: true
    }
  });

  const content = gm_object_id.data?.content as any;
  const table_object_id = content.fields.games.fields.contents.fields.id.id;
  if (!table_object_id) return

  const data = await client.getDynamicFields(
    {
      parentId: `${table_object_id}`,
    }
  )


  const total_games = data.data
  .sort((a, b) => (a.name.value as number) - (b.name.value as number))
  .map((game) => game.objectId);

  if(!total_games.length) return;


  const last_game_object = await client.getObject({
    id:total_games.at(-1)!,
    options:{
      showContent:true
    }
  })


  const last_game_object_content = last_game_object.data?.content as any;
  const last_game_id = last_game_object_content.fields.value;

  return last_game_id;
}

/*public fun start_new_game(
    gm: &mut GameManager, 
    payment: u64, 
    rows: u64,
    cols: u64,
    colors:vector<vector<u8>>,
    ctx: &mut TxContext
)*/
export const StartNewGame = (
  payment: string,
  rows: string,
  cols: string,
  color: string[]
): TransactionBlock => {
  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${Package}::coloring::start_new_game`,
    arguments: [
      txb.object(`${Gm}`),
      txb.pure.u64(payment),
      txb.pure.u64(rows),
      txb.pure.u64(cols),
      txb.pure(bcs.vector(bcs.string()).serialize(color)),
    ],
    typeArguments: [`${Coin_Type}`],
  });

  return txb;
};

/* public fun fill_grid(
        game: &mut Game,
        token: &mut Coin<SUI>,
        row: u64,
        col: u64,
        new_color: vector<u8>,
        ticket_info:&mut RecordTicketInfo,
        ctx:&mut TxContext
    )
*/

export const FillGridUsingCustomToken = async (
  game: string,
  payment: bigint,
  row: string,
  col: string,
  new_color: string,
  address: string,
  client: SuiClient
) => {
  const txb = new TransactionBlock();
  let getCoinInfo = await client.getCoins({
    owner: address,
    coinType: Coin_Type,
  });
  if (!getCoinInfo.data[0]) {
    throw new Error("Insufficient balance for this Coin");
  }
  const [primaryCoin, ...mergeCoins] = getCoinInfo.data;
  const primaryCoinInput = txb.object(primaryCoin.coinObjectId);
  if (mergeCoins.length) {
    txb.mergeCoins(
      primaryCoinInput,
      mergeCoins.map((coin) => txb.object(coin.coinObjectId))
    );
  }

  const coin = txb.splitCoins(primaryCoinInput, [txb.pure(payment)]);

  txb.moveCall({
    target: `${Package}::coloring::fill_grid`,
    arguments: [
      txb.object(game),
      txb.object(coin),
      txb.pure.u64(row),
      txb.pure.u64(col),
      txb.pure(
        Array.from(bcs.string().serialize(new_color).toBytes().subarray(1))
      ),
      txb.object(Rt),
    ],
    typeArguments: [`${Coin_Type}`],
  });
  txb.transferObjects([coin], address);
  return txb;
};

export const FillGrid = (
  game: string,
  payment: string,
  row: string,
  col: string,
  new_color: string,
  address: string
) => {
  const txb = new TransactionBlock();
  let [coin] = txb.splitCoins(txb.gas, [payment]);

  txb.moveCall({
    target: `${Package}::coloring::fill_grid`,
    arguments: [
      txb.object(game),
      txb.object(coin),
      txb.pure.u64(row),
      txb.pure.u64(col),
      txb.pure(bcs.string().serialize(new_color).toBytes().toString()),
      txb.object(Rt),
    ],
  });
  txb.transferObjects([coin], address);
  return txb;
};
/*
public fun settlement(
        game: &mut Game, 
        ctx: &mut TxContext
*/
export const Settlement = (game: string,txb:TransactionBlock) => {
  txb.moveCall({
    target: `${Package}::coloring::settlement`,
    arguments: [txb.object(`${game}`)],
    typeArguments: [`${Coin_Type}`],
  });
};

/*
    public struct Game has key, store {
        id: UID,
        payment: u64, 1_000_000_000 = 1SUI
        rows: u64,
        cols: u64,
        cnt: u64,
        colors:vector<vector<u8>>,
        grids: vector<vector<Grid>>,
        total_reward: Balance<SUI>,
        grid_player: vector<vector<address>>,
    }

*/
export const getGameInfo = async (
  client: SuiClient,
  game_id: string
): Promise<SuiObjectResponse> => {
  const params: GetObjectParams = {
    id: game_id,
    options: {
      showContent: true,
    },
  };
  return await client.getObject(params);
};
