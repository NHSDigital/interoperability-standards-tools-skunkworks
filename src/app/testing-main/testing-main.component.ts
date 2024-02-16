import { Component } from '@angular/core';
import {IMenuItem, IMenuTrigger} from "@covalent/core/dynamic-menu";
import {ConfigService} from "../config.service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-testing-main',
  templateUrl: './testing-main.component.html',
  styleUrls: ['./testing-main.component.scss']
})
export class TestingMainComponent {
  triggerDataStandards: IMenuTrigger = {
    icon: 'table',
    text: 'Data'
  };
  triggerEnterprise: IMenuTrigger = {
    icon: 'domain',
    text: 'Enterprise'
  };
  triggerInteroperabilty: IMenuTrigger = {
    icon: 'local_fire_department',
    text: 'Interop'
  };

  triggerDeveloper: IMenuTrigger = {
    icon: 'integration_instructions',
    text: 'Developer'
  };
  dataStandards: IMenuItem[] = [
    {
      text: 'Data Standards'
    },
    {
      text:'Data Standards Directory',
      link: 'https://data.standards.nhs.uk/',
      newTab: true
    },
    {
      text:
          'NHS Data Model and Dictionary',
      link: 'https://www.datadictionary.nhs.uk/',
      newTab: true
    },
    {
      text: 'Clinical Coding'
    },
    {
      text:
          'SNOMED CT Browser (UK)',
      link: 'https://termbrowser.nhs.uk/',
      newTab: true
    },
    {
      text:
          'Ontology Server (NHS England)',
      link: 'https://ontoserver.csiro.au/shrimp/launch.html?iss=https://ontology.nhs.uk/authoring/fhir',

      newTab: true
    }
    ]
  /*

  Enterprise

   */
  enterprise: IMenuItem[] = [
    {
      text: 'Implementation'
    },
    {
      text: 'IHE Resources',
      link: 'https://www.ihe.net/resources/profiles/',
      newTab: true
    },
    {
      text: 'Administration',
      children: [
        {
          text: 'IHE Patient Demographics Query (PDQm) (FHIR R4)',
          link: 'https://profiles.ihe.net/ITI/PDQm',
          newTab: true
        }
      ]
    },
    {
      text: 'Directories',
      children: [
        {
          text: 'IHE Care Services Discovery (mCSD) (FHIR R4)',
          link: 'https://profiles.ihe.net/ITI/mCSD',
          newTab: true
        }
      ]
    },
    {
      text: 'Documents (Sharing)',
      children: [
        {
          text: 'IHE Mobile access to Health Documents (MHD) (FHIR R4)',
          link: 'https://profiles.ihe.net/ITI/MHD',
          newTab: true
        },
        {
          text: 'IHE Mobile Health Document Sharing (MHDS) (FHIR R4)',
          link: 'https://profiles.ihe.net/ITI/MHDS',
          newTab: true
        },
        {
          text: 'IHE Cross-Enterprise Document Sharing (XDS.b)',
          link: 'https://profiles.ihe.net/ITI/TF/Volume1/ch-10.html',
          newTab: true
        }
      ]
    },
    {
      text: 'Data',
      children: [
        {
          text: 'IHE Query for Existing Data for Mobile (QEDm) (FHIR R4)',
          link: 'https://build.fhir.org/ig/IHE/QEDm',
          newTab: true
        },
        {
          text: 'HL7 Structured Data Capture (FHIR R4)',
          link: 'https://build.fhir.org/ig/HL7/sdc/',
          newTab: true
        }
      ]
    },
    {
      text: 'Security and Audit',

      children: [
        {
          text: 'SMART App Launch',
          link: 'https://hl7.org/fhir/smart-app-launch/',
          newTab: true
        },
        {
          text: 'IHE Basic Audit Log Patterns (BALP)',
          link: 'https://profiles.ihe.net/ITI/BALP',
          newTab: true
        },
        {
          text: 'IHE Internet User Authorization (IUA)',
          link: 'https://profiles.ihe.net/ITI/IUA',
          newTab: true
        }
      ]
    }

  ];

  /*

  INTEROPERABILITY

   */

