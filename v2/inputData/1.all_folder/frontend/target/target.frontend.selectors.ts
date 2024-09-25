
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, TargetState } from './target.reducer';
import { Entities } from '@yaotai/interface';
import { TargetRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectTargetState = Cqrs.createFeatureSelector<TargetState>(FeatureKey);
export const selectTargetEntities = createSelector([selectTargetState], (state: TargetState) => Object.values(state.entities));

export const selectTargetMapList = Cqrs.createRelationSelector<TargetState>('target').pipe(map((state: TargetState) => state.entities));

export const selectTargets = createSelector(
  [selectTargetMapList],
  (targetEntities: Entities<TargetRelation>) => Object.values(targetEntities)
);
