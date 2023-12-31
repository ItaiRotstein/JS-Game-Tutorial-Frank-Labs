export class Bone {
    constructor(game, x, y) {
        this.game = game
        this.width = 96
        this.height = 96
        this.x = Math.random() * this.game.width + this.game.width
        this.y = this.game.height - this.height - this.game.groundMargin
        this.image = document.getElementById('bone')
        this.markedForDeletion = false
    }
    update() {
        this.x = this.x -= this.game.speed
        if (this.x + this.width < 0) this.markedForDeletion = true
    }
    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
}
