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

        let start = {}
        start.position = this.dice1.transform.position.clone();
        start.rotationEuler = this.dice1.transform.position.clone();
        start.fieldOfView = this.dice1.fieldOfView;
        
        let end = {}
        end.position = this.dice2.transform.position.clone();
        end.rotationEuler = this.dice2.transform.position.clone();
        end.fieldOfView = this.dice2.fieldOfView;
        let plane = G_DoTween.getAxisOfMaxDistance(start.position, end.position);
        plane = G_DoTween.getAxisOfagainst(plane);
        G_DoTween.tweenMoveCamera(this.dice1, 2000, false, start, end, false, true, plane, null);
    }
}