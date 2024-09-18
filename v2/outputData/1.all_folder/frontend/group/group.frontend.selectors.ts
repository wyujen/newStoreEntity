
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, GroupState } from './group.reducer';
import { Entities } from '@yaotai/interface';
import { GroupRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectGroupState = Cqrs.createFeatureSelector<GroupState>(FeatureKey);
export const selectGroupEntities = createSelector([selectGroupState], (state: GroupState) => Object.values(state.entities));

export const selectGroupMapList = Cqrs.createRelationSelector<GroupState>('group').pipe(map((state: GroupState) => state.entities));

export const selectGroups = createSelector(
  [selectGroupMapList],
  (groupEntities: Entities<GroupRelation>) => Object.values(groupEntities)
);
