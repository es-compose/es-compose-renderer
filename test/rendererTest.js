var expect = require('chai').expect;
var sinon = require('sinon');
var path = require('path');

describe("Renderer", function() {
    const Renderer = require('../');
    let renderer = new Renderer({
        engine: 'handlebars',
        ext: 'html',
        views: __dirname
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
            let content = await renderer.render('test2');
            expect(content).to.be.eq('<h1>Test2</h1>');
        })

        it("should support multiple view dirs", async () => {
            renderer.options = Object.assign({}, renderer.options, {
                views: [__dirname, path.join(__dirname, 'views')]
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
                layout : 'layout'
            })

            expect(content).to.be.eq('<h1>From Layout</h1><h1>Test2</h1>');
        })

        it("can pass data to layout", async () => {
            let content = await renderer.render('test2', {
                layout : 'layout',
                title: 'Hello'
            })

            expect(content).to.be.eq('<h1>From LayoutHello</h1><h1>Test2</h1>');
        })
    })
})