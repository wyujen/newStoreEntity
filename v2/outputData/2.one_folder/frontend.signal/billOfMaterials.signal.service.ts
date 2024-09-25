import { Injectable, NgZone, OnDestroy, computed, signal } from "@angular/core";
import { BillOfMaterialsRelation } from "@yaotai/relation";
import { selectBillOfMaterialsMapList, selectBillOfMaterialss } from "@yaotai/billOfMaterials/billOfMaterials.frontend.selectors";
import { Subscription } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
import { BillOfMaterials } from "@yaotai/billOfMaterials/billOfMaterials.model";

@Injectable({ providedIn: 'root' })
export class BillOfMaterialsSignalService implements OnDestroy {
    billOfMaterialsTypeMap = {
        
    }

    private _sub: Subscription = new Subscription;

    private _totalBillOfMaterialsListWS = signal<BillOfMaterialsRelation[]>([]);
    private _totalBillOfMaterialsRecordWS = signal<Record<string, BillOfMaterialsRelation>>({});


    totalBillOfMaterialsRecordSignal = computed(() => this._totalBillOfMaterialsRecordWS());
    totalBillOfMaterialsListSignal = computed(() => this._totalBillOfMaterialsListWS());
    constructor(
        private _zone: NgZone
    ) {
        this.subscribeStore();
    }

    private subscribeStore() {
        const billOfMaterialsListSuber = selectBillOfMaterialss
            .subscribe(
                (billOfMaterialsList) => {
                    this._zone.run(() => {
                        this._totalBillOfMaterialsListWS.set(billOfMaterialsList);
                    })
                }
            );
        const billOfMaterialsRecordSuber = selectBillOfMaterialsMapList
            .subscribe(
                (billOfMaterialsRecord) => {
                    this._zone.run(() => {
                        this._totalBillOfMaterialsRecordWS.set(billOfMaterialsRecord as Record<string, BillOfMaterialsRelation>);
                    })
                }
            );
        this._sub.add(billOfMaterialsListSuber)
        this._sub.add(billOfMaterialsRecordSuber)
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    }
}