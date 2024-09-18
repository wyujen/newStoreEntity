import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './inventory.actions';
import { InventoryEntity } from './inventory.entity';
import { Inventory } from './inventory.model';

export const FeatureKey = 'inventory';

export interface InventoryState extends EntityState<Inventory> {}

export const adapter: EntityAdapter<Inventory> = createEntityAdapter<Inventory>();

export const initialState: InventoryState = adapter.getInitialState({});

export class InventoryReducer extends Reducer<Action, InventoryState> {
  _name = 'InventoryReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(InventoryEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<InventoryState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestInventory: {
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

export const reducer = new InventoryReducer();
