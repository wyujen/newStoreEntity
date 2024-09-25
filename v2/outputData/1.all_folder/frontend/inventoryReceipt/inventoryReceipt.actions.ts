import { Action } from 'mycena-store';
import { InventoryReceipt } from './inventoryReceipt.model';

export const ReducerActionMap = {
  TestInventoryReceipt: '[InventoryReceipt] Testing InventoryReceipt'
};

export const EffectActionMap = {
  CreateInventoryReceipt: '[InventoryReceipt] Create InventoryReceipt',
  ReadInventoryReceipt: '[InventoryReceipt] Read InventoryReceipt',
  UpdateInventoryReceipt: '[InventoryReceipt] Update InventoryReceipt',
  DeleteInventoryReceipt: '[InventoryReceipt] Delete InventoryReceipt'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestInventoryReceipt extends Action {
  readonly type: string = ActionMap.TestInventoryReceipt;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateInventoryReceipt extends Action {
  readonly type: string = ActionMap.CreateInventoryReceipt;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadInventoryReceipt extends Action {
  readonly type: string = ActionMap.ReadInventoryReceipt;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateInventoryReceipt extends Action {
  readonly type: string = ActionMap.UpdateInventoryReceipt;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteInventoryReceipt extends Action {
  readonly type: string = ActionMap.DeleteInventoryReceipt;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestInventoryReceipt | CreateInventoryReceipt | ReadInventoryReceipt | UpdateInventoryReceipt | DeleteInventoryReceipt;
