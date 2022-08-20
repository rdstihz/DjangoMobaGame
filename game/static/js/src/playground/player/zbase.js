class Player extends AcGameObject{
    constructor(playground, x, y, radius, color, speed, is_me){
        super();
        this.playground = playground;
        this.ctx = playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;

        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        
        this.eps = 0.1;
    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }
    }
    update(){
        if(this.move_length < this.eps) {
            this.move_length = 0;

        }else {
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += moved * this.vx;
            this.y += moved * this.vy;

            this.move_length -= moved;
        }

        this.render();
    }


    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){//阻止右键菜单
           return false; 
        });
        
        this.playground.game_map.$canvas.mousedown(function(e){
            if(e.which == 3) {
                outer.move_to(e.clientX, e.clientY);
            }
        });

    }
    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        this.angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(this.angle);
        this.vy = Math.sin(this.angle);

    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
