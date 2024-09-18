import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './billOfMaterials.actions';
import { BillOfMaterialsEntity } from './billOfMaterials.entity';
import { BillOfMaterials } from './billOfMaterials.model';

export const FeatureKey = 'billOfMaterials';

export interface BillOfMaterialsState extends EntityState<BillOfMaterials> {}

export const adapter: EntityAdapter<BillOfMaterials> = createEntityAdapter<BillOfMaterials>();

export const initialState: BillOfMaterialsState = adapter.getInitialState({});

export class BillOfMaterialsReducer extends Reducer<Action, BillOfMaterialsState> {
  _name = 'BillOfMaterialsReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(BillOfMaterialsEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<BillOfMaterialsState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestBillOfMaterials: {
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

export const reducer = new BillOfMaterialsReducer();
