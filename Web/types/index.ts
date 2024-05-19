export type GameData = {
    id:string;
    unfilled_grid:string;
    total_grid:string;
    total_reward:string;
    filled_by_color:Record<string,string>;
    payment:string;
    colors:string[];
    grids:string[][];
    grid_player:string[][];
}