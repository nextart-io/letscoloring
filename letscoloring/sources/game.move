module letscoloring::game{
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use std::string::{String, Self};
    use sui::table::{Self, Table};
    use sui::table_vec::{Self, TableVec};
    use sui::event;
    use sui::random::{Self,Random};
    use sui::vec_map::{Self};
    use letscoloring::ticket::{Table_UserTicket,Ticket,Self};
    
    
    //Error
    const ENotEnd: u64 = 0;
    const EGridAlreadyFilled: u64 = 1;
    const EOutOfRange: u64 = 2;
    const EGameEnded: u64 = 3;
    const EIllegalColor:u64 = 4;
    const ENotQualified:u64 = 5;

    //Events
    public struct GameCreateEvent has copy, drop {
        game_address: address,
    }

    public struct RewardEvent has copy, drop {
        game: ID,
        player: address,
        reward_value: u64,
        color_type: String,
        color: String,
        count: u64,
    }

    public struct GameManager has key, store {
        id: UID,
        games: TableVec<ID>,
    }

    public struct Game<phantom T> has key, store {
        id: UID,
        payment: u64,
        cnt: u64,
        init_colors:vector<String>,
        grids: vector<Grid>,
        total_reward: Balance<T>,
        grid_reward:Balance<T>,
        reward_by_player:Table<address,u64>,
    }

    public struct Grid has copy, store, drop {
        index:u64,
        filled: bool,
        player:address,
        color: String,
        reward:u64,
    }    

    fun init(ctx: &mut TxContext) {
        let gm = GameManager {
            id: object::new(ctx),
            games: table_vec::empty<ID>(ctx),
        };

        transfer::public_share_object(gm);
    }

    // Open to start
    entry fun start_new_game<T>(
        gm: &mut GameManager, 
        payment: u64, 
        r: &Random,
        base_amount:u64,
        grids_reward:Coin<T>,
        init_colors:vector<String>,
        ctx: &mut TxContext
    ) {

        let mut grids = vector::empty<Grid>();
        let mut i = 0;

        //calculate total grids
        let grids_amount = base_amount * base_amount;

        //Random calculation reward grid
        let mut reward_grid_v = vector::empty<u64>();
        let mut generator = random::new_generator(r,ctx);
        while(reward_grid_v.length() < base_amount){
            let index_r = random::generate_u64_in_range(&mut generator,0,grids_amount);
            if(!vector::contains(&reward_grid_v,&index_r)){
                vector::push_back(&mut reward_grid_v,index_r);
            };
        };
        //Random End


        //get the balance and calculate the reward for the selected grid
        let gird_balance = coin::into_balance<T>(grids_reward);
        let gird_reward_balance = balance::value(&gird_balance)/base_amount;
        

        while (i < grids_amount) {

            let mut grid = Grid {
                    index : i,
                    filled: false,
                    color: string::utf8(b"#FFFFFF"),
                    player:@hold,
                    reward: 0,
            };

            //check if the index of grid is match the rule
            if(vector::contains(&reward_grid_v,&i)){
               grid.reward = gird_reward_balance;
            };
            
            vector::push_back(&mut grids, grid);
            i = i + 1;
        };


        let game = Game{
            id: object::new(ctx),
            payment: payment,
            cnt: grids_amount,
            init_colors,
            grids: grids,
            total_reward: balance::zero<T>(),
            grid_reward:gird_balance,
            reward_by_player:table::new(ctx),
        };
        
        table_vec::push_back<ID>(&mut gm.games, object::id(&game));
        event::emit(GameCreateEvent{
            game_address:object::uid_to_address(&game.id),
        });
        transfer::share_object(game);
    } 

    entry fun fill_grid<T>(
        game: &mut Game<T>,
        token: &mut Coin<T>,
        r: &Random,
        new_color: String,
        table_user_ticket:&mut Table_UserTicket,
        ctx:&mut TxContext
    ) {

        //Random a Index:
        let mut unfilled_grids_index =  vector::empty<u64>();
        let mut i = 0;

        while(i < game.cnt) {
            let grid = vector::borrow(&game.grids,i);
            if(!grid.filled){
               vector::push_back(&mut unfilled_grids_index,i);
            };
            i = i + 1;
        };
        
        let mut generator = random::new_generator(r,ctx);
        let index_r = random::generate_u64_in_range(&mut generator,0,unfilled_grids_index.length());
        let index = *vector::borrow(&unfilled_grids_index,index_r);
        //End Random

        assert!(vector::contains(&game.init_colors,&new_color),EIllegalColor);
        let sender = ctx.sender();
        //if ticket is not exsist,creat a new ticket and transfer to sender
        if(!ticket::is_user_validate(table_user_ticket,sender)){
            let t = ticket::create_ticket(ctx);
            ticket::set_table(table_user_ticket,sender, object::id(&t));
            ticket::transfer_ticket(t,sender);
        };

        assert!(game.cnt > 0, EGameEnded);
        game.cnt = game.cnt - 1;
        let grid_bm = borrow_mut_grid(game, index);
        let reward = grid_bm.reward;
        assert!(!get_grid_filled(grid_bm), EGridAlreadyFilled);

        set_grid_filled(grid_bm);
        set_grid_color(grid_bm, new_color);
        set_grid_player(grid_bm,sender);
        

        if(grid_bm.reward > 0){
            table::add(&mut game.reward_by_player,sender,reward);
        };
        
        
        let game_coin = coin::split(token, game.payment, ctx);
        balance::join<T>(&mut game.total_reward, coin::into_balance(game_coin)); 

    }


    public fun borrow_grid<T>(game: &Game<T>, index:u64): &Grid {
        assert!(index < game.init_colors.length(), EOutOfRange);
        let tg_grid = vector::borrow<Grid>(&game.grids, index);
        tg_grid
    }

    public fun get_grid_filled(grid: &Grid): bool {
        grid.filled
    }

    public fun get_grid_color(grid: &Grid): String {
        grid.color
    }

    public fun borrow_mut_grid<T>(game: &mut Game<T>, index: u64): &mut Grid {
        assert!(index < game.grids.length(), EOutOfRange);
        let tg_grid = vector::borrow_mut<Grid>(&mut game.grids,index);
        tg_grid
    }

    fun set_grid_filled(grid: &mut Grid) {
        grid.filled = true;
    }

    fun set_grid_player(grid:&mut Grid,player:address){
        grid.player = player;
    }

    fun set_grid_color(grid: &mut Grid, color: String) {
        grid.color = color;
    }

    public fun settlement<T>(game:&mut Game<T>, ctx:&mut TxContext){
        assert!(game.cnt == 0 ,ENotEnd);
        let mut color_table = vec_map::empty<String,u64>();
        let mut i = 0;
        while(i < game.grids.length()){
            if(color_table.contains(&game.grids[i].color)){
                let item_b = color_table.get_mut(&game.grids[i].color);
                *item_b = *item_b + 1;    
            }else{
                color_table.insert(game.grids[i].color,0);
            };

            i = i + 1;
        };
        let init_color = &game.grids[0].color;
        let mut max_color = copy init_color;
        let mut min_color = copy init_color;
        i = 0;
        while(i < color_table.size()){
            let (key,value) = color_table.get_entry_by_idx(i);
            if(*color_table.get(max_color) < *value){
                max_color = key;
            };
            if( *value > 0 && *color_table.get(min_color) > *value){
                min_color = key;
            };
            i = i + 1;
        };
    }


    // #[allow(lint(self_transfer))]
    // public fun settlement<T>(game: &mut Game<T>, ctx: &mut TxContext) {
    //     assert!(game.cnt == 0, ENotEnd);
    //     let rows = game.rows;
    //     let cols = game.cols;

    //     let mut color_type = vector::empty<String>();
    //     let mut color_cnt = table::new<String, u64>(ctx);

    //     let mut i = 0;
    //     let mut j = 0;

    //     while(i < rows) {
    //         while(j < cols) {
    //             let grid_b = borrow_grid(game, i, j);
    //             let color = get_grid_color(grid_b);
    //             if (!table::contains<String, u64>(&color_cnt, color)) {
    //                 vector::push_back(&mut color_type, color);
    //                 table::add<String, u64>(&mut color_cnt, color, 1);
    //             } else {
    //                 let cnt = table::borrow_mut<String, u64>(&mut color_cnt, color);
    //                 *cnt = *cnt + 1;
    //             };
    //             j = j + 1;
    //         };
    //         i = i + 1;
    //     };

    //     let mut color_max = color_type[0];
    //     let mut color_min = color_type[0];
    //     let mut color_max_cnt = *table::borrow<String, u64>(&color_cnt, color_max);
    //     let mut color_min_cnt = *table::borrow<String, u64>(&color_cnt, color_min);

    //     i = 0;
    //     let mut len = color_type.length();
    //     while (i < len) {
    //         let cur_color = color_type[i];
    //         let cur_color_cnt = *table::borrow<String, u64>(&color_cnt, cur_color);
    //         if (cur_color_cnt > color_max_cnt) {
    //             color_max_cnt = cur_color_cnt;
    //             color_max = cur_color;
    //         };
    //         if (cur_color_cnt < color_min_cnt) {
    //             color_min_cnt = cur_color_cnt;
    //             color_min = cur_color;
    //         };
    //         i = i + 1;
    //     };

    //     let mut max_color_player_cnt = table::new<address, u64>(ctx);
    //     let mut min_color_player_cnt = table::new<address, u64>(ctx);

    //     let mut max_player_vec = vector::empty<address>();
    //     let mut min_player_vec = vector::empty<address>();

    //     let mut max_player_cnt = 0;
    //     let mut min_player_cnt = 0;

    //     i = 0;
    //     j = 0;

    //     while (i < rows) {
    //         while (j < cols) {
    //             let grid_b = borrow_grid(game, i, j);
    //             let color = get_grid_color(grid_b);
    //             if (color == color_max) {
    //                 let player = get_player(game, i, j);
    //                 if (!table::contains<address, u64>(&max_color_player_cnt, player)) {
    //                     vector::push_back(&mut max_player_vec, player);
    //                     table::add<address, u64>(&mut max_color_player_cnt, player, 1);
    //                 } else {
    //                     let player_cnt = table::borrow_mut<address, u64>(&mut max_color_player_cnt, player);
    //                     *player_cnt = *player_cnt + 1;
    //                 };
    //                 max_player_cnt = max_player_cnt + 1;
    //             };
    //             if (color == color_min) {
    //                 let player = get_player(game, i, j);
    //                 if (!table::contains<address, u64>(&min_color_player_cnt, player)) {
    //                     vector::push_back(&mut min_player_vec, player);
    //                     table::add<address, u64>(&mut min_color_player_cnt, player, 1);
    //                 } else {
    //                     let player_cnt = table::borrow_mut<address, u64>(&mut min_color_player_cnt, player);
    //                     *player_cnt = *player_cnt + 1;
    //                 };
    //                 min_player_cnt = min_player_cnt + 1;
    //             };
    //             j = j + 1;
    //         };
    //         i = i + 1;
    //     };

    //     let total_reward = balance::value<T>(&game.total_reward);

    //     event::emit(SettleGameEvent{
    //         game: object::id(game),
    //         total_reward,
    //         max_color: color_max,
    //         min_color: color_min,
    //     });

    //     len = max_player_vec.length();
    //     i = 0;
    //     while (i < len) {
    //         let player = max_player_vec[i];
    //         let cur_player_cnt = *table::borrow<address, u64>(&max_color_player_cnt, player);
    //         let reward_value: u64 = total_reward * 7 * cur_player_cnt / (10 * max_player_cnt);
    //         //let reward = coin::take<SUI>(&mut game.total_reward, reward_value, ctx);
    //         event::emit(RewardEvent {
    //             game: object::id(game),
    //             player,
    //             reward_value,
    //             color_type: string::utf8(b"MAX"),
    //             color: color_max,
    //             count: cur_player_cnt,
    //         });

    //         update_game_reward_table(game,reward_value,player);
            
    //         //transfer::public_transfer(reward, player);
    //         i = i + 1;
    //     };

    //     len = min_player_vec.length();
    //     i = 0;
    //     while (i < len) {
    //         let player = min_player_vec[i];
    //         let cur_player_cnt = *table::borrow<address, u64>(&min_color_player_cnt, player);
    //         let reward_value: u64 = total_reward * 3 * cur_player_cnt / (10 * min_player_cnt);
    //         //let reward = coin::take<SUI>(&mut game.total_reward, reward_value, ctx);
    //         event::emit(RewardEvent {
    //             game: object::id(game),
    //             player,
    //             reward_value,
    //             color_type: string::utf8(b"MIN"),
    //             color: color_min,
    //             count: cur_player_cnt,
    //         });
    //         update_game_reward_table(game,reward_value,player);
    //         //transfer::public_transfer(reward, player);
    //         i = i + 1;
    //     };

    //     //let remain_value = balance::value<SUI>(&game.total_reward);
    //     //let reward = coin::take<SUI>(&mut game.total_reward, remain_value, ctx);
    //     //transfer::public_transfer(reward, ctx.sender());

    //     game.grids = vector::empty<vector<Grid>>();
    //     game.grid_player = vector::empty<vector<address>>();

    //     table::drop<String, u64>(color_cnt);
    //     table::drop<address, u64>(max_color_player_cnt);
    //     table::drop<address, u64>(min_color_player_cnt);
    // }

    // fun update_game_reward_table<T>(game: &mut Game<T>,new_value:u64,player:address){
    //     if(table::contains(&game.reward_by_player,player)){
    //             let bm_balance = table::borrow_mut(&mut game.reward_by_player,player);
    //             *bm_balance = *bm_balance + new_value;
    //     }else{
    //             table::add(&mut game.reward_by_player,player,new_value);
    //     };
    // }

    #[allow(lint(self_transfer))]
    public fun claim_reward<T>(game: &mut Game<T>,userTicket:&Table_UserTicket, t:&mut Ticket, ctx:&mut TxContext){
        let sender = ctx.sender();
        assert!(table::contains(&game.reward_by_player,sender),ENotQualified);
        let bm_balance = *table::borrow_mut(&mut game.reward_by_player,sender);
        let reward = coin::take<T>(&mut game.total_reward, bm_balance, ctx);

        ticket::increase_points(userTicket,t,bm_balance,sender);
        transfer::public_transfer(reward,sender);
    }


    //test
    #[test_only]
    public fun init_for_testing(ctx:&mut TxContext){        
        init(ctx);
    }
}
