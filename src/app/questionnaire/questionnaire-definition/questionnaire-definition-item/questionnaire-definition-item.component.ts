import {Component, Input} from '@angular/core';
import {Questionnaire, QuestionnaireItem} from "fhir/r4";

@Component({
  selector: 'app-questionnaire-definition-item',
  standalone: true,
  imports: [],
  templateUrl: './questionnaire-definition-item.component.html',
  styleUrl: './questionnaire-definition-item.component.scss'
})
export class QuestionnaireDefinitionItemComponent {

  @Input()
  set node(item: QuestionnaireItem) {
    console.log(item)
    this.item = item;
  }

  item: QuestionnaireItem | undefined;
}
