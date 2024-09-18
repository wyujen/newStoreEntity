import { Action } from 'mycena-store';
import { Material } from './material.model';

export const ReducerActionMap = {
  TestMaterial: '[Material] Testing Material'
};

export const EffectActionMap = {
  CreateMaterial: '[Material] Create Material',
  ReadMaterial: '[Material] Read Material',
  UpdateMaterial: '[Material] Update Material',
  DeleteMaterial: '[Material] Delete Material'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestMaterial extends Action {
  readonly type: string = ActionMap.TestMaterial;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateMaterial extends Action {
  readonly type: string = ActionMap.CreateMaterial;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadMaterial extends Action {
  readonly type: string = ActionMap.ReadMaterial;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateMaterial extends Action {
  readonly type: string = ActionMap.UpdateMaterial;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteMaterial extends Action {
  readonly type: string = ActionMap.DeleteMaterial;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestMaterial | CreateMaterial | ReadMaterial | UpdateMaterial | DeleteMaterial;
