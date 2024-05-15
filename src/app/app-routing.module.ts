import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ValidateComponent} from "./validate/validate.component";
import {TestingMainComponent} from "./testing-main/testing-main.component";
import {InformationComponent} from "./information/information.component";
import {ApiDocumentationComponent} from "./api-documentation/api-documentation.component";
import {QuestionnaireComponent} from "./questionnaire/questionnaire.component";
import {DocumentComponent} from "./document/document.component";
import {MarkdownComponent} from "./markdown/markdown.component";
import {EclBuilderComponent} from "./ecl-builder/ecl-builder.component";

const routes: Routes = [ {

  path: '', component: TestingMainComponent,
  children : [
        { path: '', component: ValidateComponent},
        { path: 'information', component: InformationComponent},
        { path: 'api', component: ApiDocumentationComponent},
        { path: 'questionnaire', component: QuestionnaireComponent},
        { path: 'document', component: DocumentComponent},
        { path: 'ecl', component: EclBuilderComponent},
        { path: 'markdown', component: MarkdownComponent }
      ]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
