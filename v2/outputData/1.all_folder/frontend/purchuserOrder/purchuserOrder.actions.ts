import { Action } from 'mycena-store';
import { PurchuserOrder } from './purchuserOrder.model';

export const ReducerActionMap = {
  TestPurchuserOrder: '[PurchuserOrder] Testing PurchuserOrder'
};

export const EffectActionMap = {
  CreatePurchuserOrder: '[PurchuserOrder] Create PurchuserOrder',
  ReadPurchuserOrder: '[PurchuserOrder] Read PurchuserOrder',
  UpdatePurchuserOrder: '[PurchuserOrder] Update PurchuserOrder',
  DeletePurchuserOrder: '[PurchuserOrder] Delete PurchuserOrder'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestPurchuserOrder extends Action {
  readonly type: string = ActionMap.TestPurchuserOrder;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreatePurchuserOrder extends Action {
  readonly type: string = ActionMap.CreatePurchuserOrder;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadPurchuserOrder extends Action {
  readonly type: string = ActionMap.ReadPurchuserOrder;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdatePurchuserOrder extends Action {
  readonly type: string = ActionMap.UpdatePurchuserOrder;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeletePurchuserOrder extends Action {
  readonly type: string = ActionMap.DeletePurchuserOrder;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestPurchuserOrder | CreatePurchuserOrder | ReadPurchuserOrder | UpdatePurchuserOrder | DeletePurchuserOrder;
