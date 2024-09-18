import { Action } from 'mycena-store';
import { BomProcedure } from './bomProcedure.model';

export const ReducerActionMap = {
  TestBomProcedure: '[BomProcedure] Testing BomProcedure'
};

export const EffectActionMap = {
  CreateBomProcedure: '[BomProcedure] Create BomProcedure',
  ReadBomProcedure: '[BomProcedure] Read BomProcedure',
  UpdateBomProcedure: '[BomProcedure] Update BomProcedure',
  DeleteBomProcedure: '[BomProcedure] Delete BomProcedure'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestBomProcedure extends Action {
  readonly type: string = ActionMap.TestBomProcedure;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateBomProcedure extends Action {
  readonly type: string = ActionMap.CreateBomProcedure;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadBomProcedure extends Action {
  readonly type: string = ActionMap.ReadBomProcedure;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateBomProcedure extends Action {
  readonly type: string = ActionMap.UpdateBomProcedure;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteBomProcedure extends Action {
  readonly type: string = ActionMap.DeleteBomProcedure;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestBomProcedure | CreateBomProcedure | ReadBomProcedure | UpdateBomProcedure | DeleteBomProcedure;
