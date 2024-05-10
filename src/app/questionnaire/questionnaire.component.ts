import {AfterContentInit, Component, EventEmitter, OnInit, signal} from '@angular/core';
import {ConfigService} from "../config.service";

import {Bundle, Questionnaire, Parameters, QuestionnaireResponse} from "fhir/r4";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {TdDialogService} from "@covalent/core/dialogs";
import vitals from '../questionnaire/Questionnaire/vital-signs.json'
import permission from '../questionnaire/Questionnaire/permission.json'
import nominations from '../questionnaire/Questionnaire/prescription-nomination.json'
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {IMenuItem, IMenuTrigger, ITdDynamicMenuLinkClickEvent} from "@covalent/core/dynamic-menu";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {InfoDiaglogComponent} from "../info-diaglog/info-diaglog.component";

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements AfterContentInit,OnInit {


  openEHR = false;

  questionnaire: Questionnaire | undefined;
  questionnaires: Questionnaire[] = [];
  form: any;
  fileLoadedFile: EventEmitter<any> = new EventEmitter();
  file: any;
  patientId;
  readonly = true;

  currentTab = 0;


  markdown: string = "A useful tool for creating/editing Questionnires is <a href=\"https://lhcformbuilder.nlm.nih.gov/\" target='_blank'></a> [National Library of Medicine Form Builder](https://lhcformbuilder.nlm.nih.gov/). This server (`" + this.config.sdcServer() + "`) can be used with NLM Form Builder, use `Start with existing form`, then `Import from the FHIR Server` and add this server using `Add your FHIR server`. \n\n For detailed description on using Questionnaire see [FHIR Structured Data Capture](https://build.fhir.org/ig/HL7/sdc/). \n\n The component used for displaying the questionnaires is open source [LHC-Forms](https://lhncbc.github.io/lforms/)";


  patients: IMenuItem[] = [
    {
      id: '073eef49-81ee-4c2e-893b-bc2e4efd2630',
      text: 'KANFELD, RACHEL (MISS)',
      action: '073eef49-81ee-4c2e-893b-bc2e4efd2630'
    },
    {
      id: '0cd25141-2987-49d2-a038-2f8946e3b8b4',
      text: 'SMITH, FREDRICA (MRS)',
      action: '0cd25141-2987-49d2-a038-2f8946e3b8b4'
    },
    {
      id: '03c4e10a-95a2-4223-8c67-418c2c6953e1',
      text: 'ANDREWS, Andy (Mr)',
      action: '03c4e10a-95a2-4223-8c67-418c2c6953e1'
    },
    {
      id: '5bf5f51c-5394-4040-bb9d-0fd2b7823d1e',
      text: 'SMITH, Jane (Mrs)',
      action: '5bf5f51c-5394-4040-bb9d-0fd2b7823d1e'
    }
  ];

  constructor(private config: ConfigService,
              private http: HttpClient,
              private _dialogService: TdDialogService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog
  ) {
  }

  ngAfterContentInit(): void {

  }

  ngOnInit(): void {

    this.questionnaires.push(vitals as Questionnaire)
    this.questionnaires.push(nominations as Questionnaire)
    this.questionnaires.push(permission as Questionnaire)

    this.http.get(this.config.sdcServer() + '/Questionnaire?_count=100').subscribe((result) => {

          if (result !== undefined) {
            let bundle = result as Bundle
            if (bundle.entry !== undefined) {
              var questionnairesTemp: Questionnaire[] = [];
              for (let entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'Questionnaire') {
                  questionnairesTemp.push(entry.resource)
                }
              }
              this.questionnaires = questionnairesTemp
            }
          }
      this.route.queryParamMap.subscribe(params => {

        const urlParam = params.get('url');
        const patientId = params.get('id');
        if (urlParam !== null) {
          this.readonly = true;
        } else {
          this.readonly = false;
        }
        if (patientId !== undefined) this.patientId = patientId
        if (urlParam !== undefined && urlParam !== null) {
          var found = false
          for (let questionnaire of this.questionnaires) {
            if (decodeURI(urlParam as string) === questionnaire.url) {
              found = true
              this.applyQuestionnaire(questionnaire)
            }
          }
          if (!found) {
            this.http.get(this.config.sdcServer() + '/Questionnaire?url=' + decodeURI(urlParam as string)).subscribe((result) => {
                  if (result !== undefined) {
                    let bundle = result as Bundle
                    if (bundle.entry !== undefined && bundle.entry.length > 0) {
                      this.applyQuestionnaire(bundle.entry[0].resource as Questionnaire)
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


  selectQuestionnaire(questionniare: Questionnaire) {
    this.questionnaire = questionniare
    /*this.router.navigate(
        ['/questionnaire'],
        { queryParams: { url: questionniare.url,
          id : this.patientId} }
    );*/
  }
  populateClick(event: ITdDynamicMenuLinkClickEvent) {
    this.patientId = event.action
    if (this.questionnaire !== undefined) this.selectQuestionnaire(this.questionnaire)
  }
  applyQuestionnaire(questionnaire: Questionnaire) {
    this.questionnaire = questionnaire
  }
  setQuestionnaire(data : any) {
    if ((data as string).startsWith('{')) {
      this.questionnaire = JSON.parse(data)
    } else {
      if ((data as string).includes('<template')) {
        let headers = new HttpHeaders(
        );
        headers = headers.append('Content-Type', 'application/xml');
        headers = headers.append('Accept', 'application/json');
        this.http.post(this.config.openEHRServer()+'/Questionnaire/$convertTemplate', data,{ headers}).subscribe(result => {
                console.log(result)
                this.questionnaire= result as Questionnaire
                this.openEHR = true
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
      if ((data as string).includes('<archetype')) {
        let headers = new HttpHeaders(
        );
        headers = headers.append('Content-Type', 'application/xml');
        headers = headers.append('Accept', 'application/json');
        this.http.post(this.config.openEHRServer()+'/Questionnaire/$convertArchetype', data,{ headers}).subscribe(result => {
              console.log(result)
              this.questionnaire = result as Questionnaire
              this.openEHR = true
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


  openInfo() {
    let dialogRef = this.dialog.open(InfoDiaglogComponent, {
      width: '400px',
      data:  this.markdown
    });

  }


  selectFileEvent(file: File | FileList) {
    if (file instanceof File) {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      this.fileLoadedFile.subscribe((data: any) => {
           this.setQuestionnaire(data)
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



  getPatient() {
    //console.log(this.patientId)
    for (let patient of this.patients) {
    //  console.log(patient)
      if (this.patientId === patient.id) {
       // console.log(patient.text)
        return patient.text
      }
    }
    return undefined
  }

  changedTab(event: MatTabChangeEvent) {
      this.currentTab = event.index
  }

  updateQuestionnaire(questionnaire: any) {
      console.log(questionnaire)
    this.questionnaire = questionnaire
  }
}
