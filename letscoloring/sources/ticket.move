module letscoloring::ticket{
    use sui::package;
    use sui::display;
    use std::string::{String,Self};
    use sui::url::{Url,Self};
    use sui::table::{Self,Table};

    const ENotExsist:u64 = 0;
    
    public struct AdminCap has key,store{
        id:UID,
    }

    public struct TICKET has drop {}

    public struct Ticket has key {
        id: UID,
        name: String,
        description: String,
        link: String,
        url: Url,
        points: u64
    }

    public struct Table_UserTicket has key, store{
        id:UID,
        data: Table<address,ID>
    }

    public fun is_user_validate(t:&Table_UserTicket,user:address):bool {
        table::contains(&t.data,user)
    }

    public fun get_ticket_id(t:&Table_UserTicket,user:address):&ID{
        assert!(is_user_validate(t,user),ENotExsist);
        table::borrow(&t.data,user)
    }

    public(package) fun set_table(t:&mut Table_UserTicket,user:address,ticket_id:ID){
        table::add(&mut t.data,user,ticket_id);
    }

    public(package) fun create_ticket(ctx:&mut TxContext):Ticket{
        let ticket = Ticket{
            id: object::new(ctx),
            name: string::utf8(b"Let's Coloring Ticket"),
            description: string::utf8(b"Early-stage activity for NexTheater"),
            link: string::utf8(b"https://coloring.nextheater.xyz"),
            url: url::new_unsafe_from_bytes(b"https://blush-left-firefly-321.mypinata.cloud/ipfs/QmbLCxFoe9E55vgB9m4HFYeq1rxYa3wm5RDKY3tKSPwXc4"),
            points: 0
        };           
        ticket
    }

    public(package) fun transfer_ticket(ticket:Ticket,recipient:address){
        transfer::transfer(ticket,recipient);
    }
    
    public fun increase_points(_:&AdminCap,ticket:&mut Ticket,amount:u64){
        ticket.points = ticket.points + amount;
    }

    public fun get_points(self:&Ticket):u64{
        self.points
    }

    public fun burn(_:&AdminCap,self:Ticket):u64{
        let Ticket {
            id,
            name:_,
            description:_,
            link:_,
            url:_,
            points,
        } = self;
        let return_value = points;
        object::delete(id);
        return_value
    }

    fun init(otw: TICKET, ctx: &mut TxContext) {
        let publisher = package::claim(otw,ctx);
        let display = display::new<Ticket>(&publisher,ctx);

        transfer::share_object(Table_UserTicket{
            id:object::new(ctx),
            data:table::new<address,ID>(ctx)
        });

        transfer::public_transfer(AdminCap{
            id:object::new(ctx),
        },ctx.sender());
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }
}