import { Component } from '@angular/core';
import {IMenuItem, IMenuTrigger} from "@covalent/core/dynamic-menu";

@Component({
  selector: 'app-testing-main',
  templateUrl: './testing-main.component.html',
  styleUrls: ['./testing-main.component.scss']
})
export class TestingMainComponent {
  triggerDataStandards: IMenuTrigger = {
    icon: 'table',
    text: 'Data Standards'
  };
  triggerEnterprise: IMenuTrigger = {
    icon: 'domain',
    text: 'Enterprise Integration'
  };
  triggerInteroperabilty: IMenuTrigger = {
    icon: 'local_fire_department',
    text: 'Interoperability'
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
      text: 'Clinical Coding'
    },
    {
      text:
          'NHS Data Model and Dictionary',
      link: 'https://www.datadictionary.nhs.uk/',
      newTab: true
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
      text: 'IHE General',
      link: 'https://wiki.ihe.net/index.php/Category:FHIR',
      newTab: true
    },
    {
      text: 'Administration',
      children: [
        {
          text: 'IHE Patient Demographics Query (PDQm)',
          link: 'https://profiles.ihe.net/ITI/PDQm',
          newTab: true
        }
      ]
    },
    {
      text: 'Directories',
      children: [
        {
          text: 'IHE Care Services Discovery (mCSD)',
          link: 'https://profiles.ihe.net/ITI/mCSD',
          newTab: true
        }
      ]
    },
    {
      text: 'Documents (Sharing)',
      children: [
        {
          text: 'IHE Mobile access to Health Documents (MHD)',
          link: 'https://profiles.ihe.net/ITI/MHD',
          newTab: true
        },
        {
          text: 'IHE Mobile Health Document Sharing',
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
          text: 'HL7 UK - UK Core Access',
          link: 'https://build.fhir.org/ig/HL7-UK/UK-Core-Access',
          newTab: true
        },
        {
          text: 'IHE Query for Existing Data for Mobile (QEDm)',
          link: 'https://build.fhir.org/ig/IHE/QEDm',
          newTab: true
        },
        {
          text: 'HL7 Structured Data Capture',
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
      text: 'General',
      children:[

        {
          text: 'HL7 UK Core',
          link: 'https://simplifier.net/guide/ukcoreversionhistory',
          newTab: true
        },
        {
          text: 'NHS England',
          link: 'https://simplifier.net/guide/nhs-england-implementation-guide-version-history',
          newTab: true
        }
      ]
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
    {
      text: 'Conformance and Implementation'
    },
    {
      text: 'Data Standards Wales',
      link: 'https://simplifier.net/guide/fhir-standards-wales-implementation-guide',
      newTab: true
    }
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
}
