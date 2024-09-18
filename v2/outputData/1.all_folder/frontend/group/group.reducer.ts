import { Action, createEntityAdapter, EntityAdapter, EntityState, Reducer } from 'mycena-store';
import { ActionMap, ReducerActionMap } from './group.actions';
import { GroupEntity } from './group.entity';
import { Group } from './group.model';

export const FeatureKey = 'group';

export interface GroupState extends EntityState<Group> {}

export const adapter: EntityAdapter<Group> = createEntityAdapter<Group>();

export const initialState: GroupState = adapter.getInitialState({});

export class GroupReducer extends Reducer<Action, GroupState> {
  _name = 'GroupReducer';
  constructor() {
    super(initialState, ReducerActionMap);
    this.setEntity(GroupEntity);
  }
  async *mapEventToState(event: Action): AsyncIterableIterator<GroupState> {
    const newState = await this.defaultActionState(event);
    switch (event['type']) {
      case ActionMap.TestGroup: {
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

export const reducer = new GroupReducer();
