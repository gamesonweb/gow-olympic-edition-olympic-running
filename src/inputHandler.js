class InputHandler {
    constructor(game) {
        this.game = game;
        this.inputMap = {};
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {
        this.inputMap[event.code] = true;
        this.game.htmlUI.updateKeyPressedDisplay(event.code); 
        if (event.code === "Enter" && !this.game.gameStarted) {
            this.game.gameStarted = true;
            this.game.isMoving = true;
            this.game.running = true;
            this.game.startRunningAnimation();
        } else if (event.code === "Space" && !this.game.jumping && this.game.gameStarted) {
            this.game.jumping = true;
            this.game.jumpStartTime = Date.now();
            this.game.jumpStartY = this.game.player.position.y;
            this.game.startJumpingAnimation();
        }
    }

    handleKeyUp(event) {
        this.inputMap[event.code] = false;
    }
}

export default InputHandler;
