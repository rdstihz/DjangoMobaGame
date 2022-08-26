class AcGamePlayground{
    constructor(root) {
        this.root = root;
        this.$playground = $(`
<div class="ac-game-playground">
</div>

`);
        this.scale = 1;

        this.hide();
        this.root.$ac_game.append(this.$playground);
        this.start();
    }

    start(){
        let outer = this;
        $(window).resize(function(e){
            outer.resize();
        });
    }
    
    resize(){ //调整大小时，固定长宽比为16:9
        let unit = Math.min(this.$playground.width() / 16, this.$playground.height() / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if(this.game_map) this.game_map.resize();
    }



    show(){ //打开playground页面
        this.$playground.show();
        this.resize();
        this.game_map = new GameMap(this);
        this.colors = ["blue", "green", "grey", "pink", "yellow"];
        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5,0.05, "white", 0.15, true));

        for(let i = 0; i < 5; i++) { //添加其它玩家
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, false));

        }

    }

    hide() {
        this.$playground.hide();
    }

    get_random_color() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }


}
