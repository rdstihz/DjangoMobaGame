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
                if(resp.result === "success") {
                    outer.root.AcWingOS.api.oauth2.authorize(resp.appid, resp.redirect_uri, resp.scope, resp.state, function(resp){
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
