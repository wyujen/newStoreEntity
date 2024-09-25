import { Injectable, NgZone, OnDestroy, computed, signal } from "@angular/core";
import { InventoryReceiptRelation } from "@yaotai/relation";
import { selectInventoryReceiptMapList, selectInventoryReceipts } from "@yaotai/inventoryReceipt/inventoryReceipt.frontend.selectors";
import { Subscription } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
import { InventoryReceipt } from "@yaotai/inventoryReceipt/inventoryReceipt.model";

@Injectable({ providedIn: 'root' })
export class InventoryReceiptSignalService implements OnDestroy {
    inventoryReceiptTypeMap = {
        
    }

    private _sub: Subscription = new Subscription;

    private _totalInventoryReceiptListWS = signal<InventoryReceiptRelation[]>([]);
    private _totalInventoryReceiptRecordWS = signal<Record<string, InventoryReceiptRelation>>({});


    totalInventoryReceiptRecordSignal = computed(() => this._totalInventoryReceiptRecordWS());
    totalInventoryReceiptListSignal = computed(() => this._totalInventoryReceiptListWS());
    constructor(
        private _zone: NgZone
    ) {
        this.subscribeStore();
    }

    private subscribeStore() {
        const inventoryReceiptListSuber = selectInventoryReceipts
            .subscribe(
                (inventoryReceiptList) => {
                    this._zone.run(() => {
                        this._totalInventoryReceiptListWS.set(inventoryReceiptList);
                    })
                }
            );
        const inventoryReceiptRecordSuber = selectInventoryReceiptMapList
            .subscribe(
                (inventoryReceiptRecord) => {
                    this._zone.run(() => {
                        this._totalInventoryReceiptRecordWS.set(inventoryReceiptRecord as Record<string, InventoryReceiptRelation>);
                    })
                }
            );
        this._sub.add(inventoryReceiptListSuber)
        this._sub.add(inventoryReceiptRecordSuber)
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    }
}