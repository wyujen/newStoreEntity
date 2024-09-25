import { Action } from 'mycena-store';
import { Target } from './target.model';

export const ReducerActionMap = {
  TestTarget: '[Target] Testing Target'
};

export const EffectActionMap = {
  CreateTarget: '[Target] Create Target',
  ReadTarget: '[Target] Read Target',
  UpdateTarget: '[Target] Update Target',
  DeleteTarget: '[Target] Delete Target'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestTarget extends Action {
  readonly type: string = ActionMap.TestTarget;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateTarget extends Action {
  readonly type: string = ActionMap.CreateTarget;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadTarget extends Action {
  readonly type: string = ActionMap.ReadTarget;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateTarget extends Action {
  readonly type: string = ActionMap.UpdateTarget;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteTarget extends Action {
  readonly type: string = ActionMap.DeleteTarget;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestTarget | CreateTarget | ReadTarget | UpdateTarget | DeleteTarget;
