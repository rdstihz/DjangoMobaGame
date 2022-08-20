class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;

        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d'); //2D画布

        this.ctx.canvas.width = playground.width;
        this.ctx.canvas.height = playground.height;

        this.playground.$playground.append(this.$canvas);


    }
    start() {
    }
    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

}
