import { Injectable, NgZone, OnDestroy, computed, signal } from "@angular/core";
import { TargetRelation } from "@yaotai/relation";
import { selectTargetMapList, selectTargets } from "@yaotai/target/target.frontend.selectors";
import { Subscription } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
import { Target } from "@yaotai/target/target.model";

@Injectable({ providedIn: 'root' })
export class TargetSignalService implements OnDestroy {
    targetTypeMap = {
        
    }

    private _sub: Subscription = new Subscription;

    private _totalTargetListWS = signal<TargetRelation[]>([]);
    private _totalTargetRecordWS = signal<Record<string, TargetRelation>>({});
    private _targetId = signal<string>('');


    totalTargetRecordSignal = computed(() => this._totalTargetRecordWS());
    totalTargetListSignal = computed(() => this._totalTargetListWS());
    targetSignal = computed(()=>{
        const targetRecord = this._totalTargetRecordWS();
        const target = targetRecord[this._targetId()] as TargetRelation || null
        return target
    })
    constructor(
        private _zone: NgZone
    ) {
        this.subscribeStore();
    }

    setTargetId(id: string) {
        this._targetId.set(id)
    }

    private subscribeStore() {
        const targetListSuber = selectTargets
            .subscribe(
                (targetList) => {
                    this._zone.run(() => {
                        this._totalTargetListWS.set(targetList);
                    })
                }
            );
        const targetRecordSuber = selectTargetMapList
            .subscribe(
                (targetRecord) => {
                    this._zone.run(() => {
                        this._totalTargetRecordWS.set(targetRecord as Record<string, TargetRelation>);
                    })
                }
            );
        this._sub.add(targetListSuber)
        this._sub.add(targetRecordSuber)
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    }
}