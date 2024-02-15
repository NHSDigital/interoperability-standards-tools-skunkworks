import {AfterContentInit, Component, ElementRef, EventEmitter, OnInit, signal, ViewChild} from '@angular/core';
import {ConfigService} from "../config.service";
import {client} from "fhirclient";
import {Bundle, Questionnaire} from "fhir/r4";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import Client from "fhirclient/lib/Client";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {TdDialogService} from "@covalent/core/dialogs";
import vitals from '../questionnaire/Questionnaire/vital-signs.json'
import permission from '../questionnaire/Questionnaire/permission.json'
import nominations from '../questionnaire/Questionnaire/prescription-nomination.json'
import {ActivatedRoute, Router} from "@angular/router";
import {InfoDiaglogComponent} from "../info-diaglog/info-diaglog.component";
import {MatDialog} from "@angular/material/dialog";

declare var LForms: any;
@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements AfterContentInit,OnInit {
  editorOptions = {theme: 'vs-dark', language: 'json'};
  monacoEditor: any

  openEHR = false;
  @ViewChild('myFormContainer', {static: false}) mydiv: ElementRef | undefined;
  data: any;
  ctx: Client | undefined
  questionnaire: Questionnaire | undefined;
  questionnaires: Questionnaire[] = [];
  form: any;
  fileLoadedFile: EventEmitter<any> = new EventEmitter();
  markdown: string = "A tool for creating Questionnires is [National Library of Medicine Form Builder](https://lhcformbuilder.nlm.nih.gov/) and the address of this FHIR server is `" + this.config.sdcServer() + "`. For detailed description on using Questionnaire see [FHIR Structured Data Capture](https://build.fhir.org/ig/HL7/sdc/)";
  file: any;


  constructor(private config: ConfigService,
              private http: HttpClient,
              private sanitizer: DomSanitizer,
              private _dialogService: TdDialogService,
              private route: ActivatedRoute,
              public dialog: MatDialog
  ) {
  }

  ngAfterContentInit(): void {


  }

  ngOnInit(): void {
    this.ctx = client({
      serverUrl: this.config.sdcServer()
    });
    this.questionnaires.push(vitals as Questionnaire)
    this.questionnaires.push(nominations as Questionnaire)
    this.questionnaires.push(permission as Questionnaire)


    this.http.get(this.config.sdcServer() + '/Questionnaire').subscribe((result) => {

          if (result !== undefined) {
            let bundle = result as Bundle
            if (bundle.entry !== undefined) {
              for (let entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'Questionnaire') {
                  this.questionnaires.push(entry.resource)
                }
              }
            }
          }
      this.route.queryParamMap.subscribe(params => {
        const urlParam = params.get('url');

        if (urlParam !== undefined && urlParam !== null) {
          var found = false
          for (let questionnaire of this.questionnaires) {
            if (decodeURI(urlParam as string) === questionnaire.url) {
              found = true
              console.log(questionnaire)
              this.data = JSON.stringify(questionnaire, undefined, 2)
              this.applyQuestionnaire(questionnaire)
            }
          }
          if (!found) {
            this.http.get(this.config.sdcServer() + '/Questionnaire?url=' + decodeURI(urlParam as string)).subscribe((result) => {
                  if (result !== undefined) {
                    let bundle = result as Bundle
                    if (bundle.entry !== undefined && bundle.entry.length > 0) {
                      if (this.data !== undefined) this.applyQuestionnaire(bundle.entry[0].resource as Questionnaire)
                    }
                  }
                }
            )
          }
        }
      })


        }
    )


  }

  checkType = signal<any | null>(null);


  onInit(editor) {
    this.monacoEditor = editor

  }

  applyStatement($event: any) {

  }

  applyQuestionnaire(questionnaire: Questionnaire) {
    this.data = JSON.stringify(questionnaire, undefined, 2)
    this.refresh()
  }

  refresh() {
    if ((this.data as string).startsWith('{')) {
      this.form = JSON.parse(this.data)
      this.populateQuestionnare()
    } else {
      if ((this.data as string).includes('<template')) {
        let headers = new HttpHeaders(
        );
        headers = headers.append('Content-Type', 'application/xml');
        headers = headers.append('Accept', 'application/json');
        this.http.post(this.config.openEHRServer()+'/Questionnaire/$convertTemplate', this.data,{ headers}).subscribe(result => {
              console.log(result)

                this.form = result
                this.openEHR = true
                this.populateQuestionnare()

            },
            error => {

              console.log(JSON.stringify(error))
              this._dialogService.openAlert({
                title: 'Alert',
                disableClose: true,
                message:
                    this.config.getErrorMessage(error),
              });
            })
      } else
      if ((this.data as string).includes('<archetype')) {
        let headers = new HttpHeaders(
        );
        headers = headers.append('Content-Type', 'application/xml');
        headers = headers.append('Accept', 'application/json');
        this.http.post(this.config.openEHRServer()+'/Questionnaire/$convertArchetype', this.data,{ headers}).subscribe(result => {
              console.log(result)
              this.form = result
              this.openEHR = true
              this.populateQuestionnare()
            },
            error => {

              console.log(JSON.stringify(error))
              this._dialogService.openAlert({
                title: 'Alert',
                disableClose: true,
                message:
                    this.config.getErrorMessage(error),
              });
            })
      }
    }



  }

  populateQuestionnare() {
    LForms.Util.setFHIRContext(this.ctx)

    let formDef = LForms.Util.convertFHIRQuestionnaireToLForms(this.form, "R4");
    var newFormData = (new LForms.LFormsData(formDef));
    try {
      // formDef = LForms.Util.mergeFHIRDataIntoLForms('QuestionnaireResponse', questionnaireResponse, newFormData, "R4");
      LForms.Util.addFormToPage(formDef, this.mydiv?.nativeElement, {prepopulate: false});
    } catch (e) {
      console.log(e)
      formDef = null;
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
    let results =  LForms.Util.getFormFHIRData("QuestionnaireResponse", "R4", this.mydiv?.nativeElement)

    if (results.resourceType === "QuestionnaireResponse") {
      const data = JSON.stringify(results, undefined, 2);
      const blob = new Blob([data], {
        type: 'application/octet-stream'
      });
      return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    }
    return undefined
  }

  selectFileEvent(file: File | FileList) {
    if (file instanceof File) {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      this.fileLoadedFile.subscribe((data: any) => {
            this.data = data
          }
      );
      const me = this;
      reader.onload = (event: Event) => {
        if (reader.result instanceof ArrayBuffer) {
          ///console.log('array buffer');

          // @ts-ignore
          me.fileLoaded.emit(String.fromCharCode.apply(null, reader.result));
        } else {
          // console.log('not a buffer');
          if (reader.result !== null) me.fileLoadedFile.emit(reader.result);
        }
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
        me._dialogService.openAlert({
          title: 'Alert',
          disableClose: true,
          message:
              'Failed to process file. Try smaller example?',
        });
      };
    }
  }

  openInfo() {
    let dialogRef = this.dialog.open(InfoDiaglogComponent, {
      width: '400px',
      data:  this.markdown
    });

  }

  showFHIR() {
    this.data = JSON.stringify(this.form, undefined, 2)
  }
}
