import { ChangeDetectorRef, Component, computed, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@yaotai/frontend';
import { CreateProject } from '@yaotai/project/project.actions';

import { PopupComponentStore } from '../../../../../component-store/popup-component-store';
import { addToSubscription, timeNumberToYMD, timeYMDToNumber } from '../../../../../share/share.function';
import { Subscription } from 'rxjs';
import { ReadDetailForCreateProject, ReadSalesOrder } from '@yaotai/salesOrder/salesOrder.actions';
import { ProjectSignalService } from 'apps/frontend/src/app/service/signal/project.signal.service';
import { SalesOrderSignalService } from 'apps/frontend/src/app/service/signal/salesOrder.signal.service';
import { PurchaseOrderSignalService } from 'apps/frontend/src/app/service/signal/purchaseOrder.signal.service';
import { ReadPurchaseOrder } from '@yaotai/purchaseOrder/purchaseOrder.actions';
import { after, orderBy, round } from 'lodash';
import { ProcedureSignalService } from 'apps/frontend/src/app/service/signal/procedure.signal.service';
import { ContractOrderSignalService } from 'apps/frontend/src/app/service/signal/contractOrder.signal.service';
import { ReadContractOrder } from '@yaotai/contractOrder/contractOrder.actions';



@Component({
  selector: 'yaotai-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit, OnDestroy {
  isEffectComplete: boolean = true
  subscription: Subscription = new Subscription;

  salesOrderList: any[] = []
  purchaseOrderList: any[] = []

  projectForm: FormGroup;
  originalProject: any
  seletedSalesOrderId!: string
  currentSelectedSalesOrder: any
  currentTaskList: any[] = []
  roundedReqProdQtySignal = signal<number>(0)

  salesOrderSignal = computed(() => {
    return this.salesOrderSS.totalSalesOrderRecordSignal()?.[this.seletedSalesOrderId] ?? null;
  })
  bomSignal = computed(() => this.salesOrderSignal()?._product?._bom || null)
  bomDefectRateSignal = computed(() => {
    const defectRate = Number(this.bomSignal()?.defectRate) || 0;
    return defectRate * 100;
  })



  //產品庫存
  availableProductStockSignal = computed(() => {
    const salesOrder = this.salesOrderSS.totalSalesOrderRecordSignal()?.[this.seletedSalesOrderId] ?? null;
    // console.log(salesOrder, 'totalSalesOrder')
    if (!salesOrder) return 0;
    const inventory = salesOrder?._product?._inventory ?? null;
    if (!inventory) return 0;
    const realStock = inventory.stock - inventory.reservedStock;
    return Math.max(0, realStock);
  });


  // 原料可用庫存

  availableMaterialStockSignal = computed(() => {
    const salesOrder = this.salesOrderSS.totalSalesOrderRecordSignal()?.[this.seletedSalesOrderId];
    const inventory = salesOrder?._product?._bom?._material?._inventory;
    if (!inventory) return 0;
    const realStock = inventory.stock - inventory.reservedStock;
    return Math.max(0, realStock);
  });


  //可產數量
  producibleQtySignal = computed(() => {
    const stock = this.availableMaterialStockSignal() || 0;
    const bom = this.bomSignal();
    const materialWeightNeeded = Number(bom?.materialWeightNeeded) || 0;
    const defectRate = Math.max(0, Math.min(1, Number(bom?.defectRate) || 0));

    if (stock <= 0 || materialWeightNeeded <= 0) return 0;

    const producibleQty = (stock / materialWeightNeeded) * (1 - defectRate);
    return Math.max(0, producibleQty);
  });





  constructor(
    private _fb: FormBuilder,
    private _cdr: ChangeDetectorRef,
    private _popupCS: PopupComponentStore,
    public projecttSS: ProjectSignalService,
    public salesOrderSS: SalesOrderSignalService,
    public purchaseOrderSS: PurchaseOrderSignalService,
    public contractOrderSS: ContractOrderSignalService,
    public procedureSS: ProcedureSignalService
  ) {
    this.projectForm = this._fb.group({
      serial: [null],
      stampingStartDate: [null, [Validators.required]],
      stampingEndDate: [null, [Validators.required]],
      deliveryDate: [''],

      reqProdQty: [0],
      suggPurchQty: [0],


      materialReservedStock: [0],//

      purchaseOrderId: [null],
      salesOrderId: [null, [Validators.required]],
      contractOrderId: [null],
      billOfMaterialsId: [''],
      remark: [''],

    });

    effect(() => {
      const effectTrigger = this.salesOrderSS.totalSalesOrderRecordSignal()?.[this.seletedSalesOrderId]
      if (!effectTrigger) return
      // console.log('effectTrigger')
      this.setCalculateResult()
    })

  }


  ngOnInit(): void {
    this.setupValueChanges();
    const payloadSuber = this._popupCS.selectPayload$.subscribe((payload) => {
      this.originalProject = payload
      this.projectForm.patchValue(payload)
      this._cdr.detectChanges()
    });
    addToSubscription(this.subscription, payloadSuber);
    Store.dispatch(new ReadSalesOrder())
    Store.dispatch(new ReadPurchaseOrder())
    Store.dispatch(new ReadContractOrder())
  }

  setCalculateResult() {

    //需生產數量

    const defectRate = Math.max(0, Math.min(1, Number(this.bomSignal()?.defectRate) || 0));

    let originalReqProdQty = ((0) - this.availableProductStockSignal()) / Math.max(1e-8, 1 - defectRate);
    if (originalReqProdQty < 0) originalReqProdQty = 0;
    const roundedReqProdQty = Math.ceil(originalReqProdQty)

    const materialWeightNeeded = Number(this.bomSignal()?.materialWeightNeeded) || 0;
    let originalSuggPurchQty = (roundedReqProdQty * materialWeightNeeded) - this.availableMaterialStockSignal();
    const roundedSuggPurchQty = Math.ceil(Math.max(0, originalSuggPurchQty));
    //建議採購數量 

    if (!this.bomSignal()?._bomProcedureMap) return
    const procedureList = Object.values(this.bomSignal()?._bomProcedureMap).map((bomProcedure) => {
      return {
        procedure: bomProcedure._procedure,
        defecrateRate: bomProcedure.defectRate,
        sequence: bomProcedure.sequence
      }
    })



    const stampingBaseDay = procedureList.reduce((acc, procedure) => {
      if (procedure?.procedure?.type === 'INHOUSE') {
        acc = acc + 1;
      }
      return acc;
    }, 0); // 初始值設為 0

    const verifyBaseDay = procedureList.reduce((acc, procedure) => {
      if (procedure?.procedure?.type === 'VERIFY') {
        acc = acc + 2;
      }
      return acc; // 必須回傳 acc，否則 acc 會丟失
    }, 0); // 初始值設為 0


    const baseCount = 3000 // 生產量基數
    const millisecondsPerDay = 24 * 60 * 60 * 1000  // 一天的毫秒

    const deliveryDateNumber = timeYMDToNumber(this.salesOrderSignal().deliveryDate)

    const stampingParameters = roundedReqProdQty / baseCount
    const verifyParameters = 0 / baseCount

    const stampingNumberDuration = stampingParameters + stampingBaseDay * millisecondsPerDay//沖壓毫秒
    const verifyNumberDuration = verifyParameters + verifyBaseDay * millisecondsPerDay        //全檢毫秒

    const totalNumberDuration = stampingNumberDuration + verifyNumberDuration // 總毫秒


    const stampingEnd = timeNumberToYMD(Math.ceil(deliveryDateNumber - verifyNumberDuration))
    const stampingStart = timeNumberToYMD(Math.ceil(deliveryDateNumber - totalNumberDuration))

    const materialReservedStock = roundedReqProdQty * this.bomSignal().materialWeightNeeded

    this.projectForm.patchValue({
      stampingStartDate: stampingStart,
      stampingEndDate: stampingEnd,
      deliveryDate: this.salesOrderSignal().deliveryDate,
      reqProdQty: roundedReqProdQty,
      suggPurchQty: roundedSuggPurchQty,
      materialReservedStock: materialReservedStock
    })
    this.setTaskList()
  }

  setTaskList() {

    let isContract = false

    if (!this.projectForm.get('contractOrderId')?.value || this.projectForm.get('contractOrderId')?.value.length < 8) {
      isContract = false
    } else {
      isContract = true
    }


    let finalTaskList = []

    if (isContract) {
      const contractTask = {
        sequence: 1,
        procedureId: 'manufact',
        expectOutput: this.projectForm.get('reqProdQty')?.value,
        name: '託工',
        defectRate: 0
      }
      const bomProcedureList = Object.values(this.salesOrderSS.totalSalesOrderRecordSignal()?.[this.seletedSalesOrderId]?._product?._bom?._bomProcedureMap ?? {})
      const afterOrderBy = orderBy(bomProcedureList, ['sequence'], ['asc'])

      let lastCount = this.projectForm.get('reqProdQty')?.value
      let currentSequence = 1

      const taskList = afterOrderBy.map((bomProcedure: any) => {
        if (bomProcedure._procedure.type == 'INHOUSE') {
          return null
        } else {
          const count = lastCount * (1 - (parseFloat(bomProcedure?.defectRate) || 0))
          lastCount = count
          console.log(bomProcedure.defectRate, 'sssseee')
          currentSequence = currentSequence + 1
          return {
            name: bomProcedure._procedure.name,
            sequence: currentSequence,
            defectRate: bomProcedure?.defectRate || 0,
            procedureId: bomProcedure.procedureId,
            expectOutput: Math.ceil(count)
          }
        }
      }).filter(x => x != null)

      const contractTaskList = [contractTask, ...taskList]
      // console.log('taskList by contract', contractTaskList)
      finalTaskList = contractTaskList

    } else {

      const bomProcedureList = Object.values(this.salesOrderSS.totalSalesOrderRecordSignal()?.[this.seletedSalesOrderId]?._product?._bom?._bomProcedureMap ?? [])
      const afterOrderBy = orderBy(bomProcedureList, ['sequence'], ['asc'])
      if (afterOrderBy.length == 0) return
      let lastCount = this.projectForm.get('reqProdQty')?.value ?? 0
      const taskList = afterOrderBy.map((bomProcedure: any) => {
        const count = lastCount * (1 - (parseFloat(bomProcedure?.defectRate) || 0))
        lastCount = count
        // console.log(bomProcedure?._procedure)
        return {
          name: bomProcedure?._procedure?.name ?? '',
          sequence: bomProcedure.sequence,
          procedureId: bomProcedure.procedureId,
          defectRate: bomProcedure?.defectRate || 0,
          expectOutput: Math.ceil(count)
        }
      })

      // console.log('taskList by no contract', taskList)
      finalTaskList = taskList
    }
    this.currentTaskList = finalTaskList
    this._cdr.detectChanges()
  }

  setupValueChanges() {
    this.projectForm.get('salesOrderId')?.valueChanges.subscribe(value => {
      if (value) {
        this.seletedSalesOrderId = value
        // console.log('sssssss', value)
        Store.dispatch(new ReadDetailForCreateProject({ id: value }));
        this.isEffectComplete = false
      }
    });


  }

  save() {

    const projectData = {
      stampingStartDate: timeYMDToNumber(this.projectForm.get('stampingStartDate')?.value),
      stampingEndDate: timeYMDToNumber(this.projectForm.get('stampingEndDate')?.value),
      deliveryDate: timeYMDToNumber(this.projectForm.get('deliveryDate')?.value),

      reqProdQty: this.projectForm.get('reqProdQty')?.value,
      suggPurchQty: this.projectForm.get('suggPurchQty')?.value,

      purchaseOrderId: this.projectForm.get('purchaseOrderId')?.value,
      salesOrderId: this.seletedSalesOrderId,
      contractOrderId: this.projectForm.get('contractOrderId')?.value,
      remark:this.projectForm.get('remark')?.value
    }

    const createData = {
      ...projectData,
      customerId: this.salesOrderSS.totalSalesOrderRecordSignal()?.[this.seletedSalesOrderId]?.customerId,
      billOfMaterialsId: this.salesOrderSS.totalSalesOrderRecordSignal()?.[this.seletedSalesOrderId]?._product?._bom?.id,
      taskList: this.currentTaskList,
      materialReservedStock: 100
    }
    console.log('createDattttttta', createData)
    Store.dispatch(new CreateProject([createData]))


    this._popupCS.closeContentLevel1();
  }

  test() {
    console.log(this.projectForm.getRawValue())
  }




  getStampingEndDay(startDay: any) {
    if (startDay) {
      const startDate = new Date(startDay);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      return endDate.toISOString().split('T')[0]
    } else {
      return null
    }
  }

  close() {
    this._popupCS.closeContentLevel1();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
