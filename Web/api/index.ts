import { bcs} from "@mysten/bcs";
import { GetObjectParams, SuiClient, SuiObjectResponse } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions"

const Package = "0x358a137683fe62b981d53e80320c8295462fc50c6a66c470c518592afa2c060b";
const Gm = "0x4a7e850b020eec584aa06f8b497ca883c271e4549a1e7e88bd76f84a6cca5c70";
const Rt = "0x3bb7f1afd97f89cb21ec30fd827a81f178f755db4b8bdb3daaca61eecb869162";
const Coin_Package = "0x74160e8d5b214fda1d11129b93a0b56a1b7ca3d37dc847863d0b660ab90f6017";
const Coin_Treasury = "0x2ac9063e4b39d70bd056ae288bf7aae53271612a3ec56714e2dc30f9bd82e0fc"

/*
public entry fun mint(
        treasury_cap: &mut TreasuryCap<COIN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    )
*/
export const getTestCoin = (recipient:string):TransactionBlock=>{
    const txb = new TransactionBlock();
    txb.moveCall({
        target:`${Coin_Package}::Coin::mint`,
        arguments:[
            txb.object(`${Coin_Treasury}`),
            txb.pure(`100000`),
            txb.pure(recipient)
        ]
    });
    return txb
}
// 初始化可以通过 Gm 取 Game ID
export const getGameId = async (client:SuiClient):Promise<SuiObjectResponse> => {
    const params:GetObjectParams = {
        id: Gm,
        options:{
            showContent:true,
        }
    }
    return await client.getObject(params);  
}

/*public fun start_new_game(
    gm: &mut GameManager, 
    payment: u64, 
    rows: u64,
    cols: u64,
    colors:vector<vector<u8>>,
    ctx: &mut TxContext
)*/
export const StartNewGame = (payment: string, rows: string, cols: string, color: string[]): TransactionBlock => {

    const txb = new TransactionBlock();
    txb.moveCall({
        target: `${Package}::coloring::start_new_game`,
        arguments: [
            txb.object(`${Gm}`),
            txb.pure.u64(payment),
            txb.pure.u64(rows),
            txb.pure.u64(cols),
            txb.pure(bcs.vector(bcs.string()).serialize(color))
        ]
    })

    return txb;
}

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
export const FillGrid = (game:string,payment:string,row:string,col:string,new_color:string,address:string)=>{
    const txb = new TransactionBlock();
    let [coin] = txb.splitCoins(txb.gas,[payment])
    txb.moveCall({
        target:`${Package}::coloring::fill_grid`,
        arguments:[
            txb.object(game),
            txb.object(coin),
            txb.pure.u64(row),
            txb.pure.u64(col),
            txb.pure(bcs.string().serialize(new_color).toBytes().toString()),
            txb.object(Rt)
        ]
    })
    txb.transferObjects([coin],address);
    return txb;
}
/*
public fun settlement(
        game: &mut Game, 
        ctx: &mut TxContext
*/
export const Settlement = (game:string)=>{
    const txb = new TransactionBlock();
    txb.moveCall({
        target:`${Package}::coloring::settlement`,
        arguments:[
            txb.object(`${game}`)
        ]
    })

    return txb;
}

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
export const getGameInfo= async (client:SuiClient,game_id:string):Promise<SuiObjectResponse> => {
    const params:GetObjectParams = {
        id: game_id,
        options:{
            showContent:true,
        }
    }
    return await client.getObject(params);  
}