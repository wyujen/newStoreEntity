export class UpdateBillOfMaterials extends Action {
    readonly type: string = ActionMap.UpdateBillOfMaterials;
    constructor(public payload: any[]) {
      super();
    }
  }
  export class UpdateInventoryReceipt extends Action {
    readonly type: string = ActionMap.UpdateInventoryReceipt;
    constructor(public payload: any[]) {
      super();
    }
  }
  