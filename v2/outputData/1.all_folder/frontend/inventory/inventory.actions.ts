import { Action } from 'mycena-store';
import { Inventory } from './inventory.model';

export const ReducerActionMap = {
  TestInventory: '[Inventory] Testing Inventory'
};

export const EffectActionMap = {
  CreateInventory: '[Inventory] Create Inventory',
  ReadInventory: '[Inventory] Read Inventory',
  UpdateInventory: '[Inventory] Update Inventory',
  DeleteInventory: '[Inventory] Delete Inventory'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestInventory extends Action {
  readonly type: string = ActionMap.TestInventory;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateInventory extends Action {
  readonly type: string = ActionMap.CreateInventory;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadInventory extends Action {
  readonly type: string = ActionMap.ReadInventory;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateInventory extends Action {
  readonly type: string = ActionMap.UpdateInventory;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteInventory extends Action {
  readonly type: string = ActionMap.DeleteInventory;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestInventory | CreateInventory | ReadInventory | UpdateInventory | DeleteInventory;
