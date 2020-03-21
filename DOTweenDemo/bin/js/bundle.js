(function () {
    'use strict';

    /**
    *
    * @ author:Bishop
    * @ email:1065742155@qq.com
    * @ data: 2020-03-21 20:39
    */
    var _DoTween = (function () {
    	var _instance;

    	function init() {
    		// body...
    		console.log('Init _DoTween Instance...');

    		return {
            
                tweenMoveCamera: function (camera, duration, isLocal, start, end, disableEffects, iscamber, plane, cb) {
    				if (camera) {
    					if (camera._scheduleKey) {
    						G_Scheduler.unschedule(camera._scheduleKey);
    						camera._scheduleKey = "";
    					}

    					if (isLocal) {
    						let targetPos = start.position.clone();
    						if (disableEffects.posX === true) {
    							targetPos.x = camera.transform.localPosition.x;
    						}
    						camera.transform.localPosition = targetPos;

    						camera.transform.localRotationEuler = start.rotationEuler.clone();
    					}
    					else {
    						let targetPos = start.position.clone();
    						if (disableEffects.posX === true) {
    							targetPos.x = camera.transform.position.x;
    						}
    						camera.transform.position = targetPos;
    						camera.transform.rotationEuler = start.rotationEuler.clone();
    					}
    					camera.fieldOfView = start.fieldOfView;

    					// schedule
    					camera._scheduleKey = "key_of_tween_move_camera";
    					camera._passedTime = 0;
    					camera._totalTime = duration;
    					camera._isLocal = isLocal;
    					camera._start = start;
    					camera._end = end;
    					camera._disableEffects = disableEffects;
                        camera._cb = cb;
                        
    					G_Scheduler.schedule(camera._scheduleKey, function () {
    						camera._passedTime += Laya.timer.delta;
    						let progress = camera._passedTime / camera._totalTime;
    						if (progress > 1.0) {
    							progress = 1.0;
    						}
                            let targetPos;
    						// update
    						if (camera._isLocal) {
                                
                                if (iscamber)
                                    targetPos = this.getArcVec3(camera._start.position, camera._end.position, progress, plane);
                                else
                                    targetPos = this.getMidVec3(camera._start.position, camera._end.position, progress);
    							if (camera._disableEffects.posX === true) {
    								targetPos.x = camera.transform.localPosition.x;
    							}
    							camera.transform.localPosition = targetPos;
    							camera.transform.localRotationEuler = this.getMidVec3(camera._start.rotationEuler, camera._end.rotationEuler, progress);
    						}
    						else {
    							if (iscamber)
                                    targetPos = this.getArcVec3(camera._start.position, camera._end.position, progress, plane);
                                else
                                    targetPos = this.getMidVec3(camera._start.position, camera._end.position, progress);
    							if (camera._disableEffects.posX === true) {
    								targetPos.x = camera.transform.position.x;
    							}
    							camera.transform.position = targetPos;
    							camera.transform.rotationEuler = this.getMidVec3(camera._start.rotationEuler, camera._end.rotationEuler, progress);
    						}
    						camera.fieldOfView = camera._start.fieldOfView + (camera._end.fieldOfView - camera._start.fieldOfView) * progress;

    						if (progress === 1.0) {
    							G_Scheduler.unschedule(camera._scheduleKey);
    							camera._scheduleKey = "";

    							let _cb = camera._cb;
    							camera._cb = null;
    							if (typeof _cb === "function") {
    								_cb();
    							}
    						}
    					}.bind(this), true);
    				}
    			},

    			getMidVec3: function(fromPos, endPos, progress) {
    				let midPos = new Laya.Vector3();
    				midPos.x = fromPos.x + this._caculateMultiply((endPos.x - fromPos.x), progress);
    				midPos.y = fromPos.y + this._caculateMultiply((endPos.y - fromPos.y), progress);
    				midPos.z = fromPos.z + this._caculateMultiply((endPos.z - fromPos.z), progress);
    		
    				return midPos
                },
                
                // getArcVec3: function(fromPos, endPos, progress, plane) {
                //     if (plane !== "X" && plane !== "Y" &&plane !== "Z") {
                //         console.log("plane参数是描述绕哪个面来画弧运动， 输入\"X\" \"Y\"或 \"Z\"。默认 X 轴 ");
                //     } else
                //         plane = "X";
                //     let r = Laya.Vector3.distance(fromPos, endPos)/2;
                //     let angle = 90 * progress
                //     let sinAngle = Math.sin(this._caculateMultiply(angle,Math.PI)/180);
                //     let c = Math.pow(sinAngle * 2 * r, 2);
                //     let TPos = new Laya.Vector3();
                //     TPos.x = (endPos.x - fromPos.x) * progress + fromPos.x;
                //     TPos.y = (endPos.y - fromPos.y) * progress + fromPos.y;
                //     let n = c - Math.pow(TPos.x - fromPos.x, 2) - Math.pow(TPos.y - fromPos.y, 2);
                //     let z1 =  this._sqrt(n)+ fromPos.z
                //     let z2 = -this._sqrt(n) + fromPos.z
                //     //TPos.z = (endPos.z - endPos.z) * progress + fromPos.z > 0 ? Math.abs(z) : -Math.abs(z);
                //     TPos.z = z2;
                //     console.log(endPos);
                //     console.log(TPos);
                //     return TPos;
                // },

                /**
                 * 得到圆弧曲线, 可做摄像机电影模式的转移，可模拟重力等抛物线运动
                 * @param {*} fromPos 起点
                 * @param {*} endPos 终点
                 * @param {*} progress 完成度
                 * @param {*} plane 弧面 ：可选值 "X" "Y" "Z" ["X","Y"] ["X","Z"] ["Y","Z"] ["X","Y","Z"]
                 * @param {*} curvature 曲率 ： isMultiple 为true时，表示
                 * 弯曲程度，弯曲程度等于终点到起点的一半，刚好构成圆弧（默认为空）， 否则代表圆弧直径大小
                 * @param {*} isMultiple 是否是圆弧
                 */
                getArcVec3: function(fromPos, endPos, progress, plane, curvature, isMultiple) {
                    let r = Laya.Vector3.distance(fromPos, endPos)/2;
                    let angle = 90 * progress;
                    let sinAngle = Math.sin(this._caculateMultiply(angle,Math.PI/180));
                    let c;  // 中间时刻曲值大小， 圆弧最大时的最大值
                    if (curvature === undefined || curvature === null)
                        c = Math.pow(sinAngle * 2 * r, 2);
                    else if (isMultiple){
                        c = Math.pow(sinAngle * 2 * r, 2) * curvature;
                    }
                    else {
                        c = curvature;
                    }
                    let TPos = new Laya.Vector3();
                    let n = -4*r*progress*(progress-1);
                    TPos.z = (endPos.z - fromPos.z) * progress + fromPos.z + ((plane.indexOf("Z")>= -1) ? n : 0);
                    TPos.y = (endPos.y - fromPos.y) * progress + fromPos.y + ((plane.indexOf("Y")>= -1) ? n : 0);
                    TPos.x = (endPos.x - fromPos.x) * progress + fromPos.x + ((plane.indexOf("X")>= -1) ? n : 0);
                    return TPos;
                },

                /**
                 * 得到两点距离最长的轴方向
                 * @param {*} firstPos 第一个点
                 * @param {*} secondPos 第二个点
                 */
                getAxisOfMaxDistance : function(firstPos, secondPos) {
                    let _x = Math.abs(firstPos.x - secondPos.x);
                    let _y = Math.abs(firstPos.y - secondPos.y);
                    let _z = Math.abs(firstPos.z - secondPos.z);
                    let ret = "";
                    let max = 1000000000;
                    if (max > _x){
                        max = _x;
                        ret = "X";
                    }
                    if (max > _y) {
                        max = _y;
                        ret = "Y";
                    }
                    if (max > _z) {
                        max = _z;
                        ret = "Z";
                    }
                    return ret;
                },

                getAxisOfagainst(axis) {
                    if (axis == "X")
                        return ["Y","Z"]
                    if (axis == "Y")
                        return ["X","Z"]
                    if (axis == "Z")
                        return ["Y","X"]
                },
    		
    			_caculateMultiply: function(first, second) {
    				return (first * 10000) * (second * 10000) / (100000000)
    			},
                
                _sqrt : function(n) {
                    return Math.sqrt(n * 100000000) / 10000;
                }
            }
        }

            return {
                getInstance: function () {
                    if ( !_instance ) {
                        _instance = init();
                    }
        
                    return _instance;
                }
            };
    })();

    /**
    *
    * @ author:Bishop
    * @ email:1065742155@qq.com
    * @ data: 2020-03-21 20:38
    */
    /*
    * 定时器
    *
    */
    var _Scheduler = function() {
    	var _instance;

    	function init() {
    		// body ...
    		console.log("Init G_Scheduler Instance...");

    		var _scheduledInfos = {};

    		return {
    			/**
    			 * 创建定时器
    			 * @param {String} key 标识符(全局唯一)
    			 * @param {Boolean} cb 回调
    			 * @param {Boolean} useFrame 是否帧循环
    			 * @param {Boolean} interval useFrame为true时，单位为帧，默认为0; useFrame为false时，单位为毫秒，默认为0
    			 * @param {Boolean} repeat 重复次数（默认G_Const.C_SCHEDULE_REPEAT_FOREVER), 传0和1都是回调一次，但0次无法取消
    			 * @returns {Boolean} 成功或失败
    			 */
    			schedule: function ( key, cb, useFrame, interval, repeat ) {
    				// body...
    				if (!this._checkKey(key) || !this._checkCallback(cb)) {
    					return false
    				}

    				if (_scheduledInfos[key]) {
    					return false
    				}

    				// default
    				if (typeof interval === "undefined" || interval === null) {
    					if (useFrame) {
    						interval = 1;
    					}
    					else {
    						interval = 0;
    					}
    				}

    				if (typeof repeat === "undefined" || repeat === null) {
    					repeat = 1561963389461;
    				}

    				let scheduleCb = repeat === 0 ? cb : function ( dt ) {
    					// body...
    					let _info = _scheduledInfos[key];
    					if (_info) {
    						_info.invokeTimes += 1;

    						if (_info.invokeTimes >= repeat) {
    							// temp save
    							let _cb = _info.cb;

    							// unschedule
    							this.unschedule(key);

    							// callback
    							_cb();
    						}
    						else {
    							// callback
    							_info.cb(dt);
    						}
    					}
    				}.bind(this);

    				if (repeat === 0) {
    					if (useFrame) {
    						Laya.timer.frameOnce(interval, this, scheduleCb);
    					}
    					else {
    						Laya.timer.once(interval, this, scheduleCb);
    					}
    				}
    				else {
    					_scheduledInfos[key] = {
    						invokeTimes: 0,
    						cb: cb,
    						scheduleCb: scheduleCb
    					};

    					if (useFrame) {
    						Laya.timer.frameLoop(interval, this, scheduleCb);
    					}
    					else {
    						Laya.timer.loop(interval, this, scheduleCb);
    					}
    				}

    				return true
    			},

    			/**
    			 * 取消定时器
    			 * @param {String} key 标识符(全局唯一)
    			 * @returns {Boolean} 成功或失败
    			 */
    			unschedule: function (key) {
    				// body...
    				if (!this._checkKey(key)) {
    					return false
    				}

    				if (!_scheduledInfos[key]) {
    					return false
    				}

    				Laya.timer.clear(this, _scheduledInfos[key].scheduleCb);

    				// reset
    				delete _scheduledInfos[key];

    				return true
    			},

    			/**
    			 * 是否存在此定时器
    			 * @param {String} key 标识符(全局唯一)
    			 * @returns {Boolean} 存在与否
    			 */
    			isScheduled: function (key) {
    				// body...
    				if (!this._checkKey(key)) {
    					return false
    				}

    				if (!_scheduledInfos[key]) {
    					return false
    				}

    				return true
    			},

    			/**
    			 * 取消所有定时器
    			 */
    			unscheduleAll: function () {
    				// body...
    				for( let key in _scheduledInfos ) {
    					Laya.timer.clear(this, _scheduledInfos[key].cb);
    				}

    				_scheduledInfos = {};
    			},

    			print: function () {
    				console.log(_scheduledInfos);	
    			},

    			_checkKey: function ( key ) {
    				// body...
    				if ((typeof key === "string") && key !== "") {
    					return true
    				}
    		
    				return false
    			},
    		
    			_checkCallback: function ( cb ) {
    				// body...
    				if (typeof cb === "function") {
    					return true
    				}
    		
    				return false
    			}
    		}
    	}

    	return {
    		getInstance: function () {
    			if ( !_instance ) {
    				_instance = init();
    			}

    			return _instance;
    		}
    	};
    }();

    /**
    *
    * @ author:Bishop
    * @ email:1065742155@qq.com
    * @ data: 2020-03-21 00:13
    */
    class Game extends Laya.Scene {

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

            let start = {};
            start.position = this.dice1.transform.position.clone();
            start.rotationEuler = this.dice1.transform.position.clone();
            start.fieldOfView = this.dice1.fieldOfView;
            
            let end = {};
            end.position = this.dice2.transform.position.clone();
            end.rotationEuler = this.dice2.transform.position.clone();
            end.fieldOfView = this.dice2.fieldOfView;
            let plane = G_DoTween.getAxisOfMaxDistance(start.position, end.position);
            plane = G_DoTween.getAxisOfagainst(plane);
            G_DoTween.tweenMoveCamera(this.dice1, 2000, false, start, end, false, true, plane, null);
        }
    }

    /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */

    class GameConfig {
        static init() {
            //注册Script或者Runtime引用
            let reg = Laya.ClassUtils.regClass;
    		reg("GameCtrl/Game.js",Game);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode ="fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "Game.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;

    GameConfig.init();

    class Main {
    	constructor() {
    		//根据IDE设置初始化引擎		
    		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
    		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
    		Laya["Physics"] && Laya["Physics"].enable();
    		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
    		Laya.stage.scaleMode = GameConfig.scaleMode;
    		Laya.stage.screenMode = GameConfig.screenMode;
    		Laya.stage.alignV = GameConfig.alignV;
    		Laya.stage.alignH = GameConfig.alignH;
    		//兼容微信不支持加载scene后缀场景
    		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

    		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
    		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
    		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
    		if (GameConfig.stat) Laya.Stat.show();
    		Laya.alertGlobalError = true;

    		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
    		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
    	}

    	onVersionLoaded() {
    		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
    		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
    	}

    	onConfigLoaded() {
    		//加载IDE指定的场景
    		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
    	}
    }
    //激活启动类
    new Main();

}());
