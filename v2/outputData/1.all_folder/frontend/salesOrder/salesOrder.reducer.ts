import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './salesOrder.actions';
import { SalesOrderEntity } from './salesOrder.entity';
import { SalesOrder } from './salesOrder.model';

export const FeatureKey = 'salesOrder';

export interface SalesOrderState extends EntityState<SalesOrder> {}

export const adapter: EntityAdapter<SalesOrder> = createEntityAdapter<SalesOrder>();

export const initialState: SalesOrderState = adapter.getInitialState({});

export class SalesOrderReducer extends Reducer<Action, SalesOrderState> {
  _name = 'SalesOrderReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(SalesOrderEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<SalesOrderState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestSalesOrder: {
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

export const reducer = new SalesOrderReducer();
