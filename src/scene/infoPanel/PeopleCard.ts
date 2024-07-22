import InteractiveEventUtils from 'loggie/utils/InteractiveEventUtils';
import ViewUtils from 'loggie/utils/ViewUtils';
import * as PIXI from 'pixi.js';
import { PeopleData } from './AboutPanel';
export default class PeopleCard extends PIXI.Container {

    private linkedn: PIXI.Sprite;
    private portfolio: PIXI.Sprite;
    private portrait: PIXI.Sprite;
    private pplName: PIXI.Text;
    private role: PIXI.Text;
    private description: PIXI.Text;
    constructor(peopleData: PeopleData) {
        super()

        this.portrait = PIXI.Sprite.from(peopleData.portrait)
        this.addChild(this.portrait)

        this.portrait.scale.set(ViewUtils.elementScaler(this.portrait, 120))
        this.portrait.anchor.set(0.5)

        this.pplName = new PIXI.Text(peopleData.name, { fontFamily: 'Poppins-Bold', fontSize: 42 });
        this.addChild(this.pplName)
        this.pplName.resolution = 1

        this.role = new PIXI.Text(peopleData.role, { fontFamily: 'Poppins-Regular', fontSize: 30 });
        this.addChild(this.role)
        this.role.resolution = 1

        this.description = new PIXI.Text(peopleData.description, { fontFamily: 'Poppins-Regular', fontSize: PIXI.isMobile.any ? 32 : 24 });
        this.addChild(this.description)
        this.description.resolution = 1
        this.description.style.wordWrap = true;


        this.linkedn = PIXI.Sprite.from('poki-badge_light')
        this.addChild(this.linkedn)
        this.linkedn.anchor.set(1, 0.5)


        this.linkedn.cursor = 'pointer'

        InteractiveEventUtils.addClickTap(this.linkedn, () => {
            //this.redirectToGame();
        })


        this.portfolio = PIXI.Sprite.from('poki-badge_light')
        this.addChild(this.portfolio)
        this.portfolio.anchor.set(1, 0.5)


        this.portfolio.cursor = 'pointer'

        InteractiveEventUtils.addClickTap(this.portfolio, () => {
            //this.redirectToGame();
        })
    }
    build() {
    }
    update(delta: number) {
    }
    resize(width: number, height: number) {

        if (width < height) {
            this.portrait.x = 100
            this.portrait.y = 100
            this.pplName.anchor.set(0)
            this.pplName.x = this.portrait.x + this.portrait.width
            this.pplName.y = this.portrait.y - 60
            this.description.style.wordWrapWidth = width - this.pplName.x - 20
            this.description.x = this.pplName.x

            //this.linkedn.anchor.set(0);
            this.linkedn.x = this.portrait.x
            this.linkedn.y = this.portrait.y + this.portrait.height

            this.linkedn.scale.set(ViewUtils.elementScaler(this.linkedn, this.portrait.width + 40))

            this.portfolio.x = this.portrait.x
            this.portfolio.y = this.linkedn.y + this.linkedn.height + 20

            this.portfolio.scale.set(ViewUtils.elementScaler(this.portfolio, this.portrait.width + 40))
        } else {
            this.portrait.x = width / 4
            this.portrait.y = 100
            this.pplName.anchor.set(0.5, 0)
            this.pplName.x = this.portrait.x
            this.pplName.y = this.portrait.y + this.portrait.height

            this.description.style.wordWrapWidth = width / 2 - 80
            this.description.x = 40

            this.linkedn.x = this.portrait.x + 90
            this.linkedn.y = height - this.linkedn.height

            this.portfolio.x = this.portrait.x - 90
            this.portfolio.y = this.linkedn.y


            this.linkedn.scale.set(ViewUtils.elementScaler(this.linkedn, this.portrait.width + 40))
            this.portfolio.scale.set(ViewUtils.elementScaler(this.portfolio, this.portrait.width + 40))
        }

        this.portfolio.anchor.set(0.5);
        this.linkedn.anchor.set(0.5);
        this.role.x = this.pplName.x
        this.role.y = this.pplName.y + 50

        this.description.y = this.role.y + 50
    }
}