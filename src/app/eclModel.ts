import {ValueSetExpansionContains} from "fhir/r4";

export default class eclModel {
    action: string | undefined;
    position: number = 0;
    operator: string | undefined;
    concept: ValueSetExpansionContains | undefined
    andor: string | undefined;
}
