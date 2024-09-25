export class UpdateTarget extends Action {
    readonly type: string = ActionMap.UpdateTarget;
    constructor(public payload: any[]) {
      super();
    }
  }
  