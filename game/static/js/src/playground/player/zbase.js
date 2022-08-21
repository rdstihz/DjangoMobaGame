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

        this.cur_skill = null; //当前选择的技能
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
            if(e.which === 3) {
                outer.move_to(e.clientX, e.clientY);
            }else if(e.which === 1) { //按下左键释放当前选择的技能
                if(outer.cur_skill === "fireball") outer.shoot_fireball(e.clientX, e.clientY);
                outer.cur_skill = null;
            }
        });

        //按下S键，取消移动
        $(window).keydown(function(e){
            if(e.which == 83) { //S
                outer.move_length = 0;
            }
        });

        //键盘按下按键，选择技能
        $(window).keyup(function(e){
            if(e.which == 81) { //按下Q键选择火球技能
                outer.cur_skill = "fireball";
                return false;
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
    
    shoot_fireball(tx, ty){
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        console.log("shoot fireball", tx, ty, vx, vy);
        let fireball = new FireBall(this.playground, this, this.x, this.y, this.playground.height * 0.01, vx, vy ,"red", this.playground.height * 0.5, this.playground.height * 0.5);
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
