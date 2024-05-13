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
import {MatTooltip} from "@angular/material/tooltip";
import {MatCard, MatCardContent, MatCardHeader} from "@angular/material/card";
import {LoadingMode, LoadingStrategy, LoadingType, TdLoadingService} from "@covalent/core/loading";


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
    QuestionnaireDefinitionItemComponent,
    MatTooltip,
    MatCard,
    MatCardContent,
    MatCardHeader
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

  @Input()
  readonly = false;

  @Output()
  questionnaireChanged = new EventEmitter();

  questionnaire: Questionnaire | undefined;


  constructor(

  ) {

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
