module letscoloring::coloring{
    use sui::coin;
    use sui::sui::SUI;
    use sui::url::{Url};
    use sui::balance::{Self, Balance};
    use sui::package;
    use sui::display;
    use std::string::{String,Self};
    use sui::dynamic_field as df;
    use sui::url;
    use sui::table::{Self,Table};
    
    //Error
    const ENotEligible:u64 = 1;

    //Sturct
    public struct AdminCap has key {
        id:UID
    }

    public struct COLORING has drop{}

    public struct Game_Manager has key,store{
        id:UID,
        game_count:u64,
        income:Balance<SUI>,
        games:vector<address>,
    }

    public struct Game has key,store{
        id:UID,
        index:u64,
        payment:u64,
        grids:vector<Grid>,
        reward:Balance<SUI>,
    }

    //record each activity by ticket, bonding to a specific game by game id
    public struct GameInfo has drop,copy,store{
        ticket:address,
        total_reward:u64,
        grid:vector<address>,
    }

    public struct Ticket has key {
        id:UID,
        name:String,
        description:String,
        link:String,
        url:Url,
    }

    //record ticket info for further activity
    public struct TicketInfo has key,store{
        id:UID,
        users:Table<address,address>,
    }

    public struct Grid has key,store {
        id:UID,
        index:u8,
        color:String,
    }    

    fun init(otw:COLORING,ctx:&mut TxContext){
        let publisher = package::claim(otw,ctx);
        let display = display::new<Ticket>(&publisher,ctx);
        let gm = Game_Manager {
            id:object::new(ctx),
            game_count:0,
            income:balance::zero(),
            games:vector::empty()
        };

        transfer::share_object(TicketInfo{
            id:object::new(ctx),
            users:table::new<address,address>(ctx),
        });
        transfer::public_transfer(gm,ctx.sender());
        transfer::public_transfer(publisher,ctx.sender());
        transfer::public_transfer(display,ctx.sender());
    }

    //Admin
    public fun start_new_game(gm:&mut Game_Manager,payment:u64,grid_count:u8,ctx:&mut TxContext){
        let mut grids = vector::empty<Grid>();
        let mut i:u8 = 0;
        while(i < grid_count){
            let grid = Grid {
                id:object::new(ctx),
                index:i,
                color: string::utf8(b"000000")
            };
            vector::push_back(&mut grids, grid);
            i = i + 1;
        };
        
        let game = Game {
            id:object::new(ctx),
            index:gm.game_count,
            payment:payment,
            grids:grids,
            reward:balance::zero()
        };

        gm.game_count = gm.game_count+1;
        vector::push_back(&mut gm.games,object::uid_to_address(&game.id));

        transfer::share_object(game);
    }
    //User
    #[allow(lint(self_transfer))]
    public fun claim_all_by_tickt(ticket:&Ticket,game:&mut Game,ctx:&mut TxContext){
        //check weather ticke is match game
        assert!(df::exists_(&game.id,object::uid_to_address(&ticket.id)),ENotEligible);
        let borrw_ticket:& GameInfo = df::borrow(&game.id,object::uid_to_address(&ticket.id));
        let coin = coin::take<SUI>(&mut game.reward,borrw_ticket.total_reward,ctx);
        transfer::public_transfer(coin,ctx.sender());
    }

    public fun fill_grid(ticket_info:&mut TicketInfo,ctx:&mut TxContext){
        let sender = ctx.sender();
        //if ticket is not exsist,creat a new ticket and transfer to sender
        if(!table::contains(&ticket_info.users,sender)){
            let ticket = creat_ticket(ticket_info,ctx);            
            transfer::transfer(ticket,sender);
        };
    }

    fun creat_ticket(ticket_info:&mut TicketInfo,ctx:&mut TxContext):Ticket{
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

    //test
    #[test_only]
    public fun init_for_testing(ctx:&mut TxContext){
        init(ctx);
    }
}
