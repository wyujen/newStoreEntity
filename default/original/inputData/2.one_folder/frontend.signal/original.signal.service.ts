import { Injectable, NgZone, OnDestroy, computed, signal } from "@angular/core";
import { OriginalRelation } from "@yaotai/relation";
import { selectOriginalMapList, selectOriginals } from "@yaotai/original/original.frontend.selectors";
import { Subscription } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
import { Original } from "@yaotai/original/original.model";

@Injectable({ providedIn: 'root' })
export class OriginalSignalService implements OnDestroy {
    originalTypeMap = {
        
    }

    private _sub: Subscription = new Subscription;

    private _totalOriginalListWS = signal<OriginalRelation[]>([]);
    private _totalOriginalRecordWS = signal<Record<string, OriginalRelation>>({});


    totalOriginalRecordSignal = computed(() => this._totalOriginalRecordWS());
    totalOriginalListSignal = computed(() => this._totalOriginalListWS());
    constructor(
        private _zone: NgZone
    ) {
        this.subscribeStore();
    }

    private subscribeStore() {
        const originalListSuber = selectOriginals
            .subscribe(
                (originalList) => {
                    this._zone.run(() => {
                        this._totalOriginalListWS.set(originalList);
                    })
                }
            );
        const originalRecordSuber = selectOriginalMapList
            .subscribe(
                (originalRecord) => {
                    this._zone.run(() => {
                        this._totalOriginalRecordWS.set(originalRecord as Record<string, OriginalRelation>);
                    })
                }
            );
        this._sub.add(originalListSuber)
        this._sub.add(originalRecordSuber)
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    }
}