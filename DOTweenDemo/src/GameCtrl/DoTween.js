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
		console.log('Init _DoTween Instance...')

		return {
        
            tweenMoveCamera: function (camera, duration, isLocal, start, end, disableEffects, iscamber, plane, cb) {
				if (camera) {
					if (camera._scheduleKey) {
						G_Scheduler.unschedule(camera._scheduleKey)
						camera._scheduleKey = ""
					}

					if (isLocal) {
						let targetPos = start.position.clone()
						if (disableEffects.posX === true) {
							targetPos.x = camera.transform.localPosition.x
						}
						camera.transform.localPosition = targetPos

						camera.transform.localRotationEuler = start.rotationEuler.clone()
					}
					else {
						let targetPos = start.position.clone()
						if (disableEffects.posX === true) {
							targetPos.x = camera.transform.position.x
						}
						camera.transform.position = targetPos
						camera.transform.rotationEuler = start.rotationEuler.clone()
					}
					camera.fieldOfView = start.fieldOfView

					// schedule
					camera._scheduleKey = "key_of_tween_move_camera"
					camera._passedTime = 0
					camera._totalTime = duration
					camera._isLocal = isLocal
					camera._start = start
					camera._end = end
					camera._disableEffects = disableEffects
                    camera._cb = cb
                    
					G_Scheduler.schedule(camera._scheduleKey, function () {
						camera._passedTime += Laya.timer.delta
						let progress = camera._passedTime / camera._totalTime
						if (progress > 1.0) {
							progress = 1.0
						}
                        let targetPos
						// update
						if (camera._isLocal) {
                            
                            if (iscamber)
                                targetPos = this.getArcVec3(camera._start.position, camera._end.position, progress, plane)
                            else
                                targetPos = this.getMidVec3(camera._start.position, camera._end.position, progress)
							if (camera._disableEffects.posX === true) {
								targetPos.x = camera.transform.localPosition.x
							}
							camera.transform.localPosition = targetPos
							camera.transform.localRotationEuler = this.getMidVec3(camera._start.rotationEuler, camera._end.rotationEuler, progress)
						}
						else {
							if (iscamber)
                                targetPos = this.getArcVec3(camera._start.position, camera._end.position, progress, plane)
                            else
                                targetPos = this.getMidVec3(camera._start.position, camera._end.position, progress)
							if (camera._disableEffects.posX === true) {
								targetPos.x = camera.transform.position.x
							}
							camera.transform.position = targetPos
							camera.transform.rotationEuler = this.getMidVec3(camera._start.rotationEuler, camera._end.rotationEuler, progress)
						}
						camera.fieldOfView = camera._start.fieldOfView + (camera._end.fieldOfView - camera._start.fieldOfView) * progress

						if (progress === 1.0) {
							G_Scheduler.unschedule(camera._scheduleKey)
							camera._scheduleKey = ""

							let _cb = camera._cb
							camera._cb = null
							if (typeof _cb === "function") {
								_cb()
							}
						}
					}.bind(this), true)
				}
			},

			getMidVec3: function(fromPos, endPos, progress) {
				let midPos = new Laya.Vector3()
				midPos.x = fromPos.x + this._caculateMultiply((endPos.x - fromPos.x), progress)
				midPos.y = fromPos.y + this._caculateMultiply((endPos.y - fromPos.y), progress)
				midPos.z = fromPos.z + this._caculateMultiply((endPos.z - fromPos.z), progress)
		
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
                let angle = 90 * progress
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
                let ret = ""
                let max = 1000000000;
                if (max > _x){
                    max = _x;
                    ret = "X"
                }
                if (max > _y) {
                    max = _y;
                    ret = "Y"
                }
                if (max > _z) {
                    max = _z;
                    ret = "Z"
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

export {_DoTween}