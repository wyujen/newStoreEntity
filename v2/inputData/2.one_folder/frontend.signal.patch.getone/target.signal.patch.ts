private _targetId = signal<string>('');


targetSignal = computed(() => {
    const targetRecord = this._totalTargetRecordWS();
    const target = targetRecord[this._targetId()] as TargetRelation || null
    return target
})

setTargetId(id: string) {
    this._targetId.set(id)
}