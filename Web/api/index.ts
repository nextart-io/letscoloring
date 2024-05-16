import { bcs } from "@mysten/bcs";
import { GetObjectParams, SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions"
import { truncate } from "lodash";

const Package = "0x95df9c6f7fbb4e9ce777aaddb6f2d832a7fceffa620bd26d8a577177599730a6";
const Gm = "0x2d555a1ce4d5694f3a70b29262ed8b0cd28bbc2d0063bf0fc9a91ed2c5626852";
const Rt = "0x20cc25fa22841cc358124a3ab2e7a7a4cd9678e5b2310a204d9c34306863a281"

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
export const FillGrid = (game:string,token:string,row:string,col:string,new_color:string)=>{
    const txb = new TransactionBlock();
    txb.moveCall({
        target:`${Package}::coloring::fill_grid`,
        arguments:[
            txb.object(`${game}`),
            txb.object(`${token}`),
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
export const Settlement = ()=>{

}

export const getGameInfo = async (client:SuiClient,id:string) => {
    const params:GetObjectParams = {
        id: id,
        options:{
            showContent:true,
        }
    }
    await client.getObject(params);  
}