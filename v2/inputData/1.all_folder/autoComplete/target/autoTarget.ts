// const 
filteredTargetList!: Observable<any[]>
displayWithTarget!: (id: string) => string;


// ts constructor

private _autocompleteS: AutocompleteService,
public targetSS: TargetSignalService

// init
this.filteredTargetList = this._autocompleteS.setupAutocomplete(
    this.formmmmmmmmmmm.get('targetId')!.valueChanges, // valueChanges 是 FormControl 的變化
    ()=>this.targetSS.totalTargetListSignal() // 這裡是要被過濾的原始清單

);
this.displayWithTarget = this._autocompleteS.getAutocompleteDisplay(() => this.targetSS.totalTargetRecordSignal(), 'name');