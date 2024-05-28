import { Scalar, Vector3 } from "@babylonjs/core";

class GameLogic {
    constructor(game) {
        this.game = game;
    }

    update(delta) {
        if (!this.game.gameOver && this.game.isMoving) {
            this.updateObstacles(delta);
            this.updateJumping(delta);
            this.updateTracks(delta);
            this.updateEiffelTowers(delta);
        }
    }

    updateObstacles(delta) {
        for (let i = 0; i < this.game.obstacles.length; i++) {
            let obstacle = this.game.obstacles[i];
            obstacle.position.z -= this.game.SPEED_Z * delta;
            if (obstacle.position.z < 0) {
                this.game.score++;
                let x = Scalar.RandomRange(-this.game.TRACK_WIDTH / 2, this.game.TRACK_WIDTH / 2);
                let z = Scalar.RandomRange(this.game.SPAWN_POS_Z - 15, this.game.SPAWN_POS_Z + 15);
                obstacle.position.set(x, 0.5, z);
            } else {
                if (this.game.playerBox.intersectsMesh(obstacle, false)) {
                    this.game.endGame();
                }
            }
        }

        // if (this.game.score >= this.game.targetScore && this.game.livesRemaining > 0) {
        //     this.game.displayWinScreen();
        //     this.game.gameOver = true;  
        //     return;  
        //}
    }

    updateJumping(delta) {
        if (this.game.jumping) {
            let elapsedTime = (Date.now() - this.game.jumpStartTime) / 1000.0;
            if (elapsedTime < this.game.jumpDuration) {
                this.game.player.position.y = this.game.jumpStartY + this.game.jumpHeight * Math.sin((elapsedTime / this.game.jumpDuration) * Math.PI);
            } else {
                this.game.player.position.y = this.game.jumpStartY;
                this.game.jumping = false;
                this.game.startRunningAnimation();
            }
        }
    }

    updateTracks(delta) {
        for (let i = 0; i < this.game.tracks.length; i++) {
            let track = this.game.tracks[i];
            track.position.z -= this.game.SPEED_Z / 3 * delta;
            if (track.position.z <= 0) {
                let nextTrackIdx = (i + this.game.tracks.length - 1) % this.game.tracks.length;
                track.position.z = this.game.tracks[nextTrackIdx].position.z + this.game.TRACK_DEPTH;
            }
        }
    }

    updateEiffelTowers(delta) {
        for (let i = 0; i < this.game.eiffelTowers.length; i++) {
            let eiffel = this.game.eiffelTowers[i];
            eiffel.position.z -= this.game.SPEED_Z * delta;
            if (eiffel.position.z < 0) {
                let x = Scalar.RandomRange(-this.game.TRACK_WIDTH / 2, this.game.TRACK_WIDTH / 2);
                let z = Scalar.RandomRange(this.game.SPAWN_POS_Z - 15, this.game.SPAWN_POS_Z + 15);
                eiffel.position.set(x, 0.5, z);
            } else {
                if (this.game.playerBox.intersectsMesh(eiffel, false)) {
                    this.game.eiffelCollected++;
                    let x = Scalar.RandomRange(-this.game.TRACK_WIDTH / 2, this.game.TRACK_WIDTH / 2);
                    let z = Scalar.RandomRange(this.game.SPAWN_POS_Z - 15, this.game.SPAWN_POS_Z + 15);
                    eiffel.position.set(x, 0.5, z);
                }
            }
        }

        if (this.game.eiffelCollected >= this.game.targetEiffelCount && this.game.livesRemaining > 0) {
            this.game.displayWinScreen();
            this.game.gameOver = true;  
            return;  
        }
    }

    updateMoves(delta) {
        if (!this.game.gameOver) {
            if (this.game.inputHandler.inputMap["ArrowLeft"]) { 
                this.game.player.position.x -= this.game.SPEED_X * delta;
                if (this.game.player.position.x < -3.75)
                    this.game.player.position.x = -3.75;
            } else if (this.game.inputHandler.inputMap["ArrowRight"]) { 
                this.game.player.position.x += this.game.SPEED_X * delta;
                if (this.game.player.position.x > 3.75)
                    this.game.player.position.x = 3.75;
            }
        }
    }
}

export default GameLogic;
