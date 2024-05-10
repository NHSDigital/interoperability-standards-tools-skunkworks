import {Component, Input} from '@angular/core';
import {QuestionnaireItem, QuestionnaireItemAnswerOption} from "fhir/r4";
import {CommonModule} from "@angular/common";
import {Coding} from "fhir/r4";
import {MatChipsModule} from "@angular/material/chips";
import {MatAnchor, MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {MatExpansionModule} from "@angular/material/expansion";
import {getMatIconNameNotFoundError, MatIconModule} from "@angular/material/icon";
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatTable,
  MatTableDataSource,
  MatTableModule
} from "@angular/material/table";

@Component({
  selector: 'app-questionnaire-definition-item',
  standalone: true,
  imports: [
    MatChipsModule,
    MatExpansionModule,
    MatIconModule,
    MatTableModule,
    CommonModule,
    MatAnchor,
    MatTooltip,
    MatIconButton
  ],
  templateUrl: './questionnaire-definition-item.component.html',
  styleUrl: './questionnaire-definition-item.component.scss'
})
export class QuestionnaireDefinitionItemComponent {

  @Input()
  set node(item: QuestionnaireItem) {
    this.item = item;
    if (item.answerOption !== undefined) {
      this.dataSource = new MatTableDataSource<QuestionnaireItemAnswerOption>(this.item.answerOption)
    }
  }

  item: QuestionnaireItem | undefined;
  panelOpenState = false;

  displayedColumns: string[] = ['code', 'display', 'codesystem'];
  // @ts-ignore
  dataSource: MatTableDataSource<QuestionnaireItemAnswerOption>;

  getTerminologyUrl(code: Coding[]) {
    // Use base onto as NHS England and Scotland versions have issues.
    if (code.length>0 && code[0].code !== undefined) return "https://ontoserver.csiro.au/shrimp/?concept=" + code[0].code + "&valueset=http%3A%2F%2Fsnomed.info%2Fsct%3Ffhir_vs"
    else return "https://ontoserver.csiro.au/shrimp/?concept=138875005&valueset=http%3A%2F%2Fsnomed.info%2Fsct%3Ffhir_vs&fhir=https%3A%2F%2Fontology.nhs.uk%2Fauthoring%2Ffhir"
  }
  getTerminologyDisplay(code: Coding[]) : string {
     if (code.length>0 ) {
       var result = ""
       if (code[0].system !== undefined && code[0].system ==='http://snomed.info/sct') result += "SNOMED CT "
       if (code[0].code !== undefined) result += code[0].code+ " "
       if (code[0].display !== undefined) result += code[0].display+ " "
       return result
     }
     else return 'No display term present'
  }

    protected readonly getMatIconNameNotFoundError = getMatIconNameNotFoundError;

  getDefinitionResource(definition: string) {
    var resource = definition.split("#")[0]
    var resources = resource.split("/")
    return resources[resources.length-1]
  }

  getDefinitionElement(definition: string) {
    return definition.split("#")[1]
  }
}
