import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-info-diaglog',
  templateUrl: './info-diaglog.component.html',
  styleUrls: ['./info-diaglog.component.scss']
})
export class InfoDiaglogComponent {
    constructor(public dialogRef: MatDialogRef<InfoDiaglogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any) {}
  ok() {
    this.dialogRef.close(true);
  }
}
