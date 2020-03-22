import { _DoTween } from "./DoTween";
import { _Scheduler } from "./Scheduler";
/**
*
* @ author:Bishop
* @ email:1065742155@qq.com
* @ data: 2020-03-21 00:13
*/
export default class Game extends Laya.Scene {

    constructor() {
        super();
    }

    onAwake() {
        console.log("start...");
        window.G_Scheduler = _Scheduler.getInstance();
        window.G_DoTween = _DoTween.getInstance();
        Laya.Scene3D.load("res/scene/LayaScene_SampleScene/Conventional/SampleScene.ls", Laya.Handler.create(
            this, this.LoadFinished));
    }

    LoadFinished(scene) {
        Laya.stage.addChild(scene);
        this._gameScene = scene;
        scene.zOrder = -1;
        this._camera = scene.getChildByName("Main Camera");
        console.log(this._camera);
        this.dice1 = scene.getChildByName("骰子1");
        this.dice2 = scene.getChildByName("骰子2");
        this.dice3 = scene.getChildByName("骰子3");
        this.dice4 = scene.getChildByName("骰子4");
        this.dice5 = scene.getChildByName("骰子5");

        let start = {}
        start.position = this.dice5.transform.position.clone();
        start.rotationEuler = this.dice5.transform.position.clone();
        start.fieldOfView = this.dice5.fieldOfView;
        
        let end = {}
        end.position = this.dice4.transform.position.clone();
        end.rotationEuler = G_DoTween.getLookAtAngle(this.dice4.transform.position, this.dice3.transform.position, this.dice5.transform.localRotationEuler, new Laya.Vector3(0,0,1));
        console.log(end.rotationEuler);
        end.fieldOfView = this.dice4.fieldOfView;
        let plane = G_DoTween.getAxisOfMaxDistance(start.position, end.position);
        plane = G_DoTween.getAxisOfagainst(plane);
        G_DoTween.tweenMoveCamera(this.dice5, 5000, false, start, end, false, true, plane, null);

        G_DoTween.moveToByOffset(this.dice3, new Laya.Vector3(0,0,5), 1000);
        G_DoTween.moveToByOffset(this.dice2, new Laya.Vector3(0,0,5), 1000);
        G_DoTween.moveToByOffset(this.dice1, new Laya.Vector3(0,0,5), 1000);
    }
}