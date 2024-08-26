import { EmptyTag } from "./constants";
import { XMLBuilder } from "./xml-builder";
import { XMLBuilder as FastXMLBuilder } from "fast-xml-parser";

const builder = new XMLBuilder({ minifiy: false, suppressEmptyNode: true })

const fastBuilder = new FastXMLBuilder({ format: true, ignoreAttributes: false, attributeNamePrefix: '@', suppressEmptyNode: true})

const config = {
  "Signature": {
    "@xmlns": "http://www.w3.org/2000/09/xmldsig#",
    "SignedInfo": {
      "CanonicalizationMethod": {
        "@Algorithm": "http://www.w3.org/2001/10/xml-exc-c14n#"
      },
      "SignatureMethod": {
        "@Algorithm": "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"
      },
      "Reference": {
        "@URI": "",
        "Transforms": {
          "Transform": [
            {
              "@Algorithm": "http://www.w3.org/2000/09/xmldsig#enveloped-signature"
            },
            {
              "@Algorithm": "http://www.w3.org/2001/10/xml-exc-c14n#"
            }
          ]
        },
        "DigestMethod": {
          "@Algorithm": "http://www.w3.org/2001/04/xmlenc#sha256"
        },
        "DigestValue": "amW4BldMml+kerZngRSJE+hJ7OME87GlHOL2V1kiQJw="
      }
    },
    "SignatureValue": "Uz2YlISr44x15vArlo8q+yWTCMqJWouWonYjMDb+rw7efadZlFvJN9wLCu0g9BKkHb5EFbUhe0h7SkvOP2GpXSPn3HUVDqZerGMFA5rhu1+qzh6k9AZoqWVbnkWlDwTVfofTYGUE0advNHjzdjCcwV28dgnzJ0qNCGrtBxhVoyxzYn9LErx0VHUbolCwz/7sK4FAhaRlXTuj/t1OR1EjHtasN4jcZsRVGLDY2u+EB0WTL70RQ5aRELjMHKXGzgsbRqF4J5D6WVrSz4s4FTBocZEF+W3KlnKPCih+sIzMvuRbd9NIrIFN6Kc4cie4kMZfrJnAVL/uBWlh9Rl10kESzw==",
    "KeyInfo": {
      "KeyName": "A7C247C4A2F795BBD0BDFB5C56ED4CDC86B60368"
    }
  }
}

console.log(config)

const a = builder.build(config)

console.log(a)

// const b = fastBuilder.build(config)

// console.log(b)