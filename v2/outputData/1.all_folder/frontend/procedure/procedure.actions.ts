import { Action } from 'mycena-store';
import { Procedure } from './procedure.model';

export const ReducerActionMap = {
  TestProcedure: '[Procedure] Testing Procedure'
};

export const EffectActionMap = {
  CreateProcedure: '[Procedure] Create Procedure',
  ReadProcedure: '[Procedure] Read Procedure',
  UpdateProcedure: '[Procedure] Update Procedure',
  DeleteProcedure: '[Procedure] Delete Procedure'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestProcedure extends Action {
  readonly type: string = ActionMap.TestProcedure;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateProcedure extends Action {
  readonly type: string = ActionMap.CreateProcedure;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadProcedure extends Action {
  readonly type: string = ActionMap.ReadProcedure;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateProcedure extends Action {
  readonly type: string = ActionMap.UpdateProcedure;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteProcedure extends Action {
  readonly type: string = ActionMap.DeleteProcedure;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestProcedure | CreateProcedure | ReadProcedure | UpdateProcedure | DeleteProcedure;
