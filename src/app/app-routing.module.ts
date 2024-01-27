import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ValidateComponent} from "./validate/validate.component";
import {TestingMainComponent} from "./testing-main/testing-main.component";
import {InformationComponent} from "./information/information.component";
import {ApiDocumentationComponent} from "./api-documentation/api-documentation.component";
import {QuestionnaireComponent} from "./questionnaire/questionnaire.component";
import {DocumentComponent} from "./document/document.component";

const routes: Routes = [ {

  path: '', component: TestingMainComponent,
  children : [
        { path: '', component: ValidateComponent},
        { path: 'information', component: InformationComponent},
        { path: 'api', component: ApiDocumentationComponent},
         { path: 'questionnaire', component: QuestionnaireComponent},
        { path: 'document', component: DocumentComponent}
      ]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
