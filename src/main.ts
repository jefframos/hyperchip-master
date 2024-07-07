import * as PIXI from 'pixi.js';

import PerspectiveCamera, { CameraViewType } from 'loggie/core/camera/PerspectiveCamera';

import CameraSimplifiedPerspective from 'loggie/core/camera/CameraSimplifiedPerspective';
import HyperchipScene from './scene/HyperchipScene';
import LoggieApplication from 'loggie/LoggieApplication';
import LoggieSettings from 'loggie/LoggieSettings';

LoggieApplication.app = new PIXI.Application<HTMLCanvasElement>({
    resolution: Math.min(window.devicePixelRatio, 1),
    backgroundColor: 0x181818,
    width: window.outerWidth,
    height: window.outerHeight,
});
document.body.appendChild(LoggieApplication.app.view);

const config: LoggieSettings = {
    preloadScenes: [],
    physicsSettings: {
        gravity: {
            x: 0,
            y: -0.1
        },
    },
    cameraSettings: {
        //cameraConstructor: CameraSimplifiedPerspective,
        cameraConstructor: PerspectiveCamera,
        cameraAttributes: {
            fov: 90,
            aspect: 19 / 6,
            near: 0.1,
            far: 1000,
            yOffsetFactor: 0.21,
            minScale: 0,
            cameraY: 0,
            cameraX: 0,
            cameraZ: 0,
            cameraViewType: CameraViewType.HorizontalDistortion
        }
    },
    // cameraSettings: {
    //     cameraConstructor: PerspectiveCamera,
    //     cameraAttributes: {
    //         fov: 90,
    //         aspect: 19 / 6,
    //         near: 0.1,
    //         far: 1000,
    //         yOffsetFactor: 0.21,
    //         minScale: 0,
    //         cameraY: 0,
    //         cameraX: 0,
    //         cameraZ: 0,
    //         cameraViewType: CameraViewType.HorizontalDistortion
    //     }
    // },
    debug: {
        physics: {
            debugSensor: false,
            debugStatic: false,
            debugRigidBody: false
        },
        debuggerSettings: {
            enable: true,
            enablePIXIInspector: false
        }
    }
}

LoggieApplication.initialize(config)

if (LoggieApplication.debugParams && LoggieApplication.debugParams.scene) {


}
LoggieApplication.loadScene(HyperchipScene)


javascript: (function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = '//cdn.jsdelivr.net/gh/Kevnz/stats.js/build/stats.min.js'; document.head.appendChild(script); })()
