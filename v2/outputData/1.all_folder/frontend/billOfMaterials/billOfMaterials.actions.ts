import { Action } from 'mycena-store';
import { BillOfMaterials } from './billOfMaterials.model';

export const ReducerActionMap = {
  TestBillOfMaterials: '[BillOfMaterials] Testing BillOfMaterials'
};

export const EffectActionMap = {
  CreateBillOfMaterials: '[BillOfMaterials] Create BillOfMaterials',
  ReadBillOfMaterials: '[BillOfMaterials] Read BillOfMaterials',
  UpdateBillOfMaterials: '[BillOfMaterials] Update BillOfMaterials',
  DeleteBillOfMaterials: '[BillOfMaterials] Delete BillOfMaterials'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestBillOfMaterials extends Action {
  readonly type: string = ActionMap.TestBillOfMaterials;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateBillOfMaterials extends Action {
  readonly type: string = ActionMap.CreateBillOfMaterials;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadBillOfMaterials extends Action {
  readonly type: string = ActionMap.ReadBillOfMaterials;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateBillOfMaterials extends Action {
  readonly type: string = ActionMap.UpdateBillOfMaterials;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteBillOfMaterials extends Action {
  readonly type: string = ActionMap.DeleteBillOfMaterials;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestBillOfMaterials | CreateBillOfMaterials | ReadBillOfMaterials | UpdateBillOfMaterials | DeleteBillOfMaterials;
