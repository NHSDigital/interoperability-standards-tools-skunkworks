import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {MonacoEditorModule} from "ngx-monaco-editor-v2";
import {Questionnaire} from "fhir/r4";
import {MatButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ConfigService} from "../../config.service";
import {HttpClient} from "@angular/common/http";
import {TdDialogService} from "@covalent/core/dialogs";
import {MatDialog} from "@angular/material/dialog";
import {InfoDiaglogComponent} from "../../info-diaglog/info-diaglog.component";

@Component({
  selector: 'app-questionnaire-edit',
  standalone: true,
  imports: [
    MonacoEditorModule,
    MatButton,
    MatTooltip,
    NgIf,
    FormsModule
  ],
  templateUrl: './questionnaire-edit.component.html',
  styleUrl: './questionnaire-edit.component.scss'
})
export class QuestionnaireEditComponent {
  editorOptions = {theme: 'vs-dark', language: 'json'};

  monacoEditor: any

  @Input()
  set formDefinition(questionnaire: Questionnaire | undefined) {
    this.data = JSON.stringify(questionnaire, undefined, 2)
  }
  @Input()
  readonly = false;

  @Output()
  questionnaireChanged = new EventEmitter();

  checkType = signal<any | null>(null);

  data: any;


  constructor(private config: ConfigService,
              private http: HttpClient,
              public dialog: MatDialog
  ) {
  }

  onInit(editor) {
    console.log('On Init Called')
    this.monacoEditor = editor
  }

  openAlert(title : string, information : string) {
    let dialogRef = this.dialog.open(InfoDiaglogComponent, {
      width: '400px',
      data:  {
        information: information,
        title: title
      }
    });

  }

  save() {
    if ((this.data as string).startsWith('{')) {
      var newForm = JSON.parse(this.data)
      if (newForm !== undefined) {
        if (newForm.id !== undefined) {
          this.http.put(this.config.sdcServer() + '/Questionnaire/' + newForm.id, newForm).subscribe((bundle) => {

                if (bundle !== undefined) {
                  this.updateQuestionnaire(bundle as Questionnaire)
                }
              },
              error => {
                this.openAlert('Alert',this.config.getErrorMessage(error) )
                console.log(JSON.stringify(error))
              })
        } else {
          this.http.post(this.config.sdcServer() + '/Questionnaire', newForm).subscribe((bundle) => {

                if (bundle !== undefined) {
                  this.updateQuestionnaire(bundle as Questionnaire)
                }
              },
              error => {
                this.openAlert('Alert',this.config.getErrorMessage(error) )
                console.log(JSON.stringify(error))
              })
        }
      } else {
        this.openAlert('Alert','No id present in the questionnaire. Unable to save' )

      }
    } else {
      this.openAlert('Alert','Unable to process form' )

    }
  }

  updateQuestionnaire(questionnaire : Questionnaire) {
    this.openAlert('Information','Saved. New version = ' + questionnaire.meta?.versionId )
    this.data = JSON.stringify(questionnaire, undefined, 2)
    this.questionnaireChanged.emit(questionnaire)
  }

}
