import { SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import playerUrl from "../assets/models/playerHurdles.glb";

class Player {
    scene;
    transform;
    gameObject;
    animationsGroup;
    jumping = false;
    jumpStartTime = 0;
    jumpStartY = 0;
    jumpDuration = 0.5; // Thời gian nhảy (tùy chỉnh)
    jumpHeight = 4; // Độ cao khi nhảy (tùy chỉnh)
    currentAnimation = "idle";

    constructor(scene) {
        this.scene = scene;
        this.transform = new TransformNode("");
        this.currentAnimation = "idle"; 
    }

    async init() {
        const result = await SceneLoader.ImportMeshAsync("", "", playerUrl, this.scene);
        this.gameObject = result.meshes[0];
        this.gameObject.position.set(0, TRACK_HEIGHT / 2, 6); 
        this.gameObject.rotation = new Vector3(0, 0, 0); 
        this.gameObject.scaling = new Vector3(1, 1, 1); 
        this.animationsGroup = result.animationGroups;
        this.playAnimation("idle");
    }

    update(inputMap, delta) {
       // Xử lý bàn phím để chuyển đổi trạng thái và animation của người chơi
       if (inputMap["Space"] && !this.jumping) { // Thay "KeyJ" bằng "Space" để nhảy bằng phím Space
        this.jump();
    } else if (inputMap["ArrowUp"]) { // Thay "KeyZ" bằng "ArrowUp" để chạy bằng mũi tên lên
        this.run();
    } else if (!inputMap["ArrowUp"] && this.currentAnimation === "running") { // Nếu ngừng nhấn mũi tên lên và đang ở trạng thái chạy
        this.idle();
    }

        if (this.jumping) {
            let elapsedTime = (Date.now() - this.jumpStartTime) / 1000.0;
            if (elapsedTime < this.jumpDuration) {
                this.gameObject.position.y = this.jumpStartY + this.jumpHeight * Math.sin((elapsedTime / this.jumpDuration) * Math.PI);
            } else {
                this.gameObject.position.y = this.jumpStartY;
                this.jumping = false;
            }
        }
    }
    getPosition() {
        return this.gameObject.position;
    }
     // Thêm các phương thức mới để chạy các animation cụ thể
     idle() {
        this.playAnimation("idle");
        this.currentAnimation = "idle";
    }

    run() {
        this.playAnimation("running");
        this.currentAnimation = "running";
    }

    jump() {
        if (!this.jumping) {
            this.jumping = true;
            this.jumpStartTime = Date.now();
            this.jumpStartY = this.gameObject.position.y;
            this.playAnimation("jumping");
            this.currentAnimation = "jumping";
        }
    }

    playAnimation(animationName) {
        if (this.animationsGroup) {
            this.animationsGroup.forEach(group => {
                group.stop();
            });

            this.animationsGroup.forEach(group => {
                if (group.name === animationName) {
                    group.play(true);
                    this.currentAnimation = animationName;
                }
            });
        }
    }
}


export default Player;
