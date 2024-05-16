module letscoloring::coloring{
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::url::{Url};
    use sui::balance::{Self, Balance};
    use sui::package;
    use sui::display;
    use std::string::{String, Self};
    use sui::url;
    use sui::table::{Self, Table};
    use sui::table_vec::{Self, TableVec};
    use sui::event;
    
    //Error
    const ENotEnd: u64 = 0;
    const EGridAlreadyFilled: u64 = 1;
    const EOutOfRange: u64 = 2;
    const EGameEnded: u64 = 3;
    const EIllegalColor:u64 = 4;

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

    public struct SettleGameEvent has copy, drop {
        game: ID,
        total_reward: u64,
        max_color: String,
        min_color: String,
    }

    public struct COLORING has drop{}

    public struct GameManager has key, store {
        id: UID,
        game_count: u64,
        games: TableVec<ID>,
    }

    public struct Game has key, store {
        id: UID,
        payment: u64,
        rows: u64,
        cols: u64,
        cnt: u64,
        colors:vector<vector<u8>>,
        grids: vector<vector<Grid>>,
        total_reward: Balance<SUI>,
        grid_player: vector<vector<address>>,
    }

    public struct Ticket has key {
        id: UID,
        name: String,
        description: String,
        link: String,
        url: Url,
    }

    //record ticket info for further activity
    public struct RecordTicketInfo has key, store {
        id: UID,
        users: Table<address,ID>,

    }

    public struct Grid has copy, store, drop {
        filled: bool,
        color: String,
    }    

    fun init(otw: COLORING, ctx: &mut TxContext) {
        let publisher = package::claim(otw,ctx);
        let display = display::new<Ticket>(&publisher,ctx);
        let gm = GameManager {
            id: object::new(ctx),
            game_count: 0,
            games: table_vec::empty<ID>(ctx),
        };

        transfer::share_object(RecordTicketInfo{
            id: object::new(ctx),
            users: table::new<address, ID>(ctx),
        });
        transfer::public_share_object(gm);
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // Open to start
    public fun start_new_game(
        gm: &mut GameManager, 
        payment: u64, 
        rows: u64,
        cols: u64,
        colors:vector<vector<u8>>,
        ctx: &mut TxContext
    ) {
        let mut grids_2d = vector::empty<vector<Grid>>();
        let mut addr_2d = vector::empty<vector<address>>();
        let mut i = rows;

        let mut grids_1d = vector::empty<Grid>();
        let mut addr_1d = vector::empty<address>();
        let mut j = cols;
        while (j > 0) {
            let grid = Grid {
                filled: false,
                color: string::utf8(b"FFFFFF"),
            };
            vector::push_back(&mut grids_1d, grid);
            vector::push_back(&mut addr_1d, @hold);
            j = j - 1;
        };
        while (i > 0) {
            vector::push_back(&mut grids_2d, grids_1d);
            vector::push_back(&mut addr_2d, addr_1d);
            i = i - 1;
        };
        
       let game = Game {
            id: object::new(ctx),
            payment: payment,
            rows,
            cols,
            cnt: rows * cols,
            colors,
            grids: grids_2d,
            total_reward: balance::zero(),
            grid_player: addr_2d,
        };

        gm.game_count = gm.game_count + 1;
        table_vec::push_back<ID>(&mut gm.games, object::id(&game));
        event::emit(GameCreateEvent{
            game_address:object::uid_to_address(&game.id),
        });
        transfer::share_object(game);
    }

    public fun get_player(game: &Game, row: u64, col: u64): address {
        assert!(row < game.rows && col < game.cols, EOutOfRange);
        let tg_row = vector::borrow<vector<address>>(&game.grid_player, row);
        let tg_player = vector::borrow<address>(tg_row, col);
        *tg_player
    }

    fun set_player(game: &mut Game, row: u64, col: u64, ctx: &TxContext) {
        assert!(row < game.rows && col < game.cols, EOutOfRange);
        let tg_row = vector::borrow_mut<vector<address>>(&mut game.grid_player, row);
        let tg_player = vector::borrow_mut<address>(tg_row, col);
        *tg_player = ctx.sender();
    }

    public fun borrow_grid(game: &Game, row: u64, col: u64): &Grid {
        assert!(row < game.rows && col < game.cols, EOutOfRange);
        let tg_row = vector::borrow<vector<Grid>>(&game.grids, row);
        let tg_grid = vector::borrow<Grid>(tg_row, col);
        tg_grid
    }

    public fun get_grid_filled(grid: &Grid): bool {
        grid.filled
    }

    public fun get_grid_color(grid: &Grid): String {
        grid.color
    }

    public fun borrow_mut_grid(game: &mut Game, row: u64, col: u64): &mut Grid {
        assert!(row < game.rows && col < game.cols, EOutOfRange);
        let tg_row = vector::borrow_mut<vector<Grid>>(&mut game.grids, row);
        let tg_grid = vector::borrow_mut<Grid>(tg_row, col);
        tg_grid
    }

    fun set_grid_filled(grid: &mut Grid) {
        grid.filled = true;
    }

    fun set_grid_color(grid: &mut Grid, color: String) {
        grid.color = color;
    }

    public fun fill_grid(
        game: &mut Game,
        token: &mut Coin<SUI>,
        row: u64,
        col: u64,
        new_color: vector<u8>,
        ticket_info:&mut RecordTicketInfo,
        ctx:&mut TxContext
    ) {
        assert!(!vector::contains(&game.colors,&new_color),EIllegalColor);
        let sender = ctx.sender();
        //if ticket is not exsist,creat a new ticket and transfer to sender
        if(!table::contains(&ticket_info.users, sender)){
            let ticket = create_ticket(ticket_info, ctx);            
            transfer::transfer(ticket, sender);
        };
        game.cnt = game.cnt - 1;
        assert!(game.cnt > 0, EGameEnded);
        assert!(row < game.rows && col < game.cols, EOutOfRange);
        let grid_b = borrow_grid(game, row, col);
        assert!(!get_grid_filled(grid_b), EGridAlreadyFilled);

        let game_coin = coin::split(token, game.payment, ctx);
        balance::join<SUI>(&mut game.total_reward, coin::into_balance(game_coin));
        
        let grid_bm = borrow_mut_grid(game, row, col);
        set_grid_filled(grid_bm);
        set_grid_color(grid_bm, string::utf8(new_color));
        set_player(game, row, col, ctx);
    }


    fun create_ticket(ticket_info:&mut RecordTicketInfo,ctx:&mut TxContext):Ticket{
        let ticket = Ticket{
            id: object::new(ctx),
            name: string::utf8(b"Let's Coloring Ticket"),
            description: string::utf8(b"Early-stage activity for NexTheater"),
            link: string::utf8(b"https://coloring.nextheater.xyz"),
            url: url::new_unsafe_from_bytes(b"https://blush-left-firefly-321.mypinata.cloud/ipfs/QmbLCxFoe9E55vgB9m4HFYeq1rxYa3wm5RDKY3tKSPwXc4"),
        };
        table::add(&mut ticket_info.users, ctx.sender(), object::id(&ticket));            
        ticket
    }

    #[allow(lint(self_transfer))]
    public fun settlement(game: &mut Game, ctx: &mut TxContext) {
        assert!(game.cnt == 0, ENotEnd);
        let rows = game.rows;
        let cols = game.cols;

        let mut color_type = vector::empty<String>();
        let mut color_cnt = table::new<String, u64>(ctx);

        let mut i = 0;
        let mut j = 0;

        while(i < rows) {
            while(j < cols) {
                let grid_b = borrow_grid(game, i, j);
                let color = get_grid_color(grid_b);
                if (!table::contains<String, u64>(&color_cnt, color)) {
                    vector::push_back(&mut color_type, color);
                    table::add<String, u64>(&mut color_cnt, color, 1);
                } else {
                    let cnt = table::borrow_mut<String, u64>(&mut color_cnt, color);
                    *cnt = *cnt + 1;
                };
                j = j + 1;
            };
            i = i + 1;
        };

        let mut color_max = color_type[0];
        let mut color_min = color_type[0];
        let mut color_max_cnt = *table::borrow<String, u64>(&color_cnt, color_max);
        let mut color_min_cnt = *table::borrow<String, u64>(&color_cnt, color_min);

        i = 0;
        let mut len = color_type.length();
        while (i < len) {
            let cur_color = color_type[i];
            let cur_color_cnt = *table::borrow<String, u64>(&color_cnt, cur_color);
            if (cur_color_cnt > color_max_cnt) {
                color_max_cnt = cur_color_cnt;
                color_max = cur_color;
            };
            if (cur_color_cnt < color_min_cnt) {
                color_min_cnt = cur_color_cnt;
                color_min = cur_color;
            };
            i = i + 1;
        };

        let mut max_color_player_cnt = table::new<address, u64>(ctx);
        let mut min_color_player_cnt = table::new<address, u64>(ctx);

        let mut max_player_vec = vector::empty<address>();
        let mut min_player_vec = vector::empty<address>();

        let mut max_player_cnt = 0;
        let mut min_player_cnt = 0;

        i = 0;
        j = 0;

        while (i < rows) {
            while (j < cols) {
                let grid_b = borrow_grid(game, i, j);
                let color = get_grid_color(grid_b);
                if (color == color_max) {
                    let player = get_player(game, i, j);
                    if (!table::contains<address, u64>(&max_color_player_cnt, player)) {
                        vector::push_back(&mut max_player_vec, player);
                        table::add<address, u64>(&mut max_color_player_cnt, player, 1);
                    } else {
                        let player_cnt = table::borrow_mut<address, u64>(&mut max_color_player_cnt, player);
                        *player_cnt = *player_cnt + 1;
                    };
                    max_player_cnt = max_player_cnt + 1;
                };
                if (color == color_min) {
                    let player = get_player(game, i, j);
                    if (!table::contains<address, u64>(&min_color_player_cnt, player)) {
                        vector::push_back(&mut min_player_vec, player);
                        table::add<address, u64>(&mut min_color_player_cnt, player, 1);
                    } else {
                        let player_cnt = table::borrow_mut<address, u64>(&mut min_color_player_cnt, player);
                        *player_cnt = *player_cnt + 1;
                    };
                    min_player_cnt = min_player_cnt + 1;
                };
                j = j + 1;
            };
            i = i + 1;
        };

        let total_reward = balance::value<SUI>(&game.total_reward);

        event::emit(SettleGameEvent{
            game: object::id(game),
            total_reward,
            max_color: color_max,
            min_color: color_min,
        });

        len = max_player_vec.length();
        i = 0;
        while (i < len) {
            let player = max_player_vec[i];
            let cur_player_cnt = *table::borrow<address, u64>(&max_color_player_cnt, player);
            let reward_value: u64 = total_reward * 7 * cur_player_cnt / (10 * max_player_cnt);
            let reward = coin::take<SUI>(&mut game.total_reward, reward_value, ctx);
            event::emit(RewardEvent {
                game: object::id(game),
                player,
                reward_value,
                color_type: string::utf8(b"MAX"),
                color: color_max,
                count: cur_player_cnt,
            });
            transfer::public_transfer(reward, player);
            i = i + 1;
        };

        len = min_player_vec.length();
        i = 0;
        while (i < len) {
            let player = min_player_vec[i];
            let cur_player_cnt = *table::borrow<address, u64>(&min_color_player_cnt, player);
            let reward_value: u64 = total_reward * 3 * cur_player_cnt / (10 * min_player_cnt);
            let reward = coin::take<SUI>(&mut game.total_reward, reward_value, ctx);
            event::emit(RewardEvent {
                game: object::id(game),
                player,
                reward_value,
                color_type: string::utf8(b"MIN"),
                color: color_min,
                count: cur_player_cnt,
            });
            transfer::public_transfer(reward, player);
            i = i + 1;
        };

        let remain_value = balance::value<SUI>(&game.total_reward);
        let reward = coin::take<SUI>(&mut game.total_reward, remain_value, ctx);
        transfer::public_transfer(reward, ctx.sender());

        game.grids = vector::empty<vector<Grid>>();
        game.grid_player = vector::empty<vector<address>>();

        table::drop<String, u64>(color_cnt);
        table::drop<address, u64>(max_color_player_cnt);
        table::drop<address, u64>(min_color_player_cnt);
    }


    //test
    #[test_only]
    public fun init_for_testing(ctx:&mut TxContext){
        let otw = COLORING{};
        init(otw,ctx);
    }
}
