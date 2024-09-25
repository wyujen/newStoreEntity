import { Action } from 'mycena-store';
import { Original } from './original.model';

export const ReducerActionMap = {
  TestOriginal: '[Original] Testing Original'
};

export const EffectActionMap = {
  CreateOriginal: '[Original] Create Original',
  ReadOriginal: '[Original] Read Original',
  UpdateOriginal: '[Original] Update Original',
  DeleteOriginal: '[Original] Delete Original'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestOriginal extends Action {
  readonly type: string = ActionMap.TestOriginal;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateOriginal extends Action {
  readonly type: string = ActionMap.CreateOriginal;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadOriginal extends Action {
  readonly type: string = ActionMap.ReadOriginal;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateOriginal extends Action {
  readonly type: string = ActionMap.UpdateOriginal;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteOriginal extends Action {
  readonly type: string = ActionMap.DeleteOriginal;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestOriginal | CreateOriginal | ReadOriginal | UpdateOriginal | DeleteOriginal;
