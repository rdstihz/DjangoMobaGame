class AcGamePlayground{
    constructor(root) {
        this.root = root;
        this.$playground = $(`
<div class="ac-game-playground">
</div>

`);
        this.hide();

        this.start();
    }

    start(){

    }




    show(){
        this.root.$ac_game.append(this.$playground);

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.colors = ["blue", "green", "grey", "pink", "yellow"];
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        for(let i = 0; i < 5; i++) { //添加其它玩家
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));

        }

        this.$playground.show()
    }

    hide() {
        this.$playground.hide();
    }

    get_random_color() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }


}
