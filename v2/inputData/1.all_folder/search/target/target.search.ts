// import

import { signal, Signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TargetRelation } from '@yaotai/relation';
import { createFlexibleSearchSignal, SearchParam } from 'apps/frontend/src/app/service/other/search.signal.service';





// const


searchForm: FormGroup;
searchParam = signal<SearchParam>({
  state: 'search',
  optionList: [
    {
      enabled: true,
      key: 'deleted',
      type: 'boolean',
      value: false,
      mold: 'AND'
    }
  ]
})
filteredList: Signal<TargetRelation[]>


// constructor

private _fb: FormBuilder,



this.searchForm = this._fb.group({
    keyword: [''],
    deleted: false
  })
  this.filteredList = createFlexibleSearchSignal(this.targetSS.totalTargetListSignal, this.searchParam)

// fucntion

  search() {
    const formValue = this.searchForm.getRawValue()
    if (formValue.deleted) {
      Store.dispatch(new ReadTarget({ deleted: true }))
    }
    const searchParam: SearchParam = {
      state: 'search',
      optionList: [
        {
          enabled: true,
          key: 'deleted',
          type: 'boolean',
          value: formValue.deleted,
          mold: 'AND'
        },
        {
          enabled: true,
          key: 'serial',
          type: 'string',
          value: formValue.keyword,
          mold: 'OR'
        },
        {
          enabled: true,
          key: '_customer.name',
          type: 'string',
          value: formValue.keyword,
          mold: 'OR'
        },
        {
          enabled: true,
          key: '_customer.serial',
          type: 'string',
          value: formValue.keyword,
          mold: 'OR'
        }
      ]
    }
    // console.log('searchParam', searchParam);
    this.searchParam.set(searchParam)
  }