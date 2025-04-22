//app model 
import { CreateTargetComponent } from './components/widgets/form/create-target/create-target.component';


CreateTargetComponent,


  // main html

  <yaotai-create-target (click)="$event.stopPropagation()" *ngSwitchCase="'yaotai-create-target'" >
    </yaotai-create-target>

    // popup CS

    |
    'yaotai-create-target'

//list detail

create() {
  // this._popupCS.setPayload(target);
  this._popupCS.openContentLevel1('yaotai-create-target')
}

create(target: any) {
  this._popupCS.setPayload(target);
  this._popupCS.openContentLevel1('yaotai-create-target')
}



// list html

<button (click)="create(null)">建立 target</button>
