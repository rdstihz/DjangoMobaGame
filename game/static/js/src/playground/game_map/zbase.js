class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;

        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d'); //2D画布

        this.ctx.canvas.width = playground.width;
        this.ctx.canvas.height = playground.height;

        this.playground.$playground.append(this.$canvas);

        this.timestamp = 0;//时间戳
    }
    start() {
        this.$canvas.focus();
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
