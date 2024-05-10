class PlayerController {
    constructor(scene, inputMap, player, playerBox, animationGroups) {
        this.scene = scene;
        this.inputMap = inputMap;
        this.player = player;
        this.playerBox = playerBox;
        this.animationGroups = animationGroups;
        this.currentAnimation = 'idle';
        this.isJumping = false;
        this.isMoving = false;
        this.running = false;
        this.jumpHeight = 2;
        this.jumpDuration = 0.3;
        this.jumpStartTime = 0;
        this.jumpStartY = 0;

        this.initPlayerActions();
    }

    initPlayerActions() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {
        if (event.code === "Space") {
            this.jump();
        }
    }

    handleKeyUp(event) {
        this.inputMap[event.code] = false;
    }
    

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.jumpStartTime = Date.now();
            this.jumpStartY = this.player.position.y;
            this.startJumpingAnimation();
        }
    }

    startIdleAnimation() {
        this.animationGroups.forEach(group => group.stop());
        this.animationGroups[0].play(true);
        this.currentAnimation = 'idle';
    }

    startRunningAnimation() {
        if (this.currentAnimation !== 'running') {
            this.animationGroups.forEach(group => group.stop());
            this.animationGroups[2].play(true);
            this.currentAnimation = 'running';
            this.isMoving = true;
            this.running = true;
        }
    }

    startJumpingAnimation() {
        if (this.currentAnimation !== 'jumping') {
            this.animationGroups.forEach(group => group.stop());
            this.animationGroups[1].play(true);
            this.currentAnimation = 'jumping';
        }
    }

    update(delta) {
        if (this.isMoving) {
            if (this.jumping) {
                let elapsedTime = (Date.now() - this.jumpStartTime) / 1000.0;
                if (elapsedTime < this.jumpDuration) {
                    this.player.position.y = this.jumpStartY + this.jumpHeight * Math.sin((elapsedTime / this.jumpDuration) * Math.PI);
                } else {
                    this.player.position.y = this.jumpStartY;
                    this.jumping = false;
                    this.startRunningAnimation();
                }
            }
        }
    }
    
    checkCollisions(obstacles) {
        if (!this.isMoving || this.jumping) {
            return;
        }
        
        for (let i = 0; i < obstacles.length; i++) {
            let obstacle = obstacles[i];
            if (this.playerBox.intersectsMesh(obstacle, false)) {
                this.endGame();
                break; 
            }
        }
    }
    

   

}

export default PlayerController;
