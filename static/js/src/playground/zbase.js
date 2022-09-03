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
        //$(window).resize(function(e){
        let uuid = this.create_uuid();
        $(window).on(`resize.${uuid}`, function(){
            outer.resize();
        });

        if(this.root.AcWingOS) {
            this.root.AcWingOS.api.window.on_close(function(){
                $(window).off(`resize.${uuid}`);
            });
        }
    }
    
    resize(){ //调整大小时，固定长宽比为16:9
        let unit = Math.min(this.$playground.width() / 16, this.$playground.height() / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if(this.game_map) this.game_map.resize();
    }
   
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = Math.floor(Math.random() * 10);
            res += parseInt(x);
        }
        return res;
    }



    show(mode){ //打开playground页面
        let outer = this;
        this.$playground.show();
        this.resize();
        this.game_map = new GameMap(this);
        this.colors = ["blue", "green", "grey", "pink", "yellow"];
        this.players = [];
        this.mode = mode;
        this.state = "waiting"; // waiting -> fighting -> over
        this.playercount = 0;


        //创建状态栏
        this.noticeboard = new NoticeBoard(this);
        
        //结束界面
        this.scoreboard = new ScoreBoard(this);

        //创建聊天区域
        this.chatfield = new ChatField(this);

        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5,0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if(mode === "singleplayer") { //单人模式
            for(let i = 0; i < 5; i++) { //添加其它玩家
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }else if(mode === "multiplayer") { //多人模式
            this.mps = new MultiPlayerSocket(this);
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(
                    outer.players[0].uuid,
                    outer.players[0].username, 
                    outer.players[0].photo);
            }
        }
       
    }

    hide() {
        
        while(this.players && this.players.length > 0) {
            this.players[0].destory();
        }

        if(this.game_map) {
            this.game_map.destory();
            this.game_map = null;
        }

        if(this.noticeboard) {
            this.noticeboard.destory();
            this.noticeboard = null;
        }
        
        if(this.scoreboard) {
            this.scoreboard.destory();
            this.scoreboard = null;
        }
        this.$playground.empty();
        this.$playground.hide();
    }

    get_random_color() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }


}
