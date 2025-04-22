import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './target.actions';
import { TargetEntity } from './target.entity';
import { Target } from './target.model';

export const FeatureKey = 'target';

export interface TargetState extends EntityState<Target> {}

export const adapter: EntityAdapter<Target> = createEntityAdapter<Target>();

export const initialState: TargetState = adapter.getInitialState({});

export class TargetReducer extends Reducer<Action, TargetState> {
  _name = 'TargetReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(TargetEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<TargetState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestTarget: {
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

export const reducer = new TargetReducer();
