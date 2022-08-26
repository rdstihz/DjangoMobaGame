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

        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_length = 0;
        this.damage_speed = 0;
        this.friction = 0.9;

        this.eps = 0.1;

        this.cur_skill = null; //当前选择的技能
        
        //鼠标位置
        this.clientX = 0;
        this.clientY = 0;

        if(this.is_me) {
            this.username = this.playground.root.settings.username;
            this.photo = this.playground.root.settings.photo;
            this.img = new Image();
            this.img.src = this.photo;
        }

    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }
    }
    update(){
        if(this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }else {
            if(this.move_length < this.eps) {
                this.move_length = 0;
                //AI玩家，随机移动, 随机发射火球
                if(!this.is_me) {
                    let x = Math.random() * this.playground.width;
                    let y = Math.random() * this.playground.height;
                    this.move_to(x, y);
                }
            }else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += moved * this.vx;
                this.y += moved * this.vy;
                this.move_length -= moved;
            }
        }
        if(this.playground.game_map.timestamp > 4 && !this.is_me && Math.random() < 1.0 / 300) { //平均5s发射一次, 前4s不发射
            let target = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            if(target != this) {
                let tx = target.x;
                let ty = target.y;
                this.shoot_fireball(tx, ty);
            }
        }

        this.render();
    }


    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){//阻止右键菜单
            return false; 
        });

        this.playground.game_map.$canvas.mousedown(function(e){
            const rect = outer.ctx.canvas.getBoundingClientRect();
            let rx = outer.clientX - rect.left;
            let ry = outer.clientY - rect.top;
            if(e.which === 3) {
                outer.move_to(rx, ry);
            }
            //else if(e.which === 1) { //按下左键释放当前选择的技能
            //    if(outer.cur_skill === "fireball") outer.shoot_fireball(rx, ry);
            //    outer.cur_skill = null;
            //}
        });

        //按下S键，取消移动
        $(window).keydown(function(e){
            if(e.which == 83) { //S
                outer.move_length = 0;
            }
        });

        //键盘按下按键，选择技能
        $(window).keyup(function(e){
            const rect = outer.ctx.canvas.getBoundingClientRect();
            let rx = outer.clientX - rect.left;
            let ry = outer.clientY - rect.top;
            if(e.which == 81) { //按下Q键选择火球技能
                //outer.cur_skill = "fireball";
                outer.shoot_fireball(rx, ry);
                return false;
            }
        });

        //鼠标移动，随时记录鼠标位置
        $(window).mousemove(function(e){
            outer.clientX = e.clientX;
            outer.clientY = e.clientY;
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
        let fireball = new FireBall(this.playground, this, this.x, this.y, this.playground.height * 0.01, vx, vy ,"red", this.playground.height * 0.5, this.playground.height * 0.5, this.playground.height * 0.01);
    }

    render(){
        if(this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, 
                               this.radius * 2, this.radius * 2);
            this.ctx.restore();
        }else {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    be_attacked(angle, damage) {//被火球击中
        //粒子效果
        let particle_num = 20 + 10 * Math.random();
        for(let i = 0; i < particle_num; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        this.radius -= damage;
        if(this.radius < this.eps / 10 * this.playground.height) {
            this.destory();
        }

        //击退效果
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }

    on_destory() {
        for(let i = 0; i < this.playground.players.length; i++){
            if(this === this.playground.players[i]) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }


}
