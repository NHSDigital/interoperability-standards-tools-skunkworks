import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {CovalentDynamicFormsModule} from "@covalent/dynamic-forms";
import {CovalentLayoutModule} from "@covalent/core/layout";
import { CovalentMessageModule } from '@covalent/core/message';
import {CovalentMarkdownModule} from "@covalent/markdown";
import {CovalentHighlightModule} from "@covalent/highlight";
import { CovalentDialogsModule } from '@covalent/core/dialogs';
import {MatCardModule} from "@angular/material/card";
import {MatTableModule} from "@angular/material/table";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ValidateComponent} from "./validate/validate.component";
import {CovalentJsonFormatterModule} from "@covalent/core/json-formatter";
import {MatTabsModule} from "@angular/material/tabs";
import {MatSortModule} from "@angular/material/sort";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatIconModule} from "@angular/material/icon";
import { TestingMainComponent } from './testing-main/testing-main.component';
import {MonacoEditorModule} from "ngx-monaco-editor-v2";
import {CovalentDynamicMenuModule} from "@covalent/core/dynamic-menu";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTooltipModule} from "@angular/material/tooltip";
import {CovalentLoadingModule} from "@covalent/core/loading";
import { InformationComponent } from './information/information.component';
import {MatListModule} from "@angular/material/list";
import {CovalentFileModule} from "@covalent/core/file";
import { ResourceTestComponent } from './validate/resource-test/resource-test.component';
import {MatExpansionModule} from "@angular/material/expansion";
import {A11yModule} from "@angular/cdk/a11y";
import {MatRadioModule} from "@angular/material/radio";
import {ApiDocumentationComponent} from "./api-documentation/api-documentation.component";
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import {MatMenuModule} from "@angular/material/menu";
import { DocumentComponent } from './document/document.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import { InfoDiaglogComponent } from './info-diaglog/info-diaglog.component';
import {MatDialogModule} from "@angular/material/dialog";
import { MarkdownComponent } from './markdown/markdown.component';
import {CovalentFlavoredMarkdownModule} from "@covalent/flavored-markdown";
import { DocumentSectionComponent } from './document/document-section/document-section.component';
import {MatChipsModule} from "@angular/material/chips";
import {ResourceDialogComponent} from "./resource-dialog/resource-dialog.component";
import {QuestionnaireFormComponent} from "./questionnaire/questionnaire-form/questionnaire-form.component";
import {QuestionnaireEditComponent} from "./questionnaire/questionnaire-edit/questionnaire-edit.component";
import {
    QuestionnaireDefinitionComponent
} from "./questionnaire/questionnaire-definition/questionnaire-definition.component";
import {MatTreeModule} from "@angular/material/tree";
import {MatToolbar} from "@angular/material/toolbar";
import {
    QuestionnaireInformationComponent
} from "./questionnaire/questionnaire-information/questionnaire-information.component";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MAT_DATE_LOCALE, MatNativeDateModule} from "@angular/material/core";
import {DatePipe} from "@angular/common";


@NgModule({
  declarations: [
    AppComponent,
    ValidateComponent,
    TestingMainComponent,
    InformationComponent,
    ResourceTestComponent,
    ApiDocumentationComponent,
    QuestionnaireComponent,
    DocumentComponent,
    InfoDiaglogComponent,
    MarkdownComponent,
    DocumentSectionComponent,
      ResourceDialogComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        CovalentLayoutModule,
        FormsModule,

        // (optional) Additional Covalent Modules imports
        CovalentDynamicFormsModule,
        CovalentHighlightModule,
        CovalentMarkdownModule,
        CovalentMessageModule,
        CovalentDialogsModule,
        CovalentJsonFormatterModule,
        CovalentLoadingModule,
        CovalentDynamicFormsModule,
        CovalentDynamicMenuModule,
        CovalentFileModule,

        MatCardModule,
        MatFormFieldModule,
        MatTableModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatTabsModule,
        MatSortModule,
        MatGridListModule,
        MatIconModule,
        MatTreeModule,
        MonacoEditorModule.forRoot(),
        MatCheckboxModule,
        MatTooltipModule,
        MatListModule,
        MatExpansionModule,
        A11yModule,
        MatRadioModule,
        MatMenuModule,
        MatSidenavModule,
        MatDialogModule,
        MatDatepickerModule,
        MatNativeDateModule,
        CovalentFlavoredMarkdownModule,
        MatChipsModule,
        QuestionnaireFormComponent,
        QuestionnaireEditComponent,
        QuestionnaireDefinitionComponent,
        MatToolbar,
        QuestionnaireInformationComponent
    ],
    providers: [
        DatePipe,
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
