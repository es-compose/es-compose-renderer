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
     *  viewPaths: []       // stack of view template directories
     *  viewExt: string     // default view extesion when omitted
     *  viewEngines: {}     // supported engines, based on 
     *  viewLayout:         // layout name for layout.  leave empty/null/undefined if dont want layout
     *  viewPlaceholder
     * 
     *  // additional data available during render
     *  viewPath:           // additional viewPath.  It will be overriden each time render
     *  viewScript:         // script request
     * }
     * 
     * @param {object} options 
     */
    constructor(options) {
        super();
        let defaults = {
            viewPaths : [],
            viewExt : 'html',
            viewEngines: {},
            viewLayout: null,
            viewPlaceholder: 'body',
            viewPath: undefined,
            viewScript: undefined
        }

        this.options = Object.assign({}, defaults, options);;
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

        this.emit('render', this, viewScript, options);

        if(viewData.viewPath) { // if addition view path provided, we will simply add to the options
            options.viewPaths.push(viewData.viewPath);
        }
        
        let {viewPaths, viewExt, viewEngines, viewLayout} = options;
        let viewEngine = viewEngines[viewExt] || null;
        if(!viewEngine) {
            throw new Error("Template Engine is not found in options.");
        }

        // render the main view content
        
        let filename = this.pathForScript(viewScript, viewPaths, viewExt);
        let content = await cons[viewEngine](filename, options);

        // render the layout if provided
        if(viewLayout) {
            let contentPlaceholder = options.viewPlaceholder;
            options[contentPlaceholder] = content;
            filename = this.pathForScript(viewLayout, viewPaths, viewExt);
            content = await cons[viewEngine](filename, options);
        }

        this.emit('rendered', this, viewScript, options);

        return content;
    }

    /**
     * Generates absolute path for the given script
     * 
     * Will loop through multiple dir if available.
     * Use the first avaiable path.
     * @throws
     * @param {String} script 
     */
    pathForScript(script, dirs, ext = 'html') {
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