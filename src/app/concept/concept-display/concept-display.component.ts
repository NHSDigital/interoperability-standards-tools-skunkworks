import {booleanAttribute, Component, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {Coding} from "fhir/r4";
import {ConceptPopupComponent} from "../concept-popup/concept-popup.component";
import {ConfigService} from "../../config.service";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {MatIconButton} from "@angular/material/button";

@Component({
  selector: 'app-concept-display',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton
  ],
  templateUrl: './concept-display.component.html',
  styleUrl: './concept-display.component.scss'
})
export class ConceptDisplayComponent {
  @Input()
  coding : Coding = {}

  @Input({transform: booleanAttribute})
  codeOnly = false

  constructor(
              public dialog: MatDialog
  ) {
  }

  getTerminologyDisplayCode(code: Coding) : string {
    var result = ""

    if (this.codeOnly) return code.code !== undefined ? code.code : ''

    if (code.display !== undefined) result += code.display+ " "
    if (code.code !== undefined) result += code.code+ " "
    if (code.system !== undefined && code.system ==='http://snomed.info/sct') result += "SNOMED CT "
    return result
  }

  showConcept() {

    this.dialog.open(ConceptPopupComponent, {
      data: this.coding
    });
  }
}