  interoperability: IMenuItem[] = [
    {
      text: 'HL7 FHIR R4',
      link: 'https://hl7.org/fhir/R4/',
      newTab: true
    },
    {
      text: 'Conformance'
    },
    {
      text: 'HL7 UK Core',
      link: 'https://simplifier.net/guide/ukcoreversionhistory',
      newTab: true
    },
    {
      text: 'NHS England',
      link: 'https://simplifier.net/guide/nhs-england-implementation-guide-version-history',
      newTab: true
    },
    {
      text: 'Implementation'
    },
    {
      text: 'HL7 UK Core Access (FHIR R4)',
      link: 'https://build.fhir.org/ig/HL7-UK/UK-Core-Access',
      newTab: true
    },
    {
      text: 'INTEROPen RESTful API (FHIR STU3)',
      link: 'https://nhsconnect.github.io/CareConnectAPI/',
      newTab: true
    },
    {
      text:
          'Clinical',
      children:[
        {
          text: 'International Patient Summary',
          link: 'https://build.fhir.org/ig/HL7/fhir-ips',
          newTab: true
        },
        {
          text: 'International Patient Access',
          link: 'https://build.fhir.org/ig/HL7/fhir-ipa',
          newTab: true
        }
      ]
    },
    {
      text:
          'Medicines',
      children:[
        {
          text:
              'UK Core Interoperable Medicines',
          link: 'https://simplifier.net/guide/ukcoreimplementationguideformedicines/NHSDictionaryofMedicinesandDevicesdmd',
          newTab: true
        },
        {
          text: 'Europe Medicinal Product Information (IPS)',
          link: 'https://build.fhir.org/ig/hl7-eu/gravitate-health-ips',
          newTab: true
        },
      ]
    },
    {
      text:
          'Diagnostics',
      children:[
        {
          text:
              'NHS Pathology',
          link: 'https://simplifier.net/guide/pathology-fhir-implementation-guide',
          newTab: true
        },
        {
          text: 'HL7 Europe Laboratory Report',
          link: 'https://build.fhir.org/ig/hl7-eu/laboratory/',
          newTab: true
        }
      ]
    },
  ];

  /*

  Developer
   */

  developer: IMenuItem[] = [
    {
      text: 'FHIR Exchange'
    },
    {
      text: 'RESTful API',
      link: 'https://hl7.org/fhir/R4/http.html',
      newTab: true
    },
    {
      text: 'Code Libraries',
      link: 'https://confluence.hl7.org/display/FHIR/Open+Source+Implementations',
      newTab: true
    },
    {
      text: 'Testing',
      children: [
        {
          text: 'Validating FHIR',
          link: 'https://hl7.org/fhir/R4/validation.html',
          newTab: true
        },
        {
          text: 'Testing FHIR',
          link: 'https://hl7.org/fhir/R4/testing.html',
          newTab: true
        },
      ]
    },
    {
      text: 'Workflow',
      children:[
        {
          text: 'FHIR Worfklow',
          link: 'https://hl7.org/fhir/R4/workflow.html',
          newTab: true
        },
        {
          text: 'FHIR Messaging',
          link: 'https://hl7.org/fhir/R4/messaging.html',
          newTab: true
        }
      ]
    },
    {
      text: 'Document',
      link: 'https://hl7.org/fhir/R4/documents.html',
      newTab: true
    },
    {
      text: 'Services (SOA)',
      link: 'https://hl7.org/fhir/R4/services.html',
      newTab: true
    },
    {
      text: 'Events'
    },
    {
      text: 'FHIR Subscription (backport)',
      link: 'https://build.fhir.org/ig/HL7/fhir-subscription-backport-ig',
      newTab: true
    },
    {
      text: 'FHIR Cast',
      link: 'https://build.fhir.org/ig/HL7/fhircast-docs',
      newTab: true
    }
    ]
  constructor(private config: ConfigService) {
  }
  getSwagger() {
    if (environment.isDocker) return "/swagger-ui/index.html"
    let url = this.config.validateUrl().replace("/FHIR/R4","/swagger-ui/index.html")
    return url
  }
}
