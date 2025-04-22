import { Component, NgZone, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpService } from 'apps/frontend/src/app/service/http.service';
import { PopupService } from 'apps/frontend/src/app/service/popup/popup.service';
import { XlsxService } from 'apps/frontend/src/app/service/xlsx.service';
import { catchError, from, map, throwError, toArray } from 'rxjs';

const chToEnMap: Map<string, string> = new Map([
  ['承攬商名稱(簡稱)', 'nickname'],
  ['公司名稱(全名)', 'name'],
  ['統編 ', 'id'],
  ['負責人', 'personInCharge'],
  ['聯絡人', 'contactorName'],
  ['聯絡人電話', 'contactorPhone'],
  ['公司電話', 'phone']
]);

interface ContractorModel {
  id: string;
  name: string;
  nickname: string;
  personInCharge: string;
  contactorName: string;
  contactorPhone: string;
  phone: string;
  selfOperated: boolean;
  state: string;
}

const taiwanVATValidator = (control: AbstractControl): ValidationErrors | null => {
  const taiwanVATPattern = /^\d{8}$/; // 統編必須是 8 位數字

  // 檢查是否符合正則表達式
  if (!taiwanVATPattern.test(control.value)) {
    return { invalidTaiwanVAT: true };
  }

  // 台灣統編格式進一步驗證邏輯（可以根據需求增加更複雜的驗證）
  const weights = [1, 2, 1, 2, 1, 2, 4, 1];
  const digits = control.value.split('').map(Number);
  let sum = 0;

  digits.forEach((digit: any, index: any) => {
    let product = digit * weights[index];
    sum += Math.floor(product / 10) + (product % 10);
  });

  if (sum % 10 !== 0) {
    return { invalidTaiwanVAT: true };
  }

  return null;
}

interface ContractorResModel {
  contractor: {
    id: string;
    name: string;
    nickname: string;
    personInCharge: string;
    contactorName: string;
    contactorPhone: string;
    phone: string;
    selfOperated: boolean;
    state: string;
  };
}

interface CreateContractorRes {
  departments: any[],
  existed: ContractorResModel[],
  failed: ContractorResModel[],
  users: ContractorResModel[]
}

