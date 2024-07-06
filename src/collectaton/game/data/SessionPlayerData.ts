
export default class  SessionPlayerData  {
    public uid:integer = -1;
    public value:integer = 2;
    public time:number = 0;
    public children:SessionPlayerData;

    constructor(uid:integer, value:integer){
        this.uid = uid;
        this.value = value;
    }
}