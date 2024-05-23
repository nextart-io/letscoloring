module fudcoin::Coin {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::url::{Url,Self};

    public struct COIN has drop {}

    #[allow(lint(share_owned))]
    fun init(witness:COIN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency<COIN>(
            witness,
            3,
            b"FUD",
            b"FUD",
            b"Fud Coin for letscoloring testing",
            option::some<Url>(url::new_unsafe_from_bytes(b"https://blush-left-firefly-321.mypinata.cloud/ipfs/QmbLCxFoe9E55vgB9m4HFYeq1rxYa3wm5RDKY3tKSPwXc4")),
            ctx
        );        
        
        transfer::public_freeze_object(metadata);        
        transfer::public_share_object(treasury_cap);
    }

    public entry fun mint(
        treasury_cap: &mut TreasuryCap<COIN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    public entry fun burn(treasury_cap: &mut TreasuryCap<COIN>, coin: Coin<COIN>) {
        coin::burn(treasury_cap, coin);
    }
}
