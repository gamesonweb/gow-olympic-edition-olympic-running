import { Engine, Scene, Scalar } from "@babylonjs/core";
import InputHandler from "./inputHandler";
import HtmlUI from "./htmlUI";
import GameLogic from "./gameLogic";
import SceneCreator from "./sceneCreator";

class Game {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.scene = new Scene(this.engine);

        this.TRACK_WIDTH = 8;
        this.TRACK_HEIGHT = 0.1;
        this.TRACK_DEPTH = 3;
        this.NB_TRACKS = 50;
        this.NB_OBSTACLES = 10;
        this.SPAWN_POS_Z = (this.TRACK_DEPTH * this.NB_TRACKS);
        this.SPEED_Z = 40;
        this.SPEED_X = 10;

        this.firstObstacleAvoided = false;
        this.startTimer;
        this.score = 0;
        this.gameOver = false;
        this.isMoving = false;
        this.player = null;
        this.playerBox = null;
        this.obstacles = [];
        this.tracks = [];
        this.eiffelTowers = [];
        this.jumping = false;
        this.jumpDuration = 0.5;
        this.jumpHeight = 3;
        this.jumpElapsedTime = 0;
        this.targetScore = 50;
        this.gameStarted = false;
        this.livesRemaining = 3;
        this.playerLives = 3;

        this.inputHandler = new InputHandler(this);
        this.htmlUI = new HtmlUI(this);
        this.gameLogic = new GameLogic(this);
        this.sceneCreator = new SceneCreator(this);
    }

    async init() {
        this.engine.displayLoadingUI();
        await this.sceneCreator.createScene();
        this.engine.hideLoadingUI();
        console.log("Player initialized:", this.player);
    }

    start() {
        this.engine.runRenderLoop(() => {
            let delta = this.engine.getDeltaTime() / 1000.0;
            if (!this.gameOver) {
                this.gameLogic.updateMoves(delta);
                this.gameLogic.update(delta);
            }
            this.updateScoreDisplay();
            this.scene.render();
        });
    }

    startGame() {
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.isMoving = false;
        this.running = false;
        this.livesRemaining = 3;
        this.playerLives = 3;

        this.htmlUI.createBackButton();
    }

    restartGame() {
        this.htmlUI.gameOverScreen.style.display = "none";
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.isMoving = false;
        this.running = false;
        this.livesRemaining = 3;
        this.playerLives = 3;
        this.htmlUI.updateHeartDisplay();
        this.livesRemaining = 3;
        this.player.position.set(0, this.TRACK_HEIGHT / 2, 6);
        this.animationGroups.forEach(group => group.stop());
        this.startIdleAnimation();
        this.tracks.forEach((track, index) => {
            track.position.z = this.TRACK_DEPTH * index;
        });
        this.obstacles.forEach((obstacle, index) => {
            let x = Scalar.RandomRange(-this.TRACK_WIDTH / 2, this.TRACK_WIDTH / 2);
            let z = Scalar.RandomRange(this.SPAWN_POS_Z - 15, this.SPAWN_POS_Z + 15);
            obstacle.position.set(x, 0.5, z);
        });
        this.music.play();
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

    updateScoreDisplay() {
        this.htmlUI.scoreDisplay.textContent = `Score: ${this.score} / ${this.targetScore}`;
    }

    displayWinScreen() {
        this.gameOver = true;
        this.isMoving = false;
        this.htmlUI.gameOverScreen.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <img src="https://img.freepik.com/vecteurs-libre/personnage-gagnant-gagnant-design-plat_23-2147877481.jpg?t=st=1714590790~exp=1714594390~hmac=b9865df3e46e71c9810adb9daa214fdb0d37567dc590673d132a1c2842401759&w=740" alt="Winner" style="max-width: 90%; max-height: 100%; width: 90%; height: 80%;">
                <button id="restartButton" style="position: absolute; top: 80%; left: 50%; transform: translateX(-50%); padding: 10px 20px; font-size: 24px; background-color: #4CAF50; color: white; border: none; border-radius: 10px; cursor: pointer;">Restart</button>
            </div>
        `;
        const restartButton = this.htmlUI.gameOverScreen.querySelector("#restartButton");
        restartButton.addEventListener("click", () => {
            this.restartGame();
        });
        this.htmlUI.gameOverScreen.style.display = "block";
    }

    displayGameOverScreen() {
        this.gameOver = true;
        this.isMoving = false;
        this.htmlUI.gameOverScreen.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <img src="https://img.freepik.com/premium-vector/game-neon-glitch-style_212474-678.jpg" alt="Game Over" style="max-width: 100%; max-height: 100%; width: 100%; height: 100%;">
                <button id="restartButton" style="position: absolute; top: 80%; left: 50%; transform: translateX(-50%); padding: 10px 20px; font-size: 24px; background-color: #4CAF50; color: white; border: none; border-radius: 10px; cursor: pointer;">Restart</button>
            </div>
        `;
    
        const restartButton = this.htmlUI.gameOverScreen.querySelector("#restartButton");
        restartButton.addEventListener("click", () => {
            this.restartGame();
        });
    
        this.htmlUI.gameOverScreen.style.display = "block";
    }

    displayRemainingLivesScreen() {
        const remainingLives = this.livesRemaining;
        this.htmlUI.gameOverScreen.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(226, 245, 39, 0.8); text-align: center;">
                <h2>You have ${remainingLives} out of 3 lives remaining.</h2>
                <button id="continueButton" style="padding: 10px 20px; font-size: 24px; background-color: #4CAF50; color: white; border: none; border-radius: 10px; cursor: pointer; margin-right: 10px;">Continue</button>
                <button id="restartButton" style="padding: 10px 20px; font-size: 24px; background-color: #FF0000; color: white; border: none; border-radius: 10px; cursor: pointer;">Restart</button>
            </div>
        `;
    
        const continueButton = this.htmlUI.gameOverScreen.querySelector("#continueButton");
        continueButton.addEventListener("click", () => {
            this.htmlUI.gameOverScreen.style.display = "none";
            this.gameOver = false;
            this.isMoving = true;
            this.playerLives = remainingLives;
            this.htmlUI.updateHeartDisplay();
        });
    
        const restartButton = this.htmlUI.gameOverScreen.querySelector("#restartButton");
        restartButton.addEventListener("click", () => {
            this.restartGame();
        });
    
        this.htmlUI.gameOverScreen.style.display = "block";
    }

    showStartScreen() {
        this.htmlUI.startScreen.style.display = "block";
        this.htmlUI.heartContainer.style.display = "none";
        if (this.htmlUI.backButton) {
            this.htmlUI.backButton.remove();
        }
    }

    endGame() {
        console.log("Game Over");
        this.gameOver = true;
        this.music.stop();
        this.livesRemaining--;
        this.playerLives = this.livesRemaining > 0 ? this.livesRemaining : 0;
        
        if (this.livesRemaining <= 0) {
            this.displayGameOverScreen();
        } else {
            this.displayRemainingLivesScreen();
            this.player.position.set(0, this.TRACK_HEIGHT / 2, 6);
            this.htmlUI.updateHeartDisplay();
        }
    }
}

export default Game;
