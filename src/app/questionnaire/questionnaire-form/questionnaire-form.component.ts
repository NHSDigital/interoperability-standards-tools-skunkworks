import {AfterViewChecked, AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Bundle, Parameters, Questionnaire, QuestionnaireResponse} from "fhir/r4";
import {MatDialog} from "@angular/material/dialog";
import {ConfigService} from "../../config.service";
import {HttpClient} from "@angular/common/http";
import {TdDialogService} from "@covalent/core/dialogs";
import Client from "fhirclient/lib/Client";
import {client} from "fhirclient";
import {MatButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {Subject} from "rxjs";


declare var LForms: any;

@Component({
  selector: 'app-questionnaire-form',
  standalone: true,
  imports: [
    MatMenu,
    MatMenuTrigger,
    MatButton,
    MatMenuItem,
    NgIf
  ],
  templateUrl: './questionnaire-form.component.html',
  styleUrl: './questionnaire-form.component.scss'
})
export class QuestionnaireFormComponent implements OnInit, AfterViewInit,AfterViewChecked {

  @Input()
  set patient(patientId: any | undefined) {
    this.patientId = patientId;
    this.runPopulate = true;
  }

  patientId;

  @Input()
  set formDefinition(questionnaire: Questionnaire | undefined) {
    this.questionnaire = questionnaire;
    this.runPopulate = true;
  }

  questionnaire: Questionnaire | undefined;

  form: any;

  runPopulate = false;

  ctx: Client | undefined

  @ViewChild('myFormContainer', {static: false}) mydiv: ElementRef | undefined;

  constructor(private sanitizer: DomSanitizer,
              public dialog: MatDialog,
              private config: ConfigService,
              private http: HttpClient,
              private _dialogService: TdDialogService,
  ) {
  }

  ngOnInit(): void {
    this.ctx = client({
      serverUrl: this.config.sdcServer()
    });
  }

  ngAfterViewInit(): void {
  //  console.log('ngAfterViewInit')

    if (this.runPopulate && this.mydiv !== undefined) {
      this.populateQuestionnare()
    }
  }

  ngAfterViewChecked(): void {
   // console.log('ngAfterViewChecked')

    if (this.runPopulate && this.mydiv !== undefined) {
      this.populateQuestionnare()
    }
  }


  downloadQuestionnaire(): SafeResourceUrl {
    const data = JSON.stringify(this.form, undefined, 2);
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });

    return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }


  downloadQuestionnaireResponse(): SafeResourceUrl | undefined {
    const div = this.mydiv?.nativeElement
    //  console.log(div)
    if (div !== undefined) {
      try {
        let results = LForms.Util.getFormFHIRData("QuestionnaireResponse", "R4", this.mydiv?.nativeElement)

        if (results.resourceType === "QuestionnaireResponse") {
          if (this.patientId !== undefined) {
            results.subject = {
              "reference": "Patient/" + this.patientId
            }
          }
          if (this.questionnaire !== undefined && this.questionnaire.id !== undefined) {
            results.questionnaire = "Questionnaire/" + this.questionnaire.id
          }
          const data = JSON.stringify(results, undefined, 2);
          const blob = new Blob([data], {
            type: 'application/octet-stream'
          });

          return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));

        }
      }
      catch(e:any){
        const result = e.Message;
      }
    }
    return undefined

  }

  populateQuestionnaireNoPopulation() {
    LForms.Util.setFHIRContext(this.ctx)
    let formDef = LForms.Util.convertFHIRQuestionnaireToLForms(this.questionnaire, "R4");
    var newFormData = (new LForms.LFormsData(formDef));
    try {
      const qr : QuestionnaireResponse = {
        resourceType: "QuestionnaireResponse", status: 'in-progress'

      }
      formDef = LForms.Util.mergeFHIRDataIntoLForms('QuestionnaireResponse', qr, newFormData, "R4");
      console.log(this.mydiv?.nativeElement)
      console.log(formDef)
      LForms.Util.addFormToPage(formDef, this.mydiv?.nativeElement, {prepopulate: false});
    } catch (e) {
      console.log(e)
      formDef = null;
    }
  }

  populateQuestionnare() {
    this.runPopulate = false
    console.log('Running populate')
    if (this.patientId == null) {
      this.populateQuestionnaireNoPopulation()
    } else {
      LForms.Util.setFHIRContext(this.ctx)
      var parameters: Parameters = {
        resourceType: "Parameters",
        parameter: []
      }
      parameters.parameter?.push({
        "name": "subject",
        "valueReference": {
          "reference": "Patient/" + this.patientId
        }
      })

      parameters.parameter?.push({
        "name": "questionnaire",
        "resource": this.questionnaire
      })
      this.http.post(this.config.sdcServer() + "/Questionnaire/$populate", parameters).subscribe(result => {
            if (result !== null) {
              let response = result as Parameters
              if (response.parameter !== undefined) {
                for (var param of response.parameter) {
                  if (param.name === 'response') {
                    let formDef = LForms.Util.convertFHIRQuestionnaireToLForms(this.questionnaire, "R4");
                    var newFormData = (new LForms.LFormsData(formDef));
                    try {
                      formDef = LForms.Util.mergeFHIRDataIntoLForms('QuestionnaireResponse', param.resource, newFormData, "R4");
                      LForms.Util.addFormToPage(formDef, this.mydiv?.nativeElement, {prepopulate: false});
                    } catch (e) {
                      console.log(e)
                      formDef = null;
                    }
                  }
                }
              }
            }
          },

          error => {
            console.log(JSON.stringify(error))
            this._dialogService.openAlert({
              title: 'Alert',
              disableClose: true,
              message:
                  this.config.getErrorMessage(error),
            });
            this.populateQuestionnaireNoPopulation()
          });

    }
  }

  submit() {

    if (this.questionnaire !== undefined && this.questionnaire.id !== undefined) {
      let results = LForms.Util.getFormFHIRData("QuestionnaireResponse", "R4", this.mydiv?.nativeElement)

      if (results.resourceType === "QuestionnaireResponse") {
        let questionnaireResponse: QuestionnaireResponse = results
        questionnaireResponse.subject = {
          reference: "Patient/" + this.patientId
        }
        questionnaireResponse.questionnaire = "Questionnaire/" + this.questionnaire.id
        this.http.post(this.config.sdcServer() + '/QuestionnaireResponse', questionnaireResponse).subscribe((result) => {
              // this.diaglogRef.close(condition);
              this._dialogService.openAlert({
                title: 'Info',
                disableClose: true,
                message:
                    'Form submitted ok',
              });
              if (result !== undefined) {
                let newQuestionnaireResponse = result as QuestionnaireResponse

                if (newQuestionnaireResponse.resourceType === 'QuestionnaireResponse') {
                  this.extract(newQuestionnaireResponse,undefined)
                }
              }

            },

            error => {
              console.log(JSON.stringify(error))
              this._dialogService.openAlert({
                title: 'Alert',
                disableClose: true,
                message:
                    this.config.getErrorMessage(error),
              });
            });
      }

    }
  }
  extract(newQuestionnaireResponse: QuestionnaireResponse, fileName : string | undefined)
  {
    this.http.post(this.config.sdcServer() + '/QuestionnaireResponse/$extract', newQuestionnaireResponse).subscribe(bundleResult => {

          if (bundleResult !== undefined) {
            let bundle = bundleResult as Bundle
            if (fileName !== undefined) {
              this.downloadFile(fileName,bundleResult)
            }
            if (bundle !== undefined && bundle.entry !== undefined) {

              this.http.post(this.config.sdcServer() + '/', bundle).subscribe((bundle) => {
                  },
                  error => {
                    this._dialogService.openAlert({
                      title: 'Alert',
                      disableClose: true,
                      message:
                          this.config.getErrorMessage(error),
                    });
                    console.log(JSON.stringify(error))
                  })
            }
          }

        },
        error => {
          console.log(JSON.stringify(newQuestionnaireResponse))
          this._dialogService.openAlert({
            title: 'Alert',
            disableClose: true,
            message:
                this.config.getErrorMessage(error),
          });
        })
  }
  downloadFile(fileName: string, results: Object) {
    const data = JSON.stringify(results, undefined, 2);
    const blob = new Blob([data], {
      type: 'application/json'
    });
    //const url = this.sanitizer.bypassSecurityTrustResourceUrl(
    let url = window.URL.createObjectURL(blob);
    // @ts-ignore
    window.open(url);
  }

  viewQuestionnaireResponse(fileName: string) {
    if (this.questionnaire !== undefined && this.questionnaire.id !== undefined) {
      let results = LForms.Util.getFormFHIRData("QuestionnaireResponse", "R4", this.mydiv?.nativeElement)

      if (results.resourceType === "QuestionnaireResponse") {
        let questionnaireResponse: QuestionnaireResponse = results
        questionnaireResponse.subject = {
          reference: "Patient/" + this.patientId
        }
        questionnaireResponse.questionnaire = "Questionnaire/" + this.questionnaire.id
        this.downloadFile(fileName, questionnaireResponse)
      }
    }
  }

  extractQuestionnaireResponse(fileName: string) {

    if (this.questionnaire !== undefined && this.questionnaire.id !== undefined) {
      let results = LForms.Util.getFormFHIRData("QuestionnaireResponse", "R4", this.mydiv?.nativeElement)

      if (results.resourceType === "QuestionnaireResponse") {
        let questionnaireResponse: QuestionnaireResponse = results
        questionnaireResponse.subject = {
          reference: "Patient/" + this.patientId
        }
        questionnaireResponse.questionnaire = "Questionnaire/" + this.questionnaire.id
        this.extract(questionnaireResponse, fileName)

      }
    }
  }





}
