import { AssessmentItem } from "./assessment-item.model";
import { Test } from "../test.model";
import { parse } from 'js2xmlparser'

export class AssessmentTest {
  '@': {
    'identifier': string; // Test.id
    'title': string;      // Test.name
    'xmlns': string;
    'xmlns:xsi': string;
    'xsi:schemaLocation': string;
  };

  'qti-test-part': {
    '@': {
      'identifier': 'testPart-1';
      'navigation-mode': string;
      'submission-mode': string;
    };
    'qti-assessment-section': {
      '@': {
        'identifier': 'assessmentSection-1';
        'title': 'Section 1';
        'visible': true;
      };
      'qti-assessment-item-ref': {
        '@': {
          'identifier': string;
          'href': string;
        };
      }[];
    };
  };


  constructor(test: Test, assesmentItems: AssessmentItem[]) {
    if (!test.id) return;
    this.initRoot(test.id, test.name);
    this.initTestPart(assesmentItems);

  }

  private initRoot(testId: string, testName: string) {
    this["@"] = {
      'identifier': testId,
      'title': testName,
      // set default values
      'xmlns': 'http://www.imsglobal.org/xsd/imsqti_v3p0',
      "xmlns:xsi": 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/imsqti_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/xsd/imsqti_asiv3p0_v1p0.xsd',
    }
  }

  private initTestPart(items: AssessmentItem[]) {

    let itemRefs = [];
    for (let item of items) {
      let itemFile = "items/" + item["@"].identifier + ".xml";
      let itemRef = this.initItemRef(item["@"].identifier, itemFile);
      itemRefs.push(itemRef);
    }

    this["qti-test-part"] = {
      '@': {
        'identifier': 'testPart-1',
        'navigation-mode': 'linear',
        'submission-mode': 'individual',
      },
      'qti-assessment-section': {
        '@': {
          'identifier': 'assessmentSection-1',
          'title': 'Section 1',
          'visible': true,
        },
        'qti-assessment-item-ref': itemRefs,
      },
    }
  }

  private initItemRef(itemId: string, itemFile: string) {
    let itemRef = {
      // 'qti-assessment-item-ref': {
        "@": {
          'identifier': itemId,
          'href': itemFile
        }
      // }

    }
    return itemRef;
  }

  public getXml() {
    return parse('qti-assessment-test', this)
  }
}