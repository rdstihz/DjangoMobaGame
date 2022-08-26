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
            outer.root.playground.show();
        }); 
        this.$multimode.click(function(){
            console.log("多人模式");
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

        this.eps = 0.001;

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
                if(!this.is_me) {
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
    
    update_movd(){
        
    }

    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){//阻止右键菜单
            return false; 
        });

        this.playground.game_map.$canvas.mousedown(function(e){
            const rect = outer.ctx.canvas.getBoundingClientRect();
            let rx = (outer.clientX - rect.left) / outer.playground.scale;
            let ry = (outer.clientY - rect.top) / outer.playground.scale;
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
            let rx = (outer.clientX - rect.left) / outer.playground.scale;
            let ry = (outer.clientY - rect.top) / outer.playground.scale;
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
        let fireball = new FireBall(this.playground, this, this.x, this.y, 0.01, vx, vy ,"red", 0.5, 0.5, 0.01);
    }

    render(){
        let scale = this.playground.scale;
        if(this.is_me) {
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



    show(){ //打开playground页面
        this.$playground.show();
        this.resize();
        this.game_map = new GameMap(this);
        this.colors = ["blue", "green", "grey", "pink", "yellow"];
        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5,0.05, "white", 0.15, true));

        for(let i = 0; i < 5; i++) { //添加其它玩家
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, false));

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
                        <img width="30" src="https://app3152.acapp.acwing.com.cn/static/images/settings/acwing_logo.png">
                        <br>
                        <div>
                            AcWing一键登录
                        </div>
                    </div>
                    <div class="ac-game-settings-third-login ac-game-settings-third-login-github">
                        <img width="30" src="https://app3152.acapp.acwing.com.cn/static/images/settings/github_logo3.png">
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
            url: "https://app3152.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
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
            url: "https://app3152.acapp.acwing.com.cn/settings/github/apply_code/",
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
            url: "https://app3152.acapp.acwing.com.cn/settings/getinfo/",
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
            url: "https://app3152.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
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
            url: "https://app3152.acapp.acwing.com.cn/settings/login/",
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
            url: "https://app3152.acapp.acwing.com.cn/settings/register/",
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
            url: "https://app3152.acapp.acwing.com.cn/settings/logout/",
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
