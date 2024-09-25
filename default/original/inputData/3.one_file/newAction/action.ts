export class UpdateOriginal extends Action {
    readonly type: string = ActionMap.UpdateOriginal;
    constructor(public payload: any[]) {
      super();
    }
  }
  