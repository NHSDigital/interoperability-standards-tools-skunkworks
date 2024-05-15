import {Component, OnInit, ViewChild} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader} from "@angular/material/card";
import {MatFormField, MatHint, MatLabel} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {MatButton, MatIconButton} from "@angular/material/button";
import {ConceptDisplayComponent} from "../concept/concept-display/concept-display.component";
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatIcon} from "@angular/material/icon";
import {MatPaginator} from "@angular/material/paginator";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {Coding, QuestionnaireItemAnswerOption, ValueSet, ValueSetExpansionContains} from "fhir/r4";
import {ConfigService} from "../config.service";
import {HttpClient} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {InfoDiaglogComponent} from "../info-diaglog/info-diaglog.component";
import {MatDialog} from "@angular/material/dialog";
import {
    MatAutocomplete,
    MatAutocompleteTrigger,

} from "@angular/material/autocomplete";

import {MatSelectModule} from "@angular/material/select";
import {SnomedEclPickerComponent} from "./snomed-ecl-picker/snomed-ecl-picker.component";
import eclModel from "../eclModel"

@Component({
  selector: 'app-ecl-builder',
  standalone: true,
    imports: [
        MatCard,
        MatLabel,
        MatCardContent,
        MatCardHeader,
        MatFormField,
        MatInputModule,
        MatSelectModule,
        CdkTextareaAutosize,
        MatButton,
        ConceptDisplayComponent,
        MatCell,
        MatCellDef,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderRow,
        MatHeaderRowDef,
        MatIcon,
        MatPaginator,
        MatRow,
        MatHint,
        MatRowDef,
        MatTableModule,
        NgIf,
        FormsModule,
        MatAutocomplete,
        AsyncPipe,
        MatAutocompleteTrigger,
        NgForOf,
        MatIconButton,
        SnomedEclPickerComponent
    ],
  templateUrl: './ecl-builder.component.html',
  styleUrl: './ecl-builder.component.scss'
})
export class EclBuilderComponent  {

    displayedColumns: string[] = ['code', 'display', ];

    statements: eclModel[] = [
        {
            position: 0,
            action: undefined,
            operator: undefined,
            concept: undefined,
            andor: undefined
        }
    ]

    dataSource: MatTableDataSource<Coding> = new MatTableDataSource<Coding>([]);

    @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
    ecl: any;
    answerValueSetURI: string | undefined


    constructor(private config: ConfigService,
                private http: HttpClient,
                public dialog: MatDialog
    ) {
    }
    execute() {
        this.dataSource = new MatTableDataSource<Coding>([]);
        if (this.ecl !== undefined) {
            var worker = ''
            // remove comments
            let ecls = this.ecl.split('|')
            var index = 0
            ecls.forEach(value => {
                if ((index % 2) == 0) {
                    worker += value.replace(' ','')
                }
                index++
            })

            console.log(worker)
            this.answerValueSetURI = 'http://snomed.info/sct/900000000000207008?fhir_vs=ecl%2F'+encodeURI(worker)

            this.http.get(this.config.sdcServer() + '/ValueSet/\$expand?url=' + this.answerValueSetURI).subscribe((result) => {
                    const valueSet = result as ValueSet
                    if (valueSet.resourceType === 'ValueSet') {

                        if (valueSet.expansion !== undefined && valueSet.expansion.contains !== undefined && valueSet.expansion.contains.length > 0) {
                            var answers: Coding[] = []
                            for (let entry of valueSet.expansion.contains) {
                                const answer: Coding = {
                                    code: entry.code,
                                    system: entry.system,
                                    display: entry.display
                                }
                                answers.push(answer)
                            }

                            this.dataSource = new MatTableDataSource<Coding>(answers)
                            if (this.paginator !== undefined) this.dataSource.paginator = this.paginator
                        }
                    }
                },
                (error) => {
                    console.log(error)
                    this.openAlert('Alert',this.config.getErrorMessage(error) )
                })
        }
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


    addEcl(ecl: eclModel) {
        console.log(ecl)
        if (ecl.action !== undefined) {
            var index = 0
            var newEcl : eclModel[] = []
            for (let eclStatement of this.statements) {

                if (eclStatement.position === ecl.position) {
                    if (ecl.action === 'update' ) {
                           eclStatement.operator = ecl.operator
                           eclStatement.concept = ecl.concept
                            eclStatement.position = index

                        newEcl.push(eclStatement)
                        index++
                    } else if (ecl.action === 'remove') {
                        // leave item out of the new list
                    } else if (ecl.action === 'add') {
                        newEcl.push(eclStatement)
                        index++
                    }
                } else {
                    newEcl.push(eclStatement)
                    index++
                }
            }
            if (ecl.action === 'add') {
                newEcl.push( {
                    position: index,
                    action: undefined,
                    operator: undefined,
                    concept: undefined,
                    andor: 'AND'
                })
            }
            console.log(newEcl)
            this.statements = newEcl
            var eclStatement = ''
            for (let statement of this.statements) {
                if (statement.andor !== undefined) {
                    eclStatement += statement.andor + ' '
                }
                if (statement.operator !== undefined) {
                    eclStatement += statement.operator + ' '
                }
                if (statement.concept !== undefined) {
                    if (statement.concept.code !== undefined) {
                        eclStatement += statement.concept.code + ' '
                    }
                    if (statement.concept.display !== undefined) {
                        eclStatement += '|' + statement.concept.display + '| '
                    }
                }
            }
            this.ecl = eclStatement
        }

    }
}
