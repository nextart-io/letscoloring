import { bcs } from "@mysten/bcs";
import { GetObjectParams, SuiClient, SuiObjectResponse } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions"

const Package = "0x95df9c6f7fbb4e9ce777aaddb6f2d832a7fceffa620bd26d8a577177599730a6";
const Gm = "0x2d555a1ce4d5694f3a70b29262ed8b0cd28bbc2d0063bf0fc9a91ed2c5626852";
const Rt = "0x20cc25fa22841cc358124a3ab2e7a7a4cd9678e5b2310a204d9c34306863a281"

// 初始化可以通过 Gm 取 Game ID

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
export const FillGrid = (game:string,payment:string,row:string,col:string,new_color:string)=>{
    const txb = new TransactionBlock();
    let [coin] = txb.splitCoins(txb.gas,[payment])
    txb.moveCall({
        target:`${Package}::coloring::fill_grid`,
        arguments:[
            txb.object(`${game}`),
            txb.object(`${coin}`),
            txb.pure.u64(row),
            txb.pure.u64(col),
            txb.pure(bcs.string().serialize(new_color)),
            txb.object(`${Rt}`)
        ]
    })

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