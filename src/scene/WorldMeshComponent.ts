import * as PIXI from 'pixi.js';

import MeshUtils, { MeshConfig } from 'loggie/core/mesh/MeshUtils';

import GameObject from 'loggie/core/gameObject/GameObject';
import Vector3 from 'loggie/core/gameObject/Vector3';
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import GameViewMesh from 'loggie/core/view/GameViewMesh';

export default class WorldMeshComponent extends GameViewMesh {

    constructor(gameObject: GameObject) {
        super(gameObject)

    }
    setUpMesh() {
        const vertexSrc: string = `
    precision highp float;

    attribute vec2 aVertexPosition;
    attribute vec2 aUvs;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vUvs;

    void main() {

        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    }`;

        const fragmentSrc: string = `
    precision highp float;
    
    varying vec2 vUvs;
    
    uniform sampler2D uSampler2;
    uniform float time;
    uniform vec2 tileSize; // Size of each tile in the texture
    uniform vec2 offset;   // Offset of the texture coordinates
    uniform vec4 color;    // Color to apply to the texture
    uniform float alpha;   // Alpha value for the color
    uniform vec3 fogColor; // Fog color
    uniform float fogNear; // Near distance where fog starts
    uniform float fogFar;  // Far distance where fog is fully opaque
    
    void main() {
        // Calculate the UVs for tiling the texture with offset
        vec2 tiledUvs = fract((vUvs + offset) / tileSize);
    
        // Get the color from the texture at the tiled UV coordinates
        vec4 textureColor = texture2D(uSampler2, tiledUvs);
    
        // Calculate the distance from the camera
        float distance = gl_FragCoord.z / gl_FragCoord.w;
    
        // Calculate fog factor based on the distance
        float fogFactor = smoothstep(fogNear, fogFar, distance);
    
        // Blend fog color with image color
        vec3 finalColor = mix(textureColor.rgb, fogColor, fogFactor);
        vec4 finalColorWithAlpha = vec4(finalColor, alpha);
    
        // Apply the color and alpha to the final color
        finalColorWithAlpha *= color;
        finalColorWithAlpha.a *= alpha; 
    
        gl_FragColor = finalColorWithAlpha;
    }`;
        this.layer = RenderLayers.FloorBottom

        const shaderProgram = new PIXI.Program(vertexSrc, fragmentSrc, 'worldMesh')

        const uniforms = {
            uSampler2: PIXI.Texture.from('tiles1.png'),
            time: 0,
            tileSize: [1, 1], // Default tileSize value
            offset: [0, 0], // Default offset value
            color: [1, 1, 1, 1], // Default color value (white with full opacity)
            alpha: 1, // Default alpha value (full opacity)
            fogColor: [1, 0, 0], // Default fog color (gray)
            fogNear: 1, // Default fog near distance
            fogFar: 2 // Default fog far distance
        };


        this.layer = RenderLayers.FloorBottom
        this.meshConfig = { width: 512, height: 512, segmentsX: 10, segmentsY: 10, anchor: new Vector3(0.5, 0.5, 0) } as MeshConfig
        const meshData = MeshUtils.makeStandardMesh(this.meshConfig, new PIXI.Shader(shaderProgram, uniforms))
        this.vertices = meshData.meshData.vertices
        this.mesh = meshData.mesh

    }
    build(textureId: string | null, meshConfig?: MeshConfig) {
        super.build(textureId, meshConfig);

    }


}