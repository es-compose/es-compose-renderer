var expect = require('chai').expect;
var sinon = require('sinon');
var path = require('path');

describe("Renderer", function() {
    const Renderer = require('../');
    let renderer = new Renderer({
        viewEngines: { 
            html:  'handlebars',
            ejs: 'ejs'
        },
        viewExt: 'html',
        viewPaths: __dirname
    });

    describe('#pathForScript', () => {
        it("should throw error when script doesn't exist", () => {
            expect(() => {renderer.pathForScript('/path/to/nowhere')}).to.throw;
        })

        // it("should return the script")
    })


    describe("#render", () => {
        it("should render absolute path", async () => {
            let script = path.join(__dirname, 'test.html');
            let content = await renderer.render(script);
            expect(content).to.be.eq('<p>Hello</p>');
        })

        it("should render by resolving path", async () => {
            let content = await renderer.render('test2', {title: 'hi'});
            expect(content).to.be.eq('<h1>Test2</h1>');
        })

        it("should support multiple view dirs", async () => {
            renderer.options = Object.assign({}, renderer.options, {
                viewPaths: [__dirname, path.join(__dirname, 'views')]
            })

            let content = await renderer.render('test3');
            expect(content).to.be.eq('<p>test3</p>');
        })

        it("should support view data", async() => {
            let content = await renderer.render('test3', {message:'my message'})
            expect(content).to.be.eq('<p>test3my message</p>');
        })

        it("should support layout", async () => {
            let content = await renderer.render('test2', {
                viewLayout : 'layout'
            })

            expect(content).to.be.eq('<h1>From Layout</h1><h1>Test2</h1>');
        })

        it("can pass data to layout", async () => {
            let content = await renderer.render('test2', {
                viewLayout : 'layout',
                title: 'Hello'
            })

            expect(content).to.be.eq('<h1>From LayoutHello</h1><h1>Test2</h1>');
        })

        it("can add additional view paths at render method", async() => {
            let content = await renderer.render('test4', {
                viewPath: path.join(__dirname, 'views2'),         
                title: 'Hello'
            })

            expect(content).to.be.eq('test4');
        })

        it("should support multiple engine",async () => {
             let content = await renderer.render('hello.ejs', {
                 title:'ejs'
                })
            expect(content).to.be.eq('hello ejs');
        })
    })
})