var jsep = require('jsep');

/**
 * @{ key expression }
 * 
 * @{ key } // identifier
 * @{ key value }  // compound = set operation
 * @{ func() }
 * @{ func arg1, arg2}
 * @{ block name 
 * 
 * 
 * }

 */
class Parser {

    /**
     * 
     */
    constructor() {
        this.delimiters = ['@{', '}'];
    }

    /**
     * Simple parser
     * 
     * Parses @{key} with value. ie, <p>Hello @{name}</p>
     * given, data = {name: 'John'} will parse into <p>Hello John</p>
     * 
     * It also supports setting value to view data
     * @{key = value} will replace/assign value to the view data
     * @param {*} content 
     * @param {*} data 
     */
    parse(content, data) {
        let [d1, d2] = this.delimiters;

        // const regex = /@{([^}]+)}/g;
        const pattern = `${d1}([^}]+)${d2}`;

        const regex = new RegExp(pattern, 'g');
        var result = content.replace(regex, function(match, group) {

            try {
                let tree = jsep(group);
                switch(tree.type) {
                    case 'Indentifier': // assume get operation (property/function)
                        break;

                    case 'Compound': // assume set operation 
                        break;

                    default: // not supported operations
                }

                return JSON.stringify(tree);

            } catch(e) {
                return '';
            }

        });

        return result;
    }

    /**
     * 
     * @param {*} value 
     */
    normalizeValue(value) {
        
    }
}

module.exports = Parser;