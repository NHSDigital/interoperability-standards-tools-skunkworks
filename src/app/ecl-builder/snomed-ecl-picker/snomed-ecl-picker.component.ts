import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption
} from "@angular/material/autocomplete";
import {MatFormField, MatHint, MatLabel} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatSelect} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {catchError, debounceTime, distinctUntilChanged, map, Observable, of, Subject, switchMap} from "rxjs";
import {Questionnaire, ValueSet, ValueSetExpansionContains} from "fhir/r4";
import {ConfigService} from "../../config.service";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import eclModel from "../../eclModel";
import {ConceptPopupComponent} from "../../concept/concept-popup/concept-popup.component";




@Component({
  selector: 'app-snomed-ecl-picker',
  standalone: true,
  imports: [
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatHint,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './snomed-ecl-picker.component.html',
  styleUrl: './snomed-ecl-picker.component.scss'
})
export class SnomedEclPickerComponent implements OnInit {

  types$: Observable<ValueSetExpansionContains[]> | undefined;
  private searchTypes = new Subject<string>();
  operator: string | undefined = " ";

  concept: any;
  andor: string | undefined = undefined

  @Input()
  set ecl(ecl : eclModel) {
    this.item = ecl
    this.concept = ecl.concept
    this.operator = ecl.operator
    this.andor = ecl.andor
  }
  @Input()
  count = 1

  item : eclModel = {
    position: 0,
    action: undefined,
    operator: undefined,
    concept: undefined,
    andor: undefined
  }

  @Output()
  eclAdded = new EventEmitter();


  constructor(private config: ConfigService,
              private http: HttpClient,
              public dialog: MatDialog
  ) {
  }

  selectedType($event: MatAutocompleteSelectedEvent) {
    console.log($event)
  }

  searchType(term: string) {

    if (term.length > 3) {
      this.searchTypes.next(term);
    }
  }

  searchConcepts(term: string): Observable<ValueSet> {
    const url = this.config.validateUrl();
    return this.http.get<ValueSet>(url +
        `/ValueSet/$expandSCT?filter=${term}&includeDesignations=true`);
  }

  ngOnInit(): void {
    this.addTypeHandler()
  }

  addTypeHandler()  {
    this.types$ = this.searchTypes.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
              return this.searchConcepts(term );
            }
        ),
        map(resource    => {
              return this.getContainsExpansion(resource);
            }

        ),
        catchError(
            this.handleError('getPatients', []))
    );

  }

  handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log('term search ERROR');
      /*
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
      */
      this.addTypeHandler()

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  getContainsExpansion(resource: any): ValueSetExpansionContains[] {
    const valueSet = resource as ValueSet;
    const contains: ValueSetExpansionContains[] = [];
    if (valueSet !== undefined && valueSet.expansion !== undefined && valueSet.expansion.contains !== undefined) {
      for (const concept of valueSet.expansion.contains) {
        contains.push(concept);
      }
    }
    return contains;
  }

  getDisplay(concept: ValueSetExpansionContains): string {
    if (concept == undefined) return ''

    var display = concept.display
    if (concept.designation !== undefined) {
      for (let designation of concept.designation) {
        if (designation.use !== undefined && designation.use.code === '900000000000003001') {
          if (designation.value !== undefined) display = designation.value
        }
      }
    }
    return <string> display  + ' | ' + concept.code;
  }

  selected($event: any) {
    console.log($event)
    this.item.action = "update"
    if (this.operator !== undefined) {
      this.item.operator = this.operator

    }
    if (this.concept !== undefined) {
      this.item.concept = this.concept
    }
    if (this.andor !== undefined) {
      this.item.andor = this.andor
    }
    this.eclAdded.emit(this.item)
  }


  add() {
    let ecl: eclModel = {
      concept: undefined, operator: undefined,
      action: "add",
      position: this.item.position,
      andor: undefined
    }
    this.eclAdded.emit(ecl)
  }

  remove() {
    let ecl: eclModel = {
      concept: undefined, operator: undefined,
      action: "remove",
      position: this.item.position,
      andor: undefined
    }
    this.eclAdded.emit(ecl)
  }

  showConcept() {

    this.dialog.open(ConceptPopupComponent, {
      data: {
        system : 'http://snomed.info/sct',
        code : this.concept.code,
        display: this.concept.display
      }
    });
  }
}
