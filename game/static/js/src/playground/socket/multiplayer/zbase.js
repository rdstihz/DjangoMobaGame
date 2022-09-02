class MultiPlayerSocket{
    constructor(playground) {
        this.playground = playground;
        this.uuid = playground.players[0].uuid;
        this.ws = new WebSocket("wss://rdstihz.top:444/wss/multiplayer/");
        
        this.start();
    }
    
    send_create_player(uuid, username, photo){
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
            }else if(event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            }else if(event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty);
            }else if(event === "attack") {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, 
                    data.damage, data.ball_uuid);
            }else if(event === "blink_to") {
                outer.receive_blink_to(uuid, data.tx, data.ty);
            }else if(event === "message") {
                outer.receive_message(data.username, data.text);
            }
        }
    }

    get_player_by_uuid(uuid) {
        let players = this.playground.players;
        for(let i = 0; i < players.length; i++) {
            if(players[i].uuid === uuid)
                return players[i];
        }
        return null;
    }

    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "move_to",
            'uuid' : outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player_by_uuid(uuid);
        if(player) {
            player.move_to(tx, ty);
        }
    }
    
    send_shoot_fireball(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }
   
    receive_shoot_fireball(uuid, tx, ty) {
        let player = this.get_player_by_uuid(uuid);
        if(player) {
            player.shoot_fireball(tx, ty);
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }))
    }
    
    receive_attack(attacker_uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player_by_uuid(attacker_uuid);
        let attackee = this.get_player_by_uuid(attackee_uuid);
        if(attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid);
            attacker.destory_fireball_by_uuid(ball_uuid);
        }
    }

    send_blink_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_blink_to(uuid, tx, ty) {
        let player = this.get_player_by_uuid(uuid);
        if(player) {
            player.blink_to(tx, ty);
        }
    }

    send_message(username, text) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid': outer.uuid,
            'username': username,
            'text': text,
        }));
    }

    receive_message(username, text){
        this.playground.chatfield.add_message(username, text);
    }

}
