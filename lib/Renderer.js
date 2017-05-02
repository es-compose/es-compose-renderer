var cons = require('consolidate');
var path = require('path');
var fs = require('fs');
var {EventEmitter} = require('events')

/**
 * Renderer
 */
class Renderer extends EventEmitter
{
    /**
     * Constructor
     * 
     * Create new Renderer with given options
     * Options: {
     *  viewTemplates: []   // stack of view template directories.  These will be given higher priority over viewDir
     *  viewExt: string     // default view extesion when omitted
     *  viewEngines: {}     // supported engines, based on view extensions {'html' : 'handlebars'}
     *  viewLayout:         // layout name for layout.  leave empty/null/undefined if dont want layout
     *  viewPlaceholder
     * 
     *  // additional data available during render
     *  viewDir:           // view path for rendering. This will be added to viewPaths at run time
     *  viewScript:         // script request
     * }
     * 
     * @param {object} options 
     */
    constructor(options) {
        super();
        let defaults = {
            viewDirs : [],
            viewExt : 'html',
            viewEngines: {},
            viewLayout: null,
            viewPlaceholder: 'body',
            viewDir: undefined,
            viewScript: undefined
        }

        this.options = Object.assign({}, defaults, options);;
    }

    /**
     * Set view data or rendering option
     * 
     * @param {string} key 
     * @param {any} value 
     */
    set(key, value) {
        this.options[key] = value;
    }

    /**
     * Get option/data
     * @param {*} key 
     */
    get(key) {
        return this.options[key];
    }

    /**
     * Attempts to render the given script with the data
     * 
     * If script is not found, or unable to resolve, it will throw exception
     * data can have view** keys to override default/existing settings
     * @throws
     * @param {*} script 
     * @param {*} viewData 
     * @param {*} options 
     * @returns Promise
     */
    async render(viewScript, viewData = {}) {
        let options = Object.assign({}, this.options, viewData);

        if(options.viewDir) { // if addition view path provided, we will simply add to the options
            options.viewDirs.push(options.viewDir);
        }

        let content = await this.content(viewScript, options);        

        if(options.viewLayout) { // render the layout if provided
            // add contents for layout placeholder
            let contentPlaceholder = options.viewPlaceholder;
            options[contentPlaceholder] = content;

            content = await this.content(options.viewLayout, options);
        }

        return content;
    }

    /**
     * 
     * @param {string} script 
     * @param {*} options 
     */
    content(script, options) {
        this.emit('render', this, script, options);
        let {viewDirs, viewExt, viewEngines} = options;
        let viewEngine = this.engine(script, options);

        let filename = this.resolve(script, viewDirs, viewExt);
        return viewEngine(filename, options);
    }

    /**
     * Get view engine based on script (ext)
     * 
     * @param {*} script 
     * @param {*} ext 
     */
    engine(script, options) {
        let ext = path.extname(script).replace('.', '');
        ext = ext || options.viewExt;
        if(!options.viewEngines[ext]) {
            throw new Error(`View engine is not found for ext: ${ext}`);
        }

        let engineName = options.viewEngines[ext];
        if(!cons[engineName]) {
            throw new Error("View engine not found: ", engineName);
        }

        return cons[engineName];
    }

    /**
     * Generates absolute path for the given script
     * 
     * Will loop through multiple dir if available.
     * Use the first avaiable path.
     * @todo make this async method
     * @throws
     * @param {String} script 
     */
    resolve(script, dirs, ext = 'html') {
        if(fs.existsSync(script)) return script;

        if(!Array.isArray(dirs)) {
            dirs = [dirs];
        }

        let obj = {}
        if(path.extname(script)) {
            obj.base = script;
        } else {
            if(ext[0] != '.') ext = '.' + ext; // inject the dot
            obj.name = script;
            obj.ext = ext;
        }

        let filepath = null;
        for(let dir of dirs) { 
            obj.dir = dir;
            let _filepath = path.format(obj);
            if(fs.existsSync(_filepath)) {
               filepath = _filepath;
               break; 
            }
        }

        if(!filepath) {
            throw new Error("Unable to resolve script path: " + script);
        }

        return filepath;
    }

}

module.exports = Renderer;