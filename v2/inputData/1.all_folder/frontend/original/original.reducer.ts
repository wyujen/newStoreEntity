import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './original.actions';
import { OriginalEntity } from './original.entity';
import { Original } from './original.model';

export const FeatureKey = 'original';

export interface OriginalState extends EntityState<Original> {}

export const adapter: EntityAdapter<Original> = createEntityAdapter<Original>();

export const initialState: OriginalState = adapter.getInitialState({});

export class OriginalReducer extends Reducer<Action, OriginalState> {
  _name = 'OriginalReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(OriginalEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<OriginalState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestOriginal: {
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

export const reducer = new OriginalReducer();
