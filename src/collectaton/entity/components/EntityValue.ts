import * as PIXI from 'pixi.js';
import GameViewSprite from "loggie/core/view/GameViewSprite";
import { RenderLayers } from 'loggie/core/render/RenderLayers';
import BaseComponent from 'loggie/core/gameObject/BaseComponent';

export default class EntityValue extends BaseComponent {
    public value:integer = 2;
}