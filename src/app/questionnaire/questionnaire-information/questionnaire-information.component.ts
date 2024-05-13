import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {Coding, Questionnaire, QuestionnaireItemAnswerOption, UsageContext} from "fhir/r4";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {
  CovalentDynamicFormsModule,
  ITdDynamicElementConfig,
  TdDynamicElement,
  TdDynamicType
} from "@covalent/dynamic-forms";
import {
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatIcon} from "@angular/material/icon";
import {MatAnchor, MatIconButton} from "@angular/material/button";
import {MatPaginator} from "@angular/material/paginator";
import {ConceptPopupComponent} from "../../concept/concept-popup/concept-popup.component";
import {MatDialog} from "@angular/material/dialog";
import {MatCard, MatCardContent} from "@angular/material/card";
import {CovalentMarkdownModule} from "@covalent/markdown";
import {ConceptDisplayComponent} from "../../concept/concept-display/concept-display.component";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {ConfigService} from "../../config.service";
import {HttpClient} from "@angular/common/http";
import {TdDialogService} from "@covalent/core/dialogs";
import {TdLoadingService} from "@covalent/core/loading";

@Component({
  selector: 'app-questionnaire-information',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    MatFormFieldModule,
    MatInput,
    CovalentDynamicFormsModule,
    MatTableModule,
    CommonModule,
    MatIcon,
    MatIconButton,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatTable,
    MatCardContent,
    MatCard,
    CovalentMarkdownModule,
    ConceptDisplayComponent,
    MatAnchor
  ],
  templateUrl: './questionnaire-information.component.html',
  styleUrl: './questionnaire-information.component.scss'
})
export class QuestionnaireInformationComponent {
  @Input()
  set formDefinition(questionnaire: Questionnaire | undefined) {
    this.questionnaire = questionnaire;
    this.populateForm()
  }
  @Input()
  readonly = false;
  @Output()
  questionnaireChanged = new EventEmitter();

  questionnaire: Questionnaire | undefined;

  textElementsTitle: ITdDynamicElementConfig[] = [
    {
      name: 'Title',
      hint: 'Name for this questionnaire (human friendly)',
      type: TdDynamicElement.Input,
      required: false,
      flex: 50,
    },
    {
      name: 'Publisher',
      hint: 'Name of the publisher (organization or individual)',
      type: TdDynamicElement.Input,
      required: false,
      flex: 50,
    },
    {
      name: 'Status',
      placeholder: 'Input Placeholder',
      type: TdDynamicElement.Select,
      selections: ['draft', 'active', 'retired', 'unknown'],
      flex: 20,
    },
    {
      name: 'Version',
      hint: 'Business version',
      type: TdDynamicElement.Input,
      required: false,
      flex: 30,
    },
    {
      name: 'Date',
      hint: 'Date last changed',
      type: TdDynamicElement.Datepicker,
      required: false,
      flex: 25,
    },
    {
      name: 'Approved',
      hint: 'Date approved by publisher',
      type: TdDynamicElement.Datepicker,
      required: false,
      flex: 25,
    },
    {
      name: 'Url',
      hint: 'Canonical identifier for this questionnaire',
      type: TdDynamicElement.Input,
      required: false,
      flex: 50,
    },
    {
      name: 'Derived from',
      hint: 'Instantiates protocol or definition',
      type: TdDynamicElement.Input,
      required: false,
      flex: 50,
    }
  ];
  /*
  textElementsBody: ITdDynamicElementConfig[] = [
    {
      name: 'Description',
      hint: 'Natural language description of the questionnaire',
      type: TdDynamicElement.Textarea,
      required: false,
    },
    {
      name: 'Purpose',
      hint: 'Why this questionnaire is defined',
      type: TdDynamicElement.Textarea,
      required: false,
    }
  ];
  */

  displayedColumnsUsage: string[] = ['context','code'];


  dataSourceUsage: MatTableDataSource<UsageContext> = new MatTableDataSource<UsageContext>([])
  constructor(private sanitizer: DomSanitizer,
      public dialog: MatDialog
  ) {
  }



  private populateForm() {
    var textElements: ITdDynamicElementConfig[] = []
    for (let element of this.textElementsTitle) {
      element.default = undefined
      textElements.push(element)
    }

    textElements[0].default = this.questionnaire?.title
    textElements[1].default = this.questionnaire?.publisher
    textElements[2].default = this.questionnaire?.status
    textElements[3].default = this.questionnaire?.version
    textElements[4].default = this.questionnaire?.date

    textElements[6].default = this.questionnaire?.url
    if (this.questionnaire?.derivedFrom !== undefined) {
      for (let derived of this.questionnaire.derivedFrom) {
        if (textElements[7].default == undefined) {
          textElements[7].default = derived
        } else {
          textElements[7].default += '\n'+derived
        }
      }
    }

    this.textElementsTitle = textElements


    if (this.questionnaire !== undefined && this.questionnaire.useContext !== undefined && this.questionnaire.useContext.length >0) {
      this.dataSourceUsage = new MatTableDataSource<UsageContext>(this.questionnaire.useContext)
    } else {
      this.dataSourceUsage = new MatTableDataSource<UsageContext>([])
    }

/*
    textElements = []
    for (let element of this.textElementsBody) {
      // element.disabled = true
      textElements.push(element)
    }
    textElements[0].default = this.questionnaire?.description
    textElements[1].default = this.questionnaire?.purpose

    this.textElementsBody = textElements

 */
  }

  downloadQuestionnaire(): SafeResourceUrl {
    const data = JSON.stringify(this.questionnaire, undefined, 2);
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });

    return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }



}
