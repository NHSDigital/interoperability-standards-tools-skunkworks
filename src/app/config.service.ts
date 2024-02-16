import { Injectable } from '@angular/core';
import {DatePipe} from "@angular/common";
import {environment} from "../environments/environment";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {


  validateUrl() : string {
//    console.log(window.location.href)

    let href = window.location.href
    // remove the route from the href
    href = href.replace(this.router.url,"")
    console.log(href)
    console.log(window.location.origin)
    console.log(window.location.host)
    href = href.replace(window.location.origin,"")
    console.log(href)
//    console.log(this.router.url)
//    console.log(href)
    if (environment.isDocker ) {

       if (href.endsWith("/")) {
         return href + "FHIR/R4"
       } else {
         return href + "/FHIR/R4"
       }
     }
      return environment.validateUrl
  }

  sdcServer() : string {
    return environment.sdcServer
  }

  openEHRServer() : string {
    return environment.openEHRServer
  }

  getErrorMessage(error: any) {
    var errorMsg = ''
    if (error.error !== undefined){

      if (error.error.issue !== undefined) {
        errorMsg += ' ' + error.error.issue[0].diagnostics
      }
    }
    errorMsg += '\n\n ' + error.message
    return errorMsg;
  }

  getFHIRDateString(date : Date) : string {
    var datePipe = new DatePipe('en-GB');
    //2023-05-12T13:22:31.964Z
    var utc = datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss.SSSZZZZZ');
    if (utc!= null) return utc
    return date.toISOString()
  }
  constructor(private router : Router) { }
}
