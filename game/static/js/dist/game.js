class AcGameMenu{
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        
        <div class="ac-game-menu-field-item ac-game-menu-field-item-singlemode">
            单人模式
        </div> 
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multimode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            退出登录
        </div>

    </div>
</div>
`);
        
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$singlemode = this.$menu.find('.ac-game-menu-field-item-singlemode');
        this.$multimode = this.$menu.find('.ac-game-menu-field-item-multimode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }

    start(){
        this.add_listening_events();
    }
    add_listening_events(){
        let outer = this;
        this.$singlemode.click(function(){
            outer.hide();
            outer.root.playground.show("singleplayer");
        }); 
        this.$multimode.click(function(){
            outer.hide();
            outer.root.playground.show("multiplayer");
        });
        this.$settings.click(function(){
            console.log("设置");
            
            outer.root.settings.logout_remote();

        });

    }

    show(){
        this.$menu.show();
    }

    hide(){
        this.$menu.hide();
    }
}
let AC_GAME_OBJECTS = [];

class AcGameObject{
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false; //是否执行过start
        this.timedelta = 0; //当前帧距离上一帧的时间间隔(ms)
        this.uuid = this.create_uuid(); //每个ojbect创建一个随机的uuid
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = Math.floor(Math.random() * 10);
            res += parseInt(x);
        }
        return res;
    }
    
    start(){    //只会在第一帧执行一次
    }
    update(){   //每一帧执行一次
    }

    on_destory() { //被删除前执行一次
    }

    destory(){  //删掉时执行
        this.on_destory();
        for(let i = 0; i < AC_GAME_OBJECTS.length; i++) {
            if(AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp){
    for(let i = 0; i < AC_GAME_OBJECTS.length; i++) {
        let obj = AC_GAME_OBJECTS[i];
        if(!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        }else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION); //在下一帧开始时调用 
class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;

        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d'); //2D画布

        this.ctx.canvas.width = playground.width;
        this.ctx.canvas.height = playground.height;

        this.playground.$playground.append(this.$canvas);

        this.timestamp = 0;//时间戳
    }
    start() {
    }
    update(){
        this.timestamp += this.timedelta / 1000;
        this.render();
    }

    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

}
class NoticeBoard extends AcGameObject{
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪： 0人";
        this.displaying = "";
    }

    start(){
    }
    
    write(text) {
        this.text = text;
    }
    display(text) {
        this.displaying = text;
    }

    update(){
        this.render();
    }

    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);

        if(this.displaying !== "") {
             this.ctx.font = "100px serif";
            this.ctx.fillStyle = "white";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.displaying, this.playground.width / 2, this.playground.height / 2);

        }

    }


}
class Particle extends AcGameObject{
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        
        this.friction = 0.9;
        this.eps = 0.001;
    }
    start(){}

    update(){
        if(this.move_length < this.eps || this.speed < this.eps) {
            this.destory();
            return false;
        }
        
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += moved * this.vx;
        this.y += moved * this.vy;

        this.speed *= this.friction;
        this.move_length -= moved;

        this.render();
    }
    
    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

    }

}
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

        //按下S键，取消移动
        $(window).keydown(function(e){
            if(e.which == 83) { //S
                outer.move_length = 0;
            }
        });

        
        //键盘按下按键，选择技能
        $(window).keyup(function(e){
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
        if(this.player.character != "enemy") {
            this.update_attack();
        }
        this.update_move();
        this.render();
    }
    
    update_attack() {
        //判断是否击中其它玩家
        for(let i = 0; i < this.playground.players.length; i++){
            let player = this.playground.players[i];
            if(player != this.player && this.is_collision(player)) {
                this.attack(player);
                break;
            }

        }
       
    }

    update_move() {
        if(this.move_length < this.eps) {
            this.move_length = 0;
            this.destory();
        }else{
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
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
        
        if(this.playground.mode === "multiplayer")
            this.playground.mps.send_attack(player.uuid, player.x, player.y,
            angle, this.damage ,this.uuid);

        player.be_attacked(angle, this.damage);
        this.destory();
    }

    on_destory(){
        let fireballs = this.playground.players[0].fireballs;
        for(let i = 0; i < fireballs.length; i++) {
            if(fireballs[i] === this) {
                fireballs.splice(i, 1);
                break;
            }
        }
    }

}

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
}
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

        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5,0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if(mode === "singleplayer") { //单人模式
            for(let i = 0; i < 5; i++) { //添加其它玩家
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }else if(mode === "multiplayer") { //多人模式
            this.mps = new MultiPlayerSocket(this);
            this.mps.ws.onopen = function() {
                console.log('onopen');
                outer.mps.send_create_player(
                    outer.players[0].uuid,
                    outer.players[0].username, 
                    outer.players[0].photo);
            }
        }
       
    }

    hide() {
        this.$playground.hide();
    }

    get_random_color() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }


}
class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";

        this.username = "";
        this.photo = "";

        this.$settings = $(`
            <div class="ac-game-settings">
                <div class="ac-game-settings-login">
                    <div class="ac-game-settings-title">登录</div>
                    <div class="ac-game-settings-username">
                        <div class="ac-game-settings-item">
                        <input type="text" placeholder="用户名">
                        </div>
                    </div>
                    <div class="ac-game-settings-password">
                        <div class="ac-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>
                    <div class="ac-game-settings-submit">
                        <div class="ac-game-settings-item">
                            <button>登录</button>
                        </div>
                    </div>

                    <div class="ac-game-settings-error-messages">
                    </div>

                    <div class="ac-game-settings-option">
                        注册
                    </div>
                    <div class="ac-game-settings-third-login ac-game-settings-third-login-acwing">
                        <img width="30" src="https://rdstihz.top:444/static/images/settings/acwing_logo.png">
                        <br>
                        <div>
                            AcWing一键登录
                        </div>
                    </div>
                    <div class="ac-game-settings-third-login ac-game-settings-third-login-github">
                        <img width="30" src="https://rdstihz.top:444/static/images/settings/github_logo3.png">
                        <br>
                        <div>
                            Github一键登录
                        </div>
                    </div>
                </div>


                <div class="ac-game-settings-register">
                    <div class="ac-game-settings-title">注册</div>
                    <div class="ac-game-settings-username">
                        <div class="ac-game-settings-item">
                        <input type="text" placeholder="用户名">
                        </div>
                    </div>
                    <div class="ac-game-settings-password ac-game-settings-password-first">
                        <div class="ac-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>
                    <div class="ac-game-settings-password ac-game-settings-password-second">
                        <div class="ac-game-settings-item">
                            <input type="password" placeholder="确认密码">
                        </div>
                    </div>
                   <div class="ac-game-settings-submit">
                        <div class="ac-game-settings-item">
                            <button>注册</button>
                        </div>
                    </div>

                    <div class="ac-game-settings-error-messages">

                    </div>
                    <div class="ac-game-settings-option">
                        登录
                    </div>
                </div>
            </div>
        `);

        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$register = this.$settings.find(".ac-game-settings-register");

        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit =   this.$login.find(".ac-game-settings-submit button");
        this.$login_register = this.$login.find(".ac-game-settings-option");
        this.$login_error_messages = this.$login.find(".ac-game-settings-error-messages");

        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_login = this.$register.find(".ac-game-settings-option");
        this.$register_error_messages = this.$register.find(".ac-game-settings-error-messages");

        this.$login.hide();
        this.$register.hide();

        this.$acwing_login = this.$login.find(".ac-game-settings-third-login-acwing > img");
        this.$github_login = this.$login.find(".ac-game-settings-third-login-github > img");

        this.root.$ac_game.append(this.$settings);
        this.start();
    }

    start(){
        if(this.platform === "WEB") {
            this.getinfo();
            this.add_listening_events();
        }else {
            //ACAPP端一键登录
            this.acapp_login();
        }
    }

    add_listening_events(){
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();

        //Acwing一键登录
        this.$acwing_login.click(function(){
            outer.acwing_login();
        });
        //Github一键登录
        this.$github_login.click(function(){
            outer.github_login();
        });
    }

    acwing_login(){
        $.ajax({
            url: "https://rdstihz.top:444/settings/acwing/web/apply_code/",
            type: "GET",
            success: function(resp){
                if(resp.result === "success") {
                    window.location.replace(resp.apply_code_url)
                }
            }
        });
    }

    github_login(){
        $.ajax({
            url: "https://rdstihz.top:444/settings/github/apply_code/",
            type: "GET",
            success: function(resp){
                if(resp.result === "success") {
                    window.location.replace(resp.apply_code_url)
                }
            }
        });
    }

    add_listening_events_login() {
        //本地事件，点击“注册”切换到注册页面
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });

        //远程事件，登录到服务器
        this.$login_submit.click(function(){
            outer.login_remote();
        });
    }

    add_listening_events_register(){
        //本地事件，点击登录切换到登录页面
        let outer = this;
        this.$register_login.click(function(){
            outer.login();
        });

        //远程事件，提交注册请示
        this.$register_submit.click(function(){
            outer.register_remote();
        });
    }

    getinfo(){
        let outer = this;
        $.ajax({
            url: "https://rdstihz.top:444/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },

            success: function(resp) {
                console.log(resp);
                if(resp.result === "success") {
                    outer.username = resp.username
                    outer.photo = resp.photo
                    outer.hide();
                    outer.root.menu.show();
                }else {
                    outer.login();
                }
            }
        })
    }

    acapp_login() {
        let outer = this;
        $.ajax({
            //获取参数
            url: "https://rdstihz.top:444/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                console.log(resp);
                if(resp.result === "success") {
                    outer.root.AcWingOS.api.oauth2.authorize(resp.appid, resp.redirect_uri, resp.scope, resp.state, function(resp){
                        console.log(resp);
                        if(resp.result === "success") {
                            outer.username = resp.username;
                            outer.photo = resp.photo;
                            outer.hide();
                            outer.root.menu.show();
                        }
                    });
                }

            }
        });
    }

    register(){
        // 打开注册页面
        this.$login.hide();
        this.$register.show();
    }
    login(){
        //打开登录页面
        this.$register.hide();
        this.$login.show();
    }

    login_remote(){
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_messages.empty();
        console.log(username, password);
        $.ajax({
            url: "https://rdstihz.top:444/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp){
                if(resp.result === "success") {
                    location.reload();
                }else {
                    outer.$login_error_messages.html(resp.result);
                }
            }
        });

    }

    register_remote(){
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_messages.empty();
        $.ajax({
            url: "https://rdstihz.top:444/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if(resp.result === "success") {
                    location.reload();
                }else{
                    outer.$register_error_messages.html(resp.result);
                }
            }
        });


    }

    logout_remote(){
        if (this.platform === "ACAPP") {
            return false;
        }
        let outer = this;
        $.ajax({
            url: "https://rdstihz.top:444/settings/logout/",
            type: "GET",
            success: function(resp){
                if (resp.result === "success") {
                    location.reload();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }
    show(){
        this.$settings.show();
    }

}
export class AcGame {
    constructor(id, AcWingOS) {
        this.id = id;
        this.$ac_game = $('#'+id);
        this.AcWingOS = AcWingOS;
        console.log(AcWingOS);
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }
    start() {

    }

}
