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
