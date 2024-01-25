import {Component, ElementRef, OnInit, signal, ViewChild} from '@angular/core';
import {ConfigService} from "../service/config.service";
import {client} from "fhirclient";
import {Bundle, Questionnaire} from "fhir/r4";
import {HttpClient} from "@angular/common/http";

declare var LForms: any;
@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit{
  editorOptions = {theme: 'vs-dark', language: 'json'};
  monacoEditor : any
  @ViewChild('myFormContainer', { static: false }) mydiv: ElementRef | undefined;
  data: any;
  questionnaire: Questionnaire | undefined;
  questionnaires: Questionnaire[] = [];
  constructor(private config: ConfigService,
              private http: HttpClient,
  ) {
  }
  ngOnInit(): void {

    this.http.get('https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/events/FHIR/R4/Questionnaire').subscribe((result) => {

          if (result !== undefined) {
            let bundle = result as Bundle
            if (bundle.entry !== undefined) {
              for(let entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType ==='Questionnaire') {
                  this.questionnaires.push(entry.resource)
                }
              }
            }
          }
        }
    )


  }

  checkType = signal<any | null>(null);
  markdown: string = "Copy FHIR Questionnaire json or XML here";

  

  onInit(editor) {
    this.monacoEditor = editor
  }

  applyStatement($event: any) {
    
  }

  applyQuestionnaire(questionnaire: Questionnaire) {
    this.data = JSON.stringify(questionnaire,undefined,2)
    const ctx = client({
      serverUrl: this.config.validateUrl +'/R4'
    });
    LForms.Util.setFHIRContext(ctx)

    let formDef = LForms.Util.convertFHIRQuestionnaireToLForms(questionnaire, "R4");
    var newFormData = (new LForms.LFormsData(formDef));
    try {
     // formDef = LForms.Util.mergeFHIRDataIntoLForms('QuestionnaireResponse', questionnaireResponse, newFormData, "R4");
      LForms.Util.addFormToPage(formDef, this.mydiv?.nativeElement, {prepopulate: false});
    } catch (e) {
      console.log(e)
      formDef = null;
    }


  }
}
