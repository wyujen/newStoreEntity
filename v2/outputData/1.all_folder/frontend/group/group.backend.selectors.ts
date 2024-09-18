import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, GroupState } from './group.reducer';

export const selectGroupState = Cqrs.createFeatureSelector<GroupState>(FeatureKey);
export const selectGroupEntities = createSelector([selectGroupState], (state: GroupState) => Object.values(state.entities));
