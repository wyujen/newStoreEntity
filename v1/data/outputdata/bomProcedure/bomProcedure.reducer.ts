import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './bomProcedure.actions';
import { BomProcedureEntity } from './bomProcedure.entity';
import { BomProcedure } from './bomProcedure.model';

export const FeatureKey = 'bomProcedure';

export interface BomProcedureState extends EntityState<BomProcedure> {}

export const adapter: EntityAdapter<BomProcedure> = createEntityAdapter<BomProcedure>();

export const initialState: BomProcedureState = adapter.getInitialState({});

export class BomProcedureReducer extends Reducer<Action, BomProcedureState> {
  _name = 'BomProcedureReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(BomProcedureEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<BomProcedureState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestBomProcedure: {
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

export const reducer = new BomProcedureReducer();
