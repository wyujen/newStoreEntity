import { Action } from 'mycena-store';
import { InventoryRecipt } from './inventoryRecipt.model';

export const ReducerActionMap = {
  TestInventoryRecipt: '[InventoryRecipt] Testing InventoryRecipt'
};

export const EffectActionMap = {
  CreateInventoryRecipt: '[InventoryRecipt] Create InventoryRecipt',
  ReadInventoryRecipt: '[InventoryRecipt] Read InventoryRecipt',
  UpdateInventoryRecipt: '[InventoryRecipt] Update InventoryRecipt',
  DeleteInventoryRecipt: '[InventoryRecipt] Delete InventoryRecipt'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestInventoryRecipt extends Action {
  readonly type: string = ActionMap.TestInventoryRecipt;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateInventoryRecipt extends Action {
  readonly type: string = ActionMap.CreateInventoryRecipt;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadInventoryRecipt extends Action {
  readonly type: string = ActionMap.ReadInventoryRecipt;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateInventoryRecipt extends Action {
  readonly type: string = ActionMap.UpdateInventoryRecipt;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteInventoryRecipt extends Action {
  readonly type: string = ActionMap.DeleteInventoryRecipt;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestInventoryRecipt | CreateInventoryRecipt | ReadInventoryRecipt | UpdateInventoryRecipt | DeleteInventoryRecipt;
