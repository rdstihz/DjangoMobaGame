class Player extends AcGameObject{
    constructor(playground, x, y, radius, color, speed, character, username, photo){
        super();
        this.playground = playground;
        this.ctx = playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;

        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;

        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_length = 0;
        this.damage_speed = 0;
        this.friction = 0.9;
        
        this.fireballs = []; //储存玩家释放的火球

        this.eps = 0.001;

        this.cur_skill = null; //当前选择的技能
        
        //鼠标位置
        this.clientX = 0;
        this.clientY = 0;

        if(this.character !== "robot") {
            this.username = username;
            this.photo = photo;
            this.img = new Image();
            this.img.src = this.photo;

        }
        
        //技能图标和CD
        if(this.character === "me") {
            //火球
            this.fireball_coldtime = 3; //单位秒
            this.fireball_icon = new Image();
            this.fireball_icon.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";
            
            //闪现
            this.blink_coldtime = 5;
            this.blink_icon = new Image();
            this.blink_icon.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }

    }

    start(){
        this.playground.playercount++;
        this.playground.noticeboard.write("已就绪: " + this.playground.playercount + "人");

        if(this.playground.playercount >= 3) {
            this.playground.state = "fighting";
            this.playground.noticeboard.write("Fighting");
        }

        if(this.character == "me"){
            this.add_listening_events();
        }
    }
    update(){
        this.update_move();
        this.update_attack();
        if(this.character === "me" && this.playground.state === "fighting")  this.update_coldtime();
        this.render();
    }

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.blink_coldtime -= this.timedelta / 1000;

        if(this.fireball_coldtime < 0) this.fireball_coldtime = 0;
        if(this.blink_coldtime < 0) this.blink_coldtime = 0;

    }
    
    update_move(){
        if(this.damage_speed > 0.1) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }else {
            if(this.move_length < this.eps) {
                this.move_length = 0;
                //AI玩家，随机移动, 随机发射火球
                if(this.character === "robot") {
                    let x = Math.random() * this.playground.width / this.playground.scale;
                    let y = Math.random();
                    this.move_to(x, y);
                }
            }else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += moved * this.vx;
                this.y += moved * this.vy;
                this.move_length -= moved;
            }
        }
    }

    update_attack() {
        if(this.playground.game_map.timestamp > 4 && this.character === "robot" && Math.random() < 1.0 / 300) { //平均5s发射一次, 前4s不发射
            let target = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            if(target != this) {
                let tx = target.x;
                let ty = target.y;
                this.shoot_fireball(tx, ty);
            }
        }
    }
    

    //监听事件
    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){//阻止右键菜单
            return false; 
        });
       

        this.playground.game_map.$canvas.mousedown(function(e){
            if(outer.playground.state === "fighting") {
                const rect = outer.ctx.canvas.getBoundingClientRect();
                let rx = (outer.clientX - rect.left) / outer.playground.scale;
                let ry = (outer.clientY - rect.top) / outer.playground.scale;
                //右键点击移动
                if(e.which === 3) {
                    outer.move_to(rx, ry);
                }
            }
        });


        
        //抬起按键，释放技能
        this.playground.game_map.$canvas.keyup(function(e){
            if(outer.playground.state === "fighting") {
                const rect = outer.ctx.canvas.getBoundingClientRect();
                let rx = (outer.clientX - rect.left) / outer.playground.scale;
                let ry = (outer.clientY - rect.top) / outer.playground.scale;
                if(e.which === 81) { //按下Q键选择火球技能
                    if(outer.fireball_coldtime > outer.eps) //技能在CD，
                        return false;
                    outer.shoot_fireball(rx, ry);
                    outer.fireball_coldtime = 3;
                    if(outer.playground.mode === "multiplayer")
                        outer.playground.mps.send_shoot_fireball(rx, ry);
                }
                else if(e.which === 68) { //按下D键闪现
                    if(outer.blink_coldtime > outer.eps) 
                        return false;

                    outer.blink_to(rx, ry);
                    outer.blink_coldtime = 5;
                    
                    if(outer.playground.mode === "multiplayer") 
                        outer.playground.mps.send_blink_to(rx, ry);

                }

            }
        });


        this.playground.game_map.$canvas.keydown(function(e){
            console.log(e.which);
            if(outer.playground.mode === "multiplayer") {
                if(e.which === 13) { // enter
                    //按下输入键，显示输入框
                    outer.playground.chatfield.show_input();
                    return false;
                }else if(e.which === 27) {
                    //按下ESC, 关闭输入框
                    outer.playground.chatfield.hide_input();
                }
            }

           //按下S键，取消移动
            if(e.which == 83) { //S
                outer.move_length = 0;
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
        if (this.playground.mode === "multiplayer" && this.character === "me") {
            this.playground.mps.send_move_to(tx, ty);
        }
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        this.angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(this.angle);
        this.vy = Math.sin(this.angle);

    }
    
    blink_to(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);
        this.move_length = 0;
    }


    shoot_fireball(tx, ty){
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let fireball = new FireBall(this.playground, this, this.x, this.y, 0.01, vx, vy ,"red", 0.5, 0.5, 0.01);
        this.fireballs.push(fireball);
        return fireball;
    }

    render(){
        let scale = this.playground.scale;
        if(this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale,this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        }else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        
        if(this.character === "me") { //渲染技能图标
            //火球
            let x = 1.5, y = 0.9, r = 0.04;
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.fireball_icon, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
            this.ctx.restore();
            //绘制冷却时间
            if(this.fireball_coldtime > this.eps) {
                this.ctx.beginPath();
                this.ctx.moveTo(x * scale, y * scale);
                this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
                this.ctx.lineTo(x * scale, y * scale);
                this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
                this.ctx.fill();
            }
            //闪现
            x = 1.62, y = 0.9, r = 0.04;
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.blink_icon, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
            this.ctx.restore();
            //绘制冷却时间
            if(this.blink_coldtime > this.eps) {
                this.ctx.beginPath();
                this.ctx.moveTo(x * scale, y * scale);
                this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
                this.ctx.lineTo(x * scale, y * scale);
                this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
                this.ctx.fill();
            }
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
        if(this.radius < this.eps) {
            this.destory();
        }

        //击退效果
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }

    on_destory() {
        if(this.character === "me") {
            this.playground.state = "over";
            this.playground.noticeboard.write("over");
            this.playground.noticeboard.display("You Died!");
        }
        if(this.playground.state === "fighting" && 
            this.character !== "me" && this.playground.players.length === 2) {
            this.playground.state = "over";
            this.playground.noticeboard.write("over");
            this.playground.noticeboard.display("Winer Winer, Chicken Dinner!");
        }

        for(let i = 0; i < this.playground.players.length; i++){
            if(this === this.playground.players[i]) {
                this.playground.players.splice(i, 1);
                break;
            }
        }

    }
    
    destory_fireball_ba_uuid(uuid) {
        for(let i = 0; i < this.fireballs.length; i++) {
            if(uuid === this.fireballs[i].uuid) {
                this.fireballs[i].destory();
            }
        }
    }
    
    receive_attack(x, y, angle, damage) {
        this.x = x;
        this.y = y;
        this.be_attacked(angle, damage);
    }
}
