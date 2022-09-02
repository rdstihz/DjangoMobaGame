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
