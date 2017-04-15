var cons = require('consolidate');
var path = require('path');
var fs = require('fs');

class Renderer 
{
    /**
     * Constructor
     * 
     * Create new Renderer with given options
     * Options: {
     *  views: []
     *  ext: string
     *  engines: {}
     * }
     * 
     * @param {object} options 
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Attempts to render the given script with the data
     * 
     * If script is not found, or unable to resolve, it will throw exception
     * @throws
     * @param {*} script 
     * @param {*} data 
     * @param {*} options 
     * @returns Promise
     */
    async render(script, data = {}) {
        let options = Object.assign({}, this.options, data);
        
        let engine = options.engine || null;
        if(!engine) {
            throw new Error("Template Engine is not found in options.");
        }

        // render the main view content
        let filename = this.pathForScript(script, options.views, options.ext);
        let content = await cons[engine](filename, data);

        // render the layout if provided
        if(options.layout) {
            let contentPlaceholder = options.layoutContentPlaceholder || 'body';
            data[contentPlaceholder] = content;
            filename = this.pathForScript(options.layout, options.views, options.ext);
            content = await cons[engine](filename, data);
        }

        return content;
    }

    /**
     * Generates absolute path for the given script
     * @throws
     * @param {String} script 
     */
    pathForScript(script, dirs, ext = 'html') {
        // console.log(script, dirs, ext);
        if(fs.existsSync(script)) return script;

        if(!Array.isArray(dirs)) {
            dirs = [dirs];
        }

        let obj = {}
        if(path.extname(script)) {
            obj.base = script;
        } else {
            // let ext = options.ext;
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