import { Action } from 'mycena-store';
import { Group } from './group.model';

export const ReducerActionMap = {
  TestGroup: '[Group] Testing Group'
};

export const EffectActionMap = {
  CreateGroup: '[Group] Create Group',
  ReadGroup: '[Group] Read Group',
  UpdateGroup: '[Group] Update Group',
  DeleteGroup: '[Group] Delete Group'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestGroup extends Action {
  readonly type: string = ActionMap.TestGroup;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateGroup extends Action {
  readonly type: string = ActionMap.CreateGroup;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadGroup extends Action {
  readonly type: string = ActionMap.ReadGroup;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateGroup extends Action {
  readonly type: string = ActionMap.UpdateGroup;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteGroup extends Action {
  readonly type: string = ActionMap.DeleteGroup;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestGroup | CreateGroup | ReadGroup | UpdateGroup | DeleteGroup;
