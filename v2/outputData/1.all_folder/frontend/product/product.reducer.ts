import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './product.actions';
import { ProductEntity } from './product.entity';
import { Product } from './product.model';

export const FeatureKey = 'product';

export interface ProductState extends EntityState<Product> {}

export const adapter: EntityAdapter<Product> = createEntityAdapter<Product>();

export const initialState: ProductState = adapter.getInitialState({});

export class ProductReducer extends Reducer<Action, ProductState> {
  _name = 'ProductReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(ProductEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<ProductState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestProduct: {
        yield await this.state;
        break;
      }
      default: {
        yield await newState;
        break;
      }
    }
  }
}

export const reducer = new ProductReducer();
