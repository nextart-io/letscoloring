module letscoloring::coloring{
    use sui::coin::{Self,Coin};
    use sui::sui::SUI;
    use sui::url::{Url};
    use sui::balance::{Self, Balance};
    use sui::package;
    use sui::display;
    use std::string::{String,Self};
    use sui::url;
    use sui::table::{Self,Table};
    
    //Error
    const ENotEligible:u64 = 1;
    const EGridAlreadyFilled:u64 = 2;
    const ENotEnoughToken:u64 =3;

    //Sturct
    public struct AdminCap has key {
        id:UID
    }

    public struct COLORING has drop{}

    public struct Game_Manager has key,store{
        id:UID,
        game_count:u64,
        games:vector<address>,
    }

    public struct Game has key,store{
        id:UID,
        index:u64,
        payment:u64,
        grids:vector<Grid>,
        total_reward:Balance<SUI>,
        reward_by_ticket:Table<address,Balance<SUI>>,
        grid_filled_by_ticket:Table<address,address>
    }

    public struct Ticket has key {
        id:UID,
        name:String,
        description:String,
        link:String,
        url:Url,
    }

    //record ticket info for further activity
    public struct RecordTicketInfo has key,store{
        id:UID,
        users:Table<address,address>,
    }

    public struct Grid has key,store {
        id:UID,
        game:address,
        index:u8,
        filled:bool,
        color:String,
    }    

    fun init(otw:COLORING,ctx:&mut TxContext){
        let publisher = package::claim(otw,ctx);
        let display = display::new<Ticket>(&publisher,ctx);
        let gm = Game_Manager {
            id:object::new(ctx),
            game_count:0,
            games:vector::empty()
        };

        transfer::share_object(RecordTicketInfo{
            id:object::new(ctx),
            users:table::new<address,address>(ctx),
        });
        transfer::public_transfer(gm,ctx.sender());
        transfer::public_transfer(publisher,ctx.sender());
        transfer::public_transfer(display,ctx.sender());
    }

    //Admin
    public fun start_new_game(gm:&mut Game_Manager,payment:u64,grid_count:u8,ctx:&mut TxContext){
        
        let new_game_id = object::new(ctx);
        let mut grids = vector::empty<Grid>();
        let mut i:u8 = 0;
        while(i < grid_count){
            let grid = Grid {
                id:object::new(ctx),
                game:object::uid_to_address(&new_game_id),
                filled:false,
                index:i,
                color: string::utf8(b"255255255")
            };
            vector::push_back(&mut grids, grid);
            i = i + 1;
        };
        
       let game = Game {
            id:new_game_id,
            index:gm.game_count,
            payment:payment,
            grids:grids,
            total_reward:balance::zero(),
            reward_by_ticket:table::new<address,Balance<SUI>>(ctx),
            grid_filled_by_ticket:table::new<address,address>(ctx)

        };

        gm.game_count = gm.game_count+1;
        vector::push_back(&mut gm.games,object::uid_to_address(&game.id));

        transfer::share_object(game);
    }
    //User
    #[allow(lint(self_transfer))]
    public fun claim_all_by_tickt(ticket:&Ticket,game:&mut Game,ctx:&mut TxContext){
        //check weather ticke is match game
        assert!(table::contains(&game.reward_by_ticket,object::uid_to_address(&ticket.id)),ENotEligible);
        let reward_balance = table::remove(&mut game.reward_by_ticket,object::uid_to_address(&ticket.id));
        let coin = coin::from_balance<SUI>(reward_balance,ctx);
        transfer::public_transfer(coin,ctx.sender());
    }

    public fun fill_grid(
    game:&mut Game,
    grid:&Grid,
    token:&mut Coin<SUI>,
    new_color:vector<u8>,
    ticket_info:&mut RecordTicketInfo,
    ctx:&mut TxContext){
        let sender = ctx.sender();
        //if ticket is not exsist,creat a new ticket and transfer to sender
        if(!table::contains(&ticket_info.users,sender)){
            let ticket = creat_ticket(ticket_info,ctx);            
            transfer::transfer(ticket,sender);
        };
        payment(game,token,ctx);
        let filled_grid_address = change_grid_color(game,grid,new_color);
        table::add(&mut game.grid_filled_by_ticket,sender,filled_grid_address);
    }

    fun payment(game:&mut Game,token:&mut Coin<SUI>,ctx:&mut TxContext){
        let value = coin::value(token);
        assert!(value>game.payment,ENotEnoughToken);
        let game_coin = coin::split(token, game.payment,ctx);
        balance::join<SUI>(&mut game.total_reward,coin::into_balance(game_coin));
    }

    fun creat_ticket(ticket_info:&mut RecordTicketInfo,ctx:&mut TxContext):Ticket{
        let ticket = Ticket{
            id:object::new(ctx),
            name:string::utf8(b"Let's Coloring Ticket"),
            description:string::utf8(b"Early-stage activity for NexTheater"),
            link:string::utf8(b"https://nextheater.xyz"),
            url:url::new_unsafe_from_bytes(b"https://blush-left-firefly-321.mypinata.cloud/ipfs/QmbLCxFoe9E55vgB9m4HFYeq1rxYa3wm5RDKY3tKSPwXc4"),
        };
        table::add(&mut ticket_info.users,ctx.sender(),object::uid_to_address(&ticket.id));            
        ticket
    }

    //gaming
    fun change_grid_color(game:&mut Game,grid:&Grid,new_color:vector<u8>):address{
        assert!(object::uid_to_address(&game.id) == grid.game, ENotEligible);
        assert!(!grid.filled, EGridAlreadyFilled);
        let game_grid = vector::borrow_mut(&mut game.grids,grid.index as u64);
        game_grid.color = string::utf8(new_color);
        object::uid_to_address(&game_grid.id)
    }

    //test
    #[test_only]
    public fun init_for_testing(ctx:&mut TxContext){
        init(ctx);
    }
}
