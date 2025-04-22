// import
Signal, signal
import { createAutocompleteDisplaySignal, createFlexibleSearchSignal, SearchParam } from 'apps/frontend/src/app/service/other/search.signal.service';



// const 
targetSearchParam = signal<SearchParam>({
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
  targetFilteredList: Signal<any[]>
  displayWithTarget: Signal<(id: string) => string>;

// constructor{}
  this.targetFilteredList = createFlexibleSearchSignal(this.targetSS.totalTargetListSignal, this.targetSearchParam)
    this.Form.valueChanges.subscribe((data) => {
      this.targetSearchParam.set({
        state: 'search',
        optionList: [
          {
            enabled: true,
            key: 'deleted',
            type: 'boolean',
            value: false,
            mold: 'AND'
          },
          {
            enabled: true,
            key: 'name',
            type: 'keyword',
            value: data.targetId,
            mold: 'OR'
          },
          {
            enabled: true,
            key: 'id',
            type: 'keyword',
            value: data.targetId,
            mold: 'OR'
          }
        ]
      })
    })
    this.displayWithTarget = createAutocompleteDisplaySignal(this.targetSS.totalTargetRecordSignal, 'name')