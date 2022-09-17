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
            if(this.root.access) { //已登陆
                this.getinfo(); //获取用户信息
                this.refresh_jwt_token();  //定时刷新token
            } else { //未登录
                this.login();
            }

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

            headers: {
                'Authorization': "Bearer " + this.root.access,
            },

            success: function(resp) {
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
        $.ajax({
            //获取参数
            url: "https://rdstihz.top:444/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: resp => {
                if(resp.result === "success") {
                    this.root.AcWingOS.api.oauth2.authorize(resp.appid, resp.redirect_uri, resp.scope, resp.state, resp => {
                        if(resp.result === "success") {
                            this.username = resp.username;
                            this.photo = resp.photo;
                            this.hide();
                            this.root.menu.show();
                            
                            this.root.access = resp.access;
                            this.root.refresh = resp.refresh;
                            console.log(resp);
                            console.log("ACAPPLOGIN", this.root.access, this.root.refresh);
                            this.refresh_jwt_token();
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

    login_remote(username, password){
        username = username || this.$login_username.val();
        password = password || this.$login_password.val();
        this.$login_error_messages.empty();
        $.ajax({
            url: "https://rdstihz.top:444/settings/api/token/",
            type: "POST",
            data: {
                username: username,
                password: password,
            },
            success: resp => {
                //登录成功
                console.log(resp);
                this.root.access = resp.access;
                this.root.refresh = resp.refresh;
                this.refresh_jwt_token();
                this.getinfo();
            },
            error: () => {
                this.$login_error_messages.html("用户名或密码错误");
            }
        });

    }

    register_remote(){
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_messages.empty();
        $.ajax({
            url: "https://rdstihz.top:444/settings/register/",
            type: "POST",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: resp => {
                if(resp.result === "success") {
                    this.login_remote(username, password);
                }else{
                    this.$register_error_messages.html(resp.result);
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
    
    refresh_jwt_token() { // 刷新jwt token
        setInterval(()=> {
            $.ajax({
                url: "https://rdstihz.top:444/settings/api/token/refresh/",
                type: "POST",
                data: {
                    'refresh': this.root.refresh,
                },
                success: resp => {
                   this.root.access = resp.access;
                }
            });
            console.log(this.root.access);
        }, 4.5 * 60 * 1000); //每4.5min刷新一次token

        setTimeout(()=>{
            $.ajax({
                url: "https://rdstihz.top:444/settings/ranklist/",
                type: "GET",
                headers: {
                    'Authorization': "Bearer " + this.root.access,
                },
                success: resp => {
                    console.log(resp);
                }
            });
        }, 5000);

    }

}
