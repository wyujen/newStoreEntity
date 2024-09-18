import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './purchuserOrder.actions';
import { PurchuserOrderEntity } from './purchuserOrder.entity';
import { PurchuserOrder } from './purchuserOrder.model';

export const FeatureKey = 'purchuserOrder';

export interface PurchuserOrderState extends EntityState<PurchuserOrder> {}

export const adapter: EntityAdapter<PurchuserOrder> = createEntityAdapter<PurchuserOrder>();

export const initialState: PurchuserOrderState = adapter.getInitialState({});

export class PurchuserOrderReducer extends Reducer<Action, PurchuserOrderState> {
  _name = 'PurchuserOrderReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(PurchuserOrderEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<PurchuserOrderState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestPurchuserOrder: {
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

export const reducer = new PurchuserOrderReducer();
