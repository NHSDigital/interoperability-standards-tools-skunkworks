import {Component, Inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {Coding, OperationOutcome, Parameters, ParametersParameter} from "fhir/r4";
import {NgForOf, NgIf} from "@angular/common";
import {ConfigService} from "../../config.service";
import {HttpClient} from "@angular/common/http";
import {MatIcon} from "@angular/material/icon";
import {MatChip, MatChipRow, MatChipSet} from "@angular/material/chips";

@Component({
  selector: 'app-concept-popup',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    NgIf,
    NgForOf,
    MatIcon,
    MatChipRow,
    MatChip,
    MatChipSet
  ],
  templateUrl: './concept-popup.component.html',
  styleUrl: './concept-popup.component.scss'
})
export class ConceptPopupComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Coding,
              private config: ConfigService,
              private http: HttpClient) {}

  lookup: Parameters | undefined
  validateCode : OperationOutcome | undefined
  parent : string[] = []

  ngOnInit(): void {
    if (this.data.code !== undefined && this.data.system !== undefined) {
      this.http.get(this.config.validateUrl() + '/CodeSystem/\$lookup?system='+this.data.system
          + '&code='+ this.data.code).subscribe(
          (result) => {

            this.lookup = result as Parameters
            this.getParents()
              }
      )
    }
    if (this.data.code !== undefined && this.data.system !== undefined  && this.data.display !== undefined) {
      this.http.get(this.config.validateUrl() + '/ValueSet/\$validate-code?system='+this.data.system
          + '&code='+ this.data.code
          + '&display='+ this.data.display).subscribe(
          (result) => {
            this.validateCode = result as OperationOutcome
          }
      )
    }
  }

  getDisplay(): string[] {
    var display: string[] = []
    if (this.lookup !== undefined && this.lookup.parameter !== undefined) {
       for(let property of this.lookup.parameter) {
         if (property.name === 'designation' && property.part !== undefined) {
            if (this.hasName(property.part,"display")) {
              display.push(this.getValue(property.part))
            }
         }
       }
    }
    return display
  }
  getCategory(): string[] {
    var display: string[] = this.getFSN()
    var newDisplay : string[] = []
    for (let category of display) {
      var parts = category.split('(')
      if (parts.length>0) {
         var parts2 = parts[1].split(")")
        if (parts2.length>0) newDisplay.push(parts2[0])
      }
    }
    return newDisplay
  }
  getFSN(): string[] {
    var display: string[] = []
    if (this.lookup !== undefined && this.lookup.parameter !== undefined) {
      for(let property of this.lookup.parameter) {
        if (property.name === 'designation' && property.part !== undefined) {
          if (this.hasName(property.part,"900000000000003001")) {
            display.push(this.getValue(property.part))
          }
        }
      }
    }
    return display
  }
  getPreferred(): string[] {
    var display: string[] = []
    if (this.lookup !== undefined && this.lookup.parameter !== undefined) {
      for(let property of this.lookup.parameter) {
        if (property.name === 'designation' && property.part !== undefined) {
          if (this.hasName(property.part,"preferredForLanguage") && this.hasLanguage(property.part,"en-x-sctlang-90000000-00005080-04")) {
            display.push(this.getValue(property.part))
          }
        }
      }
    }
    return display
  }
  getSynonym(): string[] {
    var display: string[] = []
    if (this.lookup !== undefined && this.lookup.parameter !== undefined) {
      for(let property of this.lookup.parameter) {
        if (property.name === 'designation' && property.part !== undefined) {
          if (this.hasName(property.part,"900000000000013009")) {
            display.push(this.getValue(property.part))
          }
        }
      }
    }
    return display
  }
  getActive(): boolean {

    if (this.lookup !== undefined && this.lookup.parameter !== undefined) {
      for(let property of this.lookup.parameter) {
        if (property.name === 'property' && property.part !== undefined) {
          if (this.hasCode(property.part,"inactive")) {
            return !this.getBooleanValue(property.part)
          }
        }
      }
    }
    return false
  }
  private hasLanguage(part: ParametersParameter[] , name: string) {
    for (let property of part) {
      if (property.name === 'language') {
        if (property)
          if (property.valueCode !== undefined
              && property.valueCode === name) return true
      }
    }
    return false;
  }
  private hasCode(part: ParametersParameter[] , name: string) {
    for (let property of part) {
      if (property.name === 'code') {
        if (property)
          if (property.valueCode!== undefined && property.valueCode === name) return true
      }
    }
    return false;
  }
  private hasName(part: ParametersParameter[] , name: string) {
    for (let property of part) {
      if (property.name === 'use') {
        if (property)
        if (property.valueCoding !== undefined && property.valueCoding.code !== undefined
        && property.valueCoding.code === name) return true
      }
    }
    return false;
  }
  private getBooleanValue(part: ParametersParameter[]) {
    for (let property of part) {
      if (property.name === 'value' && property.valueBoolean !== undefined) {
        return property.valueBoolean
      }
    }
    return false;
  }
  private getCodeValue(part: ParametersParameter[]) {
    for (let property of part) {
      if (property.name === 'value' && property.valueCode !== undefined) {
        return property.valueCode
      }
    }
    return undefined;
  }
  private getValue(part: ParametersParameter[]) {
    for (let property of part) {
      if (property.name === 'value' && property.valueString !== undefined) {
        return property.valueString
      }
    }
    return "";
  }

  getIssues(): string[] {
    var display: string[] = []
    if (this.validateCode !== undefined) {
      for(let issue of this.validateCode.issue) {
        if (issue.diagnostics !== undefined) {
            display.push(issue.diagnostics)
          }
        }
      }
    if (display.length == 0) display.push("No issues detected")
    return display
  }
