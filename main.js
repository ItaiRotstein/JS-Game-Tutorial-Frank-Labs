import { Player } from './player.js'
import { InputHandler } from './input.js'
import { Background } from './background.js'
import { FlyingEnemy, ClimbingEnemy, GroundEnemy } from './enemies.js'
import { UI } from './UI.js'
import { Bone } from './bone.js'

window.addEventListener('load', function () {
    const canvas = this.document.getElementById('canvas1')
    const ctx = canvas.getContext('2d')
    canvas.width = 900
    canvas.height = 500

    class Game {
        constructor(width, height) {
            this.width = width
            this.height = height
            this.groundMargin = 50
            this.speed = 0
            this.maxSpeed = 6
            this.background = new Background(this)
            this.player = new Player(this)
            this.input = new InputHandler(this)
            this.UI = new UI(this)
            this.bones = [new Bone(this)]
            this.enemies = []
            this.particles = []
            this.maxParticles = 50
            this.collisions = []
            this.floatingMessages = []
            this.powerBar = 0
            this.enemyTimer = 0
            this.enemyInterval = 2000
            this.debug = false
            this.score = 0
            this.fontColor = 'black'
            this.time = 10000
            // this.maxTime = 10000
            this.gameOver = false
            this.lives = 5
            this.player.currentState = this.player.states[0]
            this.player.currentState.enter()
        }
        update(deltaTime) {
            // this.time -= deltaTime
            //game over
            if (this.time < deltaTime
                //  || this.lives === 0
            ) this.gameOver = true
            //handle background
            this.background.update()
            // handle player
            this.player.update(this.input.keys, deltaTime)
            //handleEnemies
            if (this.enemyTimer > this.enemyInterval) {
                this.addEnemy()
                this.enemyTimer = 0
            } else {
                this.enemyTimer += deltaTime
            }
            this.enemies.forEach(enemy => {
                enemy.update(deltaTime)
            })
            //handle floating messages
            this.floatingMessages.forEach(message => {
                message.update()
            })
            //handle particles
            this.particles.forEach(particle => {
                particle.update()
            })
            if (this.particles.length > this.maxParticles) {
                this.particles.length = this.maxParticles
            }
            //handle collision sprites
            this.collisions.forEach(collision => {
                collision.update(deltaTime)
            })
            //bones
            if (this.bones.length < 1 && this.powerBar === 0) this.addBone()
            this.bones.forEach(bone => {
                bone.update()
            })
            //filtering items
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion)
            this.floatingMessages = this.floatingMessages.filter(message => !message.markedForDeletion)
            this.particles = this.particles.filter(particle => !particle.markedForDeletion)
            this.collisions = this.collisions.filter(collision => !collision.markedForDeletion)
            this.bones = this.bones.filter(bone => !bone.markedForDeletion)
        }
        draw(context) {
            this.background.draw(context)
            this.player.draw(context)
            this.enemies.forEach(enemy => {
                enemy.draw(context)
            })
            this.particles.forEach(particle => {
                particle.draw(context)
            })
            this.collisions.forEach(collision => {
                collision.draw(context)
            })
            this.floatingMessages.forEach(message => {
                message.draw(context)
            })

            this.bones.forEach(bone => {
                bone.draw(context)
            })
            this.UI.draw(context)
        }
        addEnemy() {
            if (game.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this))
            else if (game.speed > 0) this.enemies.push(new ClimbingEnemy(this))
            this.enemies.push(new FlyingEnemy(this))
        }
        addBone() {
            this.bones.push(new Bone(this))
        }
    }

    const game = new Game(canvas.width, canvas.height)
    console.log(game);
    let lastTime = 0
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.update(deltaTime)
        game.draw(ctx)
        if (!game.gameOver) requestAnimationFrame(animate)
    }
    animate(0)
})