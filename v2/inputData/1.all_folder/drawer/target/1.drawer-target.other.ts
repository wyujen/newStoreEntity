//app model 
import { DrawerTargetComponent } from './components/widgets/drawer-group/drawer-target/drawer-target.component';

DrawerTargetComponent,


// main html

<yaotai-drawer-target *ngSwitchCase="'yaotai-drawer-target'"></yaotai-drawer-target>

// drawer CS

|
  'yaotai-drawer-target'

  //list detail

  details(target: any) {
    this._drawerCS.setPayload(target);
    this._drawerCS.open('yaotai-drawer-target')
  }

  // list html

  <div class="list-content" (click)="details(null)">