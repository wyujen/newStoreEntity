import { Action } from 'mycena-store';
import { SalesOrder } from './salesOrder.model';

export const ReducerActionMap = {
  TestSalesOrder: '[SalesOrder] Testing SalesOrder'
};

export const EffectActionMap = {
  CreateSalesOrder: '[SalesOrder] Create SalesOrder',
  ReadSalesOrder: '[SalesOrder] Read SalesOrder',
  UpdateSalesOrder: '[SalesOrder] Update SalesOrder',
  DeleteSalesOrder: '[SalesOrder] Delete SalesOrder'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestSalesOrder extends Action {
  readonly type: string = ActionMap.TestSalesOrder;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateSalesOrder extends Action {
  readonly type: string = ActionMap.CreateSalesOrder;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadSalesOrder extends Action {
  readonly type: string = ActionMap.ReadSalesOrder;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateSalesOrder extends Action {
  readonly type: string = ActionMap.UpdateSalesOrder;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteSalesOrder extends Action {
  readonly type: string = ActionMap.DeleteSalesOrder;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestSalesOrder | CreateSalesOrder | ReadSalesOrder | UpdateSalesOrder | DeleteSalesOrder;
