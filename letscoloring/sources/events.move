module letscoloring::events{

    public struct GameCreateEvents has copy,drop{
        game_object_address:address,
        index:u64,
        payment:u64,
    }
}