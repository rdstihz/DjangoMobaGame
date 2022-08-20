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
class AcGamePlayground{
    constructor(root) {
        this.root = root;
        this.$playground = $(`
<h1>游戏界面</h1>
`);
        this.hide();
        this.root.$ac_game.append(this.$playground);
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

}
class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#'+id);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }


    start() {

    }

}