@Component({
  selector: 'safetyai-taipower-multiple-create-contractor',
  templateUrl: './contractor.component.html',
  styleUrls: ['./contractor.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class MultipleCreateContractorComponent {

  isInit: boolean = true
  previewFormArray: FormArray<any> = this._fb.array([]);

  constructor(
    public popupS: PopupService,
    private _xlsxS: XlsxService,
    private _fb: FormBuilder,
    private _httpS: HttpService,
    private _zone: NgZone,
    private _snackBar: MatSnackBar,
  ) { }

  async onUpload(inputEl: HTMLInputElement) {
    console.log('event---> ', inputEl.files[0])
    const files = inputEl.files
    this.previewFormArray.clear();

    if (files.length == 0) {
      inputEl.value = null;
      return;
    };
    this.isInit = false
    const keyList = [...chToEnMap.values()]
    const contractorList = await this._xlsxS.excelToJson(files[0], keyList, 0, 1) as null as ContractorModel[];
    this.setFormArray(contractorList);
    console.log('insi---> ', contractorList)
    inputEl.value = null
  }




  setFormArray(contractorList: ContractorModel[]) {
    from(contractorList)
      .pipe(
        map(contractor => this.createFormGroup(contractor)),
      )
      .subscribe(
        async (contractorFG) => {
          // const id = contractorFG.getRawValue().id;
          // if (!!id) {
          //   const hasId = await this.verifyAccount(id);
          //   console.log("hasId---> ", hasId)
          //   if (hasId)
          //     contractorFG.get('id').setErrors({ hasId: true })
          //   this.previewFormArray.push(contractorFG as any)
          // } else
          this.previewFormArray.push(contractorFG as any)

          console.log(" this.previewFormArray----> ", this.previewFormArray)
        }
      );
  }
  checkCellphone(input: string): string {
    const regex = /^09\d{8}$/;
    return regex.test(input) ? input : '';
  }
  checkPhone(input: string): string {
    const regex = /^0\d{8,10}$/;
    const regexNum = /^[0-9]*$/;

    if (!input) return '';
    if (input.length < 9 || input.length > 11) return '';
    return regex.test(input) && regexNum.test(input) ? input : '';
  }

  createFormGroup(contractor: ContractorModel) {
    const checkedContactorPhone = this.checkCellphone(contractor?.contactorPhone)
    const checkedPhone = this.checkPhone(contractor?.phone)
    return this._fb.group({
      id: [contractor?.id || '', [Validators.required, taiwanVATValidator]],
      name: [contractor?.name || '', [Validators.required]],
      nikename: [contractor?.nickname || ''],
      personInChatre: [contractor?.contactorName || ''],
      contactorName: [contractor?.contactorName || ''],
      contractorPhone: [checkedContactorPhone || ''],
      phone: [checkedPhone || ''],
      selfOperated: [false],
      state: [contractor?.state || ''],

    })
  }

  sumbit() {
    console.log("sumbit contractor--> ", this.previewFormArray.getRawValue())
    const originalContractors = this.previewFormArray.getRawValue()
    from(originalContractors)
      .pipe(
        map((originalContractors) => {
          const contractor = {
            contractor: {
              id: `${originalContractors.id}`,
              name: originalContractors.name,
              nickname: originalContractors.nickname,
              personInCharge: originalContractors.personInChatre,
              contactorName: originalContractors.contactorName,
              contactorPhone: `${originalContractors.contractorPhone}`,
              phone: `${originalContractors.phone}`,
              selfOperated: originalContractors.selfOperated,
              state: originalContractors.state,

            },
          }
          return contractor
        }),
        toArray()
      ).subscribe(
        (contractorList) => {
          console.log('contractorList===> ', contractorList)

          // need open wait api 1/3

          // const payload: ITpRegister = {
          //   list: userList
          // }
          // console.log('payload===> ', payload)
          // this.requestCreateContractor(payload)

          // need open wait api 1/3
        }
      );
  }

  // need open wait api start 2/3 

  // requestCreateContractor(payload: ITpRegister) {
  //   this._httpS.tpRegister(payload)
  //     .pipe(
  //       catchError(e => throwError(() => new Error(e)))
  //     )
  //     .subscribe((res: any) => {
  //       console.log('res---> ', res);
  //       this.handelCreateContractorRes(res)
  //       this.popupS.closePopupLevel1();
  //     },
  //       err => {
  //         this.showSnackBar('台電人員批次上傳失敗！！');
  //         this.popupS.closePopupLevel1();
  //       }
  //     );
  // }

  // need open wait api end 2/3 


  handelCreateContractorRes(res: CreateContractorRes) {

    if (res?.failed?.length == 0) {
      this.showSnackBar('承攬商批次上傳成功！！');
      return
    }
    // if (res?.existed?.length == 0 && res?.failed?.length == 0) {
    //   this.showSnackBar('台電人員批次上傳成功！！');
    //   return
    // }

    let msg = "";
    // if (res?.existed?.length != 0) {
    //   const existedStr = res?.existed?.reduce((existedStr, userRes: ContractorResModel) => {
    //     const str = `${userRes.user.id} ${userRes.user.name} \n`
    //     return existedStr + str
    //   }, '人員已存在：\n');

    //   msg += `${existedStr} \n`
    // }



    // need open wait api start 3/3

    // if (res?.failed?.length != 0) {
    //   const failedStr = res?.failed?.reduce((failedStr, userRes: ContractorResModel) => {
    //     const str = `${userRes.user.id} ${userRes.user.name} \n`
    //     return failedStr + str
    //   }, '建立失敗：\n');

    //   msg += failedStr
    // }
    // alert(msg)

    // need open wait api end 3/3




    // this.showSnackBar(msg,20000,'確定');
  }

  showSnackBar(msg: string, duration = 2000, btnStr = '') {
    this._zone.run(() => {
      this._snackBar.open(msg, btnStr, {
        verticalPosition: 'top',
        duration,
        panelClass: ['custom-snackbar']
      });
    })
  }


  verifyAccount = (account: string): Promise<boolean> => {

    return new Promise(
      (result) => {
        this._httpS
          .verifyAccount(account)
          .pipe(catchError((err) => throwError(() => err)))
          .subscribe({
            next: (hasId) => {
              result(hasId)
            },
            error: (err) => result(true),
            // complete: ()=> console.log(12341234)
          });
      }
    );

  }

  async test() {
    // this.previewFormArray.at(0).get("id").setErrors({ hasId: true })
    // this.verifyAccount()
    let text = "test\ntest";
    alert(text)
    // this.showSnackBar(text)
  }

}
