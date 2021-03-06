import { AssessmentItem } from "./assessment-item.model";
import { AssessmentTest } from "./assessment-test.model";
import { parse } from 'js2xmlparser'

export class Manifest {
  '@': {
    'identifier': string;
    'xmlns': string;
    'xmlns:xsi': string;
    'xsi:schemaLocation': string;
  };

  'metadata': {
    'schema': string;
    'schemaversion': string;
  };

  'organizations': null;
  'resources': {
    'resource': {
      '@': {
        'identifier': string;
        'type': string;
        'href': string;
      };
      'file': {
        '@': {
          'href': string;
        };
      };
    }[];
  };


  constructor(test: AssessmentTest, items: AssessmentItem[]) {
    const manifestId = test["@"].identifier + "-test-entry";
    this.initRoot(manifestId);
    this.initMetadata();
    this.initResources(test, items);
  }

  private initRoot(manifestId: string) {
    this["@"] = {
      'identifier': manifestId,
      // set default values
      'xmlns': 'http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1',
      "xmlns:xsi": 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqtiv3p0_imscpv1p2_v1p0.xsd',
    }
  }

  private initMetadata() {
    this["metadata"] = {
      'schema': "QTI Package",
      'schemaversion': "3.0.0",
    }
  }

  private initResources(test: AssessmentTest, items: AssessmentItem[]) {
    const resources = [];
    for (const item of items) {
      const itemFile = "items/" + item["@"].identifier + ".xml";
      const itemResource = this.initItemResource(test["@"].identifier, item["@"].identifier, itemFile);
      resources.push(itemResource);
    }

    const testFile = "assessment.xml";
    const testResource = this.initTestResource(test["@"].identifier, testFile);
    resources.push(testResource);

    this["resources"] = {
      'resource': resources
    };
  }


  private initTestResource(testId: string, testFile: string) {
    const id = testId;
    const testResource = {
      "@": {
        'identifier': id,
        'type': 'imsqti_test_xmlv3p0',
        'href': testFile
      },
      "file": {
        "@": {
          'href': testFile
        }
      }
    }
    return testResource;
  }


  private initItemResource(testId: string, itemId: string, itemFile: string) {
    const id = itemId;
    const itemResource = {
      "@": {
        'identifier': id,
        'type': 'imsqti_item_xmlv3p0',
        'href': itemFile
      },
      "file": {
        "@": {
          'href': itemFile
        }
      }
    }
    return itemResource;
  }
  public getXml(): string {
    return parse('manifest', this)
  }
}
