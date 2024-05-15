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
    use sui::event;
    
    //Error
    const ENotEligible:u64 = 1;
    const EGridAlreadyFilled:u64 = 2;
    const ENotEnoughToken:u64 =3;
    const EGameEnded:u64 = 4;

    //Events
    public struct GameCreateEvents has copy,drop{
        game_object_address:address,
        index:u64,
        payment:u64,
    }

    public struct COLORING has drop{}

    public struct Game_Manager has key,store{
        id:UID,
        game_count:u64,
        games:vector<ID>,
    }

    public struct Game has key,store{
        id:UID,
        is_game_end:bool,
        generated_index:u64,
        filled_index:u64,
        payment:u64,
        grids:vector<Grid>,
        total_reward:Balance<SUI>,
        reward_by_ticket:Table<ID,Balance<SUI>>,
        ticket_grids_table:Table<ID,vector<address>>,
        color_table:Table<vector<u8>,u8>,
    }

    public struct Ticket has key {
        id:UID,
        name:String,
        description:String,
        link:String,
        url:Url,
        //need a talbe to filter whether got rewards
    }

    //record ticket info for further activity
    public struct RecordTicketInfo has key,store{
        id:UID,
        users:Table<address,ID>,
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
            users:table::new<address,ID>(ctx),
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
            generated_index:gm.game_count,
            is_game_end:false,
            filled_index:0,
            payment:payment,
            grids:grids,
            total_reward:balance::zero(),
            reward_by_ticket:table::new<ID,Balance<SUI>>(ctx),
            ticket_grids_table:table::new<ID,vector<address>>(ctx),
            color_table:table::new<vector<u8>,u8>(ctx),
        };
        
        gm.game_count = gm.game_count+1;
        vector::push_back(&mut gm.games,object::uid_to_inner(&game.id));
        event::emit(GameCreateEvents{
            game_object_address:object::uid_to_address(&game.id),
            index:gm.game_count,
            payment:payment,
        });
        transfer::share_object(game);
    }
    //User
    #[allow(lint(self_transfer))]
    public fun claim_all_by_tickt(ticket:&Ticket,game:&mut Game,ctx:&mut TxContext){
        //check weather ticke is match game
        assert!(table::contains(&game.reward_by_ticket,object::uid_to_inner(&ticket.id)),ENotEligible);
        let reward_balance = table::remove(&mut game.reward_by_ticket,object::uid_to_inner(&ticket.id));
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
        assert!(game.is_game_end,EGameEnded);
        let sender = ctx.sender();
        //if ticket is not exsist,creat a new ticket and transfer to sender
        if(!table::contains(&ticket_info.users,sender)){
            let ticket = create_ticket(ticket_info,ctx);  
            //add ticket and sender info to RecordTicketInfo
            table::add(&mut ticket_info.users,sender,object::uid_to_inner(&ticket.id));
            //initialize the game.ticket_grids_table table
            table::add(&mut game.ticket_grids_table,object::uid_to_inner(&ticket.id),vector::empty<address>());
                      
            transfer::transfer(ticket,sender);            
        };
        
        payment(game,token,ctx);
        // executed change_grid_color and get the changed grid ID
        let filled_grid_address = change_grid_color(game,grid,new_color);
        //take ticket address from sender
        let ticket_address = object::id_to_address(table::borrow(&ticket_info.users,sender));
        //borrow ticket_grids_table table by using ticket_id
        let game_grid_ticket_table = table::borrow_mut(&mut game.ticket_grids_table,object::id_from_address(ticket_address));
        //add filled_grid_address to game_grid_ticket_table
        if(table::contains(&game.color_table,new_color)){
            let value = table::borrow_mut(&mut game.color_table,new_color);
            *value = *value + 1;         
        }else{
            table::add(&mut game.color_table,new_color,0);
        };       

        //todo Events

        vector::push_back(game_grid_ticket_table,filled_grid_address);

        game.filled_index = game.filled_index + 1;

        if(game.filled_index == game.generated_index){
            game.is_game_end = true;
            game_end(game);
        };
    }

    fun payment(game:&mut Game,token:&mut Coin<SUI>,ctx:&mut TxContext){
        let value = coin::value(token);
        assert!(value>game.payment,ENotEnoughToken);
        let game_coin = coin::split(token, game.payment,ctx);
        balance::join<SUI>(&mut game.total_reward,coin::into_balance(game_coin));
    }

    fun create_ticket(ticket_info:&mut RecordTicketInfo,ctx:&mut TxContext):Ticket{
        let ticket = Ticket{
            id:object::new(ctx),
            name:string::utf8(b"Let's Coloring Ticket"),
            description:string::utf8(b"Early-stage activity for NexTheater"),
            link:string::utf8(b"https://nextheater.xyz"),
            url:url::new_unsafe_from_bytes(b"https://blush-left-firefly-321.mypinata.cloud/ipfs/QmbLCxFoe9E55vgB9m4HFYeq1rxYa3wm5RDKY3tKSPwXc4"),
        };
        table::add(&mut ticket_info.users,ctx.sender(),object::uid_to_inner(&ticket.id));            
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

    fun game_end(game:&mut Game){

    }


    //test
    #[test_only]
    public fun init_for_testing(ctx:&mut TxContext){
        let otw = COLORING{};
        init(otw,ctx);
    }
}
