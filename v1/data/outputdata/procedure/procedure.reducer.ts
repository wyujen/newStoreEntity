import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './procedure.actions';
import { ProcedureEntity } from './procedure.entity';
import { Procedure } from './procedure.model';

export const FeatureKey = 'procedure';

export interface ProcedureState extends EntityState<Procedure> {}

export const adapter: EntityAdapter<Procedure> = createEntityAdapter<Procedure>();

export const initialState: ProcedureState = adapter.getInitialState({});

export class ProcedureReducer extends Reducer<Action, ProcedureState> {
  _name = 'ProcedureReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(ProcedureEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<ProcedureState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestProcedure: {
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

export const reducer = new ProcedureReducer();