/*
  getTerminologyUrl(code: Coding[]) {
    // Use base onto as NHS England and Scotland versions have issues.
    //if (code.length>0 && code[0].code !== undefined) return "https://ontoserver.csiro.au/shrimp/?concept=" + code[0].code + "&valueset=http%3A%2F%2Fsnomed.info%2Fsct%3Ffhir_vs"
    if (code.length>0 && code[0].code !== undefined)
    else return "https://ontoserver.csiro.au/shrimp/?concept=138875005&valueset=http%3A%2F%2Fsnomed.info%2Fsct%3Ffhir_vs&fhir=https%3A%2F%2Fontology.nhs.uk%2Fauthoring%2Ffhir"
  }
  */
  getTerminologyUrlbyCode(code : string | undefined, system : string| undefined) {
    return "https://ontoserver.csiro.au/shrimp/?concept=" + code + "&version=http%3A%2F%2Fsnomed.info%2Fsct%2F83821000000107%2Fversion%2F20221123&valueset=http%3A%2F%2Fsnomed.info%2Fsct%2F83821000000107%3Ffhir_vs"
    // return "https://ontoserver.csiro.au/shrimp/?concept=" + code + "&valueset=http%3A%2F%2Fsnomed.info%2Fsct%3Ffhir_vs"
  }

  private getParents() {
    if (this.lookup !== undefined && this.lookup.parameter !== undefined) {
      for(let property of this.lookup.parameter) {
        if (property.name === 'property' && property.part !== undefined) {
          if (this.hasCode(property.part,"parent")) {
            const code = this.getCodeValue(property.part)
            if (code != undefined) {
              this.http.get(this.config.validateUrl() + '/CodeSystem/\$lookup?system='+this.data.system
                  + '&code='+ code).subscribe(
                  (result) => {
                    const parent = result as Parameters
                    if (parent.parameter !== undefined) {
                      for (let property of parent.parameter) {
                          if (property.name == 'display') {
                            if (property.valueString !== undefined) this.parent.push(property.valueString)
                          }
                      }
                    }
                  }
              )
            }
          }
        }
      }
    }
  }
}
