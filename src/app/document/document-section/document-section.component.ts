import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CompositionSection} from "fhir/r4";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ResourceDialogComponent} from "../../resource-dialog/resource-dialog.component";
import {fhirclient} from "fhirclient/lib/types";
import Reference = fhirclient.FHIR.Reference;

@Component({
  selector: 'app-document-section',
  templateUrl: './document-section.component.html',
  styleUrls: ['./document-section.component.scss']
})
export class DocumentSectionComponent {

  @Input()
  // @ts-ignore
  section: CompositionSection

  @Output()
  reference = new EventEmitter<Reference>()

  constructor(public dialog: MatDialog) {

  }


  select(entry: any) {
    console.log(entry)
    this.reference.emit(entry)
  }
}
