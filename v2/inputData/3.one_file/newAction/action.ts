export class ReadTargetDetail extends Action {
    readonly type: string = ActionMap.ReadTargetDatail;
    constructor(public payload: {id:string}) {
      super();
    }
  }
  