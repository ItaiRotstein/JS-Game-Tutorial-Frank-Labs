import { Falling, Jumping, Running, Sitting, Rolling, Diving, Hit, GameOver } from './playerStates.js'
import { CollisionAnimation } from './collisionAnimation.js'
import { FloatingMessages } from './floatingMessages.js'
import { Splash } from './particles.js'

export class Player {
    constructor(game) {
        this.game = game
        this.width = 100
        this.height = 91.3
        this.x = 0
        this.y = this.game.height - this.height - this.game.groundMargin
        this.vy = 0 //vy means Velocity of Y
        this.weight = 1
        this.image = document.getElementById('player')
        this.frameX = 0
        this.frameY = 0
        this.maxFrame
        this.fps = 20
        this.frameInterval = 1000 / this.fps
        this.frameTimer = 0
        this.speed = 0
        this.maxSpeed = 10
        this.states = [new Sitting(this.game), new Running(this.game), new Jumping(this.game), new Falling(this.game), new Rolling(this.game), new Diving(this.game), new Hit(this.game), new GameOver(this.game)]
        this.currentState = null
    }
    update(input, deltaTime) {
        this.checkCollision()
        this.currentState.handleInput(input)
        //horizontal movement
        this.x += this.speed
        if (input.includes('ArrowRight') && this.currentState !== this.states[6]) this.speed = this.maxSpeed
        else if (input.includes('ArrowLeft') && this.currentState !== this.states[6]) this.speed = -this.maxSpeed
        else this.speed = 0
        //horizontal boundaries
        if (this.x < 0) this.x = 0
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width
        //vertical movement
        this.y += this.vy
        if (!this.onGround()) this.vy += this.weight
        else this.vy = 0
        //vertical boundaries
        if (this.y + this.height > this.game.height - this.game.groundMargin) this.y = this.game.height - this.game.groundMargin - this.height
        //sprite animation
        //if state is game over increase the frameinterval to make the dying animation slower
        if (this.currentState === this.states[7]) this.frameInterval += 2.5
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0
            if (this.frameX < this.maxFrame) this.frameX++
            else this.frameX = 0
        } else {
            this.frameTimer += deltaTime
        }

    }
    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height)
        context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
    }
    onGround() {
        return this.y >= this.game.height - this.height - this.game.groundMargin
    }
    setState(state, speed) {
        this.currentState = this.states[state]
        this.game.speed = this.game.maxSpeed * speed
        this.currentState.enter()
    }
    checkCollision() {
        //with enemies
        this.game.enemies.forEach(enemy => {
            if (enemy.x < this.x + this.width &&
                enemy.x + enemy.width > this.x &&
                enemy.y < this.y + this.height &&
                enemy.y + enemy.height > this.y) {
                enemy.markedForDeletion = true
                this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5))
                if (this.currentState === this.states[4] ||
                    this.currentState === this.states[5]) {
                    this.game.score++
                    this.game.floatingMessages.push(new FloatingMessages('+1', enemy.x, enemy.y, 150, 50))
                } else {
                    // //go into HIT / game over state
                    this.game.lives--
                    if (this.game.lives <= 0) {
                        this.setState(7, 0)
                    } else {
                        this.setState(6, 0)
                    }
                }
            }
        })
        //with bone
        this.game.bones.forEach(bone => {
            if (bone.x < this.x + this.width &&
                bone.x + bone.width > this.x &&
                bone.y < this.y + this.height &&
                bone.y + bone.height > this.y) {
                bone.markedForDeletion = true
                this.game.powerBar = 100
                for (let i = 0; i < 30; i++) {
                    this.game.particles.unshift(new Splash(this.game, bone.x + bone.width * 0.5, bone.y + bone.height * 0.5, 'bone'))
                }
            }
        })
    }
}