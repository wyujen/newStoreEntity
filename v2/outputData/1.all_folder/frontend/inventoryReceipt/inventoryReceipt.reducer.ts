import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './inventoryReceipt.actions';
import { InventoryReceiptEntity } from './inventoryReceipt.entity';
import { InventoryReceipt } from './inventoryReceipt.model';

export const FeatureKey = 'inventoryReceipt';

export interface InventoryReceiptState extends EntityState<InventoryReceipt> {}

export const adapter: EntityAdapter<InventoryReceipt> = createEntityAdapter<InventoryReceipt>();

export const initialState: InventoryReceiptState = adapter.getInitialState({});

export class InventoryReceiptReducer extends Reducer<Action, InventoryReceiptState> {
  _name = 'InventoryReceiptReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(InventoryReceiptEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<InventoryReceiptState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestInventoryReceipt: {
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

export const reducer = new InventoryReceiptReducer();
