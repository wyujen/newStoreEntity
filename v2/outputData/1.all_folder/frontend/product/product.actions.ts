import { Action } from 'mycena-store';
import { Product } from './product.model';

export const ReducerActionMap = {
  TestProduct: '[Product] Testing Product'
};

export const EffectActionMap = {
  CreateProduct: '[Product] Create Product',
  ReadProduct: '[Product] Read Product',
  UpdateProduct: '[Product] Update Product',
  DeleteProduct: '[Product] Delete Product'
}

export const ActionMap = {
  ...ReducerActionMap,
  ...EffectActionMap
}

export class TestProduct extends Action {
  readonly type: string = ActionMap.TestProduct;
  constructor(public payload: { message: string }) {
    super();
  }
}

export class CreateProduct extends Action {
  readonly type: string = ActionMap.CreateProduct;
  constructor(public payload: any[]) {
    super();
  }
}

export class ReadProduct extends Action {
  readonly type: string = ActionMap.ReadProduct;
  constructor(public payload?: any[]) {
    super();
  }
}

export class UpdateProduct extends Action {
  readonly type: string = ActionMap.UpdateProduct;
  constructor(public payload: any[]) {
    super();
  }
}

export class DeleteProduct extends Action {
  readonly type: string = ActionMap.DeleteProduct;
  constructor(public payload: string[]) {
    super();
  }
}

export type ActionUnion = TestProduct | CreateProduct | ReadProduct | UpdateProduct | DeleteProduct;
