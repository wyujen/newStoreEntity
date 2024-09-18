import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './inventoryRecipt.actions';
import { InventoryReciptEntity } from './inventoryRecipt.entity';
import { InventoryRecipt } from './inventoryRecipt.model';

export const FeatureKey = 'inventoryRecipt';

export interface InventoryReciptState extends EntityState<InventoryRecipt> {}

export const adapter: EntityAdapter<InventoryRecipt> = createEntityAdapter<InventoryRecipt>();

export const initialState: InventoryReciptState = adapter.getInitialState({});

export class InventoryReciptReducer extends Reducer<Action, InventoryReciptState> {
  _name = 'InventoryReciptReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(InventoryReciptEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<InventoryReciptState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestInventoryRecipt: {
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

export const reducer = new InventoryReciptReducer();
