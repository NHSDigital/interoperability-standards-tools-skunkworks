import {AfterContentChecked, Component, Input, ViewChild} from '@angular/core';
import {
  Duration,
  Quantity,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireItemInitial,
  ValueSet
} from "fhir/r4";
import {CommonModule} from "@angular/common";
import {Coding} from "fhir/r4";
import {MatChipsModule} from "@angular/material/chips";
import {MatAnchor, MatIconAnchor, MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {MatExpansionModule} from "@angular/material/expansion";
import { MatIconModule} from "@angular/material/icon";
import {
  MatTableDataSource,
  MatTableModule
} from "@angular/material/table";
import {ConfigService} from "../../../config.service";
import {HttpClient} from "@angular/common/http";
import {MatPaginator} from "@angular/material/paginator";
import {ConceptDisplayComponent} from "../../../concept/concept-display/concept-display.component";

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
    MatIconButton,
    MatIconAnchor,
    MatPaginator,
    ConceptDisplayComponent
  ],
  templateUrl: './questionnaire-definition-item.component.html',
  styleUrl: './questionnaire-definition-item.component.scss'
})
export class QuestionnaireDefinitionItemComponent implements AfterContentChecked {
  private applyPaginator: boolean = false;

  @Input()
  set node(item: QuestionnaireItem) {
    this.item = item;
    if (item.answerOption !== undefined) {

      for (let entry of item.answerOption) {
        if (entry.valueString !== undefined) {
          entry.valueCoding = {
            display: entry.valueString
          }
          entry.valueString = undefined
        }
      }
      this.dataSource = new MatTableDataSource<QuestionnaireItemAnswerOption>(this.item.answerOption)
      this.applyPaginator = true
    }
    if (item.answerValueSet !== undefined) {
      this.extractValueSet(item.answerValueSet)
    }
    if (item.initial !== undefined && item.initial.length > 0) {
      this.dataSourceInitial = new MatTableDataSource<QuestionnaireItemInitial>(this.item.initial)
    }
  }

  item: QuestionnaireItem | undefined;
  panelOpenState = false;

  valueSetNotFound : string | undefined = undefined;

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  displayedColumns: string[] = ['initial', 'display', 'code',  'codesystem'];
  // @ts-ignore
  dataSource: MatTableDataSource<QuestionnaireItemAnswerOption>;

  displayedColumnsInitial: string[] = [ 'display', 'code',  'codesystem'];
  // @ts-ignore
  dataSourceInitial: MatTableDataSource<QuestionnaireItemInitial>;

  constructor(private config: ConfigService,
              private http: HttpClient
  ) {
  }


  extractValueSet(valueSet : string) {
    this.http.get(this.config.sdcServer() + '/ValueSet/\$expand?url=' + valueSet).subscribe((result) => {
      const valueSet = result as ValueSet
      if (valueSet.resourceType === 'ValueSet') {

        if (valueSet.expansion !== undefined && valueSet.expansion.contains !== undefined && valueSet.expansion.contains.length>0) {
          var answers: QuestionnaireItemAnswerOption[] = []
          for (let entry of valueSet.expansion.contains) {
             const answer : QuestionnaireItemAnswerOption = {
               valueCoding: {
                 code: entry.code,
                 system: entry.system,
                 display: entry.display
               }
             }
             answers.push(answer)
          }

          this.dataSource = new MatTableDataSource<QuestionnaireItemAnswerOption>(answers)
          this.applyPaginator = true
        }
      }
    },
        (err)=>{
          console.log(err)
          this.valueSetNotFound = 'Issue retrieving valueset'
          if (err.error !== undefined) {
            if (err.error.issue  !== undefined && err.error.issue.length > 0) {
               if (err.error.issue[0].diagnostics !== undefined) {
                 this.valueSetNotFound = err.error.issue[0].diagnostics
               }
            }
          }
        })
  }

  getDefinitionUrl(definition: string) {
    const resource = this.getDefinitionResource(definition)
    const element = this.getDefinitionElement(definition).replace(resource + ".","")
    return "https://hl7.org/fhir/R4/" + resource + "-definitions.html#" + resource + "." + element
  }
  getDefinitionResource(definition: string) {
    var resource = definition.split("#")[0]
    var resources = resource.split("/")
    return resources[resources.length-1]
  }

  getDefinitionElement(definition: string) {
    return definition.split("#")[1]
  }
  hasUnitsAllowed() {
    if (this.getUnitsAllowed() !== undefined) return true
    else return false
  }
  getUnitsAllowed() :Coding[] | undefined {
    if (this.item !== undefined && this.item.extension !== undefined && this.item.extension.length>0) {
      var coding : Coding[] = []
      for (let extension of this.item.extension) {
        if (extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption') {
            const code: Coding = {
              system: extension.valueCoding?.system,
              code:extension.valueCoding?.code,
              display:extension.valueCoding?.display
            }
            coding.push(code)
        }
      }
      if (coding.length>0) return coding
      else return undefined
    } else {
      return undefined;
    }
  }

  hasSDCExtraction() {
    if (this.item !== undefined && this.item.extension !== undefined && this.item.extension.length>0) {
      for (let extension of this.item.extension) {
        if (extension.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract') {
          if (extension.valueBoolean !== undefined) return extension.valueBoolean
        }
      }
    }
    return false
  }
  hasSDCDuration() {
    if (this.getSDCDuration() !== undefined) return true
    else return false
  }
  getSDCDuration() :Duration[] | undefined {
    if (this.item !== undefined && this.item.extension !== undefined && this.item.extension.length>0) {
      var coding : Duration[] = []
      for (let extension of this.item.extension) {
        if (extension.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationLinkPeriod') {
          const code: Duration = {
            value: extension.valueDuration?.value,
            system: extension.valueDuration?.system,
            code:extension.valueDuration?.code,
            unit:extension.valueDuration?.unit
          }
          coding.push(code)
        }
      }
      if (coding.length>0) return coding
      else return undefined
    } else {
      return undefined;
    }
  }

  ngAfterContentChecked(): void {
    if (this.applyPaginator && this.paginator !== undefined) {
      this.applyPaginator = false
      if (this.dataSource.data.length > 5) {

        this.dataSource.paginator = this.paginator
      }
    }
  }
  getObservationValueType(item: QuestionnaireItem) {
    if (item.type === null) return undefined
    switch (item.type) {
      case "boolean": {
        return "valueBoolean"
      }
      case "open-choice":
      case "choice": {
        return "valueCodeableConcept"
      }
      case "date":
      case "dateTime": {
        return "valueDateTime"
      }
      case "time": {
        return "valueTime"
      }
      case "quantity":
      case "decimal": {
        return "valueQuantity"
      }
      case "integer":
      {
        return "valueInteger"
      }
      case "text":
      case "string": {
        return "valueString"
      }
      default: {
        return "value[x]"
      }
    }

  }


  getCodingFromQuantity(valueQuantity : Quantity) {
    let coding : Coding = {
      system : valueQuantity.system,
      code: valueQuantity.code,
      display: valueQuantity.unit
    }
    return coding
  }
}
