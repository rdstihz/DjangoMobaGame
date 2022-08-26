class FireBall extends AcGameObject{
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy =vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;

        this.eps = 0.001;
    }

    start(){}
    update(){
        //判断是否击中其它玩家
        for(let i = 0; i < this.playground.players.length; i++){
            let player = this.playground.players[i];
            if(player != this.player && this.is_collision(player)) {
                this.attack(player);
                break;
            }

        }

        if(this.move_length < this.eps) {
            this.move_length = 0;
            this.destory();
        }else{
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }

        this.render();
    }
    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    is_collision(player) { //是否击中玩
        let dx = this.x - player.x;
        let dy = this.y - player.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if(dist <= this.radius + player.radius) return true;
        else return false;
    }
    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.be_attacked(angle, this.damage);
        this.destory();
    }
}

