class MultiPlayerSocket{
    constructor(playground) {
        this.playground = playground;
        this.uuid = playground.players[0].uuid;
        this.ws = new WebSocket("wss://app3152.acapp.acwing.com.cn/wss/multiplayer/");
        
        this.start();
    }
    
    send_create_player(uuid, username, photo){
        console.log('send create player ', uuid, username);
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': uuid,
            'username': username,
            'photo': photo,
        }));
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo
        );
        player.uuid = uuid;
        this.playground.players.push(player);
    }

    start(){
        this.receive(); //接收后端wyth
    }
    
    receive() {
        let outer = this;
        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            
            let uuid = data.uuid;
            let event = data.event;

            if(uuid === outer.uuid) return false; //忽略自己发出的信息
            if(event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
        }
    }

}
