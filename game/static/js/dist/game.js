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
            设置
        </div>

    </div>
</div>
`);
        
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
            outer.root.playground.show();
        }); 
        this.$multimode.click(function(){
            console.log("多人模式");
        });
        this.$settings.click(function(){
            console.log("设置");
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

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
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
        this.eps = 1;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

    }

}
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
    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }
    }
    update(){
        if(this.damage_speed > 10) {
            console.log("击退");
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
        let fireball = new FireBall(this.playground, this, this.x, this.y, this.playground.height * 0.01, vx, vy ,"red", this.playground.height * 0.5, this.playground.height * 0.5, this.playground.height * 0.01);
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
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

        this.eps = 0.1;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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

class AcGamePlayground{
    constructor(root) {
        this.root = root;
        this.$playground = $(`
<div class="ac-game-playground">
</div>

`);
       // this.hide();
        this.root.$ac_game.append(this.$playground);


        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.colors = ["blue", "green", "grey", "pink", "yellow"];
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        for(let i = 0; i < 5; i++) { //添加其它玩家
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));

        }

        this.start();
   }

    start(){
        
    }

    


    show(){
        this.$playground.show()
    }

    hide() {
        this.$playground.hide();
    }

    get_random_color() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }


}
export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#'+id);
        //this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }
    start() {

    }

}
