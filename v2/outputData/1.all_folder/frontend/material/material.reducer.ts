import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './material.actions';
import { MaterialEntity } from './material.entity';
import { Material } from './material.model';

export const FeatureKey = 'material';

export interface MaterialState extends EntityState<Material> {}

export const adapter: EntityAdapter<Material> = createEntityAdapter<Material>();

export const initialState: MaterialState = adapter.getInitialState({});

export class MaterialReducer extends Reducer<Action, MaterialState> {
  _name = 'MaterialReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(MaterialEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<MaterialState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestMaterial: {
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

export const reducer = new MaterialReducer();
