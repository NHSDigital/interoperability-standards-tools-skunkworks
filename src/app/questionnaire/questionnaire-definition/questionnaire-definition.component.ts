import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Questionnaire, QuestionnaireItem} from "fhir/r4";
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule} from '@angular/material/tree';

import {FlatTreeControl} from '@angular/cdk/tree';
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {ConfigService} from "../../config.service";
import {MatDialog} from "@angular/material/dialog";
import {InfoDiaglogComponent} from "../../info-diaglog/info-diaglog.component";
import {
  QuestionnaireDefinitionItemComponent
} from "./questionnaire-definition-item/questionnaire-definition-item.component";


/** Flat node with expandable and level information */
interface ItemFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  data: QuestionnaireItem;
}


@Component({
  selector: 'app-questionnaire-definition',
  standalone: true,
  imports: [
    MatTreeModule,
    MatIcon,
    MatIconButton,
    MatButton,
    QuestionnaireDefinitionItemComponent
  ],
  templateUrl: './questionnaire-definition.component.html',
  styleUrl: './questionnaire-definition.component.scss'
})
export class QuestionnaireDefinitionComponent {
  @Input()
  set formDefinition(questionnaire: Questionnaire | undefined) {
    this.questionnaire = questionnaire;
    if (this.questionnaire?.item && this.questionnaire.item.length > 0) {
      this.dataSource.data = this.questionnaire?.item;
    }
  }
  @Output()
  questionnaireChanged = new EventEmitter();

  questionnaire: Questionnaire | undefined;

  markdown: string = "A useful tool for creating/editing Questionnires is [National Library of Medicine Form Builder](https://lhcformbuilder.nlm.nih.gov/). This server (`" + this.config.sdcServer() + "`) can be used with NLM Form Builder, use `Start with existing form`, then `Import from the FHIR Server` and add this server using `Add your FHIR server`. \n\n For detailed description on using Questionnaire see [FHIR Structured Data Capture](https://build.fhir.org/ig/HL7/sdc/). \n\n The component used for displaying the questionnaires is open source [LHC-Forms](https://lhncbc.github.io/lforms/)";
  constructor(

      private config: ConfigService,
              public dialog: MatDialog
  ) {

  }

  openInfo() {
    let dialogRef = this.dialog.open(InfoDiaglogComponent, {
      width: '400px',
      data:  this.markdown
    });

  }

  private _transformer = (node: QuestionnaireItem, level: number) : ItemFlatNode => {
    return {
      expandable: !!node.item && node.item.length > 0,
      name: (node.text !== undefined) ? node.text : 'Missing text',
      level: level,
      data: node
    };
  };

  treeControl = new FlatTreeControl<ItemFlatNode>(
      node => node.level,
      node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
      this._transformer,
      node => node.level,
      node => node.expandable,
      node => node.item
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: ItemFlatNode) => node.expandable;

}
