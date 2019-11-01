
const fs = require('fs-extra');
const path = require('path');

async function main() {

    const target_path = path.resolve(process.argv[2]);

    // load the template html
    const template = {
        text: (await fs.readFile('template.html')).toString(),
        setTask: function (text) {
            this.text = this.text.replace('_TASK', text);
        },
        setCondition: function (text) {
            this.text = this.text.replace('_CONDITION', text);
        },
        setCode: function (text) {
            this.text = this.text.replace('_CODE', text);
        },
        setConsole: function (text) {
            this.text = this.text.replace('_CONSOLE', text);
        }
    }

    process.chdir(target_path);
    
    const fnames = await fs.readdir('.');

    // get the list of projects
    const code_filenames = fnames
        .filter(e => /(\.cpp)$|(\.c)$/.test(e))
        // ignore the ones that don't have an associated config file
        .filter(e => fs.existsSync(`${ e.split('.')[0] }.json`))

    const projects = code_filenames
        .map(e => new Project(e))

    const copy = obj => {
        let clone = {};
        Object.assign(clone, obj);
        return clone;
    } 


    for (let e of projects) {
        await e.loadConfig();
        await e.createOutput();
        await e.compile();
        await e.run();
        await e.join(copy(template));
    }
        
}

const { spawn } = require('child_process');
const gcc = function(input, output) {
    return spawn('gcc', ['-o', output, input]);
}

class Project {
    constructor(code_filename) {
        this.code_filename = code_filename;
        this.project_name = code_filename.split('.')[0];
        this.output_file = this.project_name + '.out';
        this.markup_file = this.project_name + '.html';
    }

    async loadConfig() {
        this.config = JSON.parse(await fs.readFile(this.project_name + '.json'));
    }

    async createOutput() {
        await fs.writeFile(this.output_file, '');
    }


    compile() {
        return new Promise((resolve, reject) => {
            const compiling = gcc(this.code_filename, this.project_name);
            compiling.stderr.on('data', data => {
                console.error(`Compiler error at file ${this.code_filename}:\n${data}`);
                reject();
            })

            compiling.on('close', (code) => {
                console.log(`Compiling of ${this.code_filename} successful`);
                resolve();
            })
        })        
    }

    run() {

        return new Promise(async (resolve, reject) => {

            const exe_name = this.project_name;

            const sink = spawn(exe_name, this.config.arguments || []);

            let outputs = [];
            let inputs = [];
            this.dialog = [];

            sink.stdout.on('data', data => {
                outputs = outputs.concat(data.toString().split(/\r?\n/));
            })

            sink.stderr.on('data', data => {
                outputs = outputs.concat(data.toString().split(/\r?\n/));
            })

            sink.on('close', async code => {

                let objs = [
                    {
                        arr: outputs.filter(e => e.length > 0),
                        index: 0
                    },
                    {
                        arr: inputs.filter(e => e.length > 0),
                        index: 0
                    }                    
                ]

                for (let i = 0; i < this.config.ioscheme.length; i++) {
                    let obj = objs[i % 2];
                    this.dialog = this.dialog.concat(
                        obj.arr.slice(
                            obj.index,
                            obj.index += this.config.ioscheme[i]
                        ))
                }

                console.log(`The process ${exe_name} has terminated with exit code ${code}`);
                for (let i = 0; i < this.dialog.length; i++) {
                    await fs.appendFile(this.output_file, this.dialog[i] + '\n');
                }
                resolve();
            })

            const input_strings = this.config.inputs;

            if (input_strings) {
                for (let i = 0; i < input_strings.length; i++) {
                    const msg = String(input_strings[i]);
                    inputs.push('> ' + msg);
                    await write(sink, msg + '\n');
                }
            } 
            
            sink.stdin.end();
        })        
    }

    async join(template) {

        // set the task
        template.setTask(this.config.task || "");

        // set the condition
        const cd = this.config.condition;

        template.setCondition(cd.join(' '));

        // set code strings
        template.setCode(
            (await fs.readFile(this.code_filename))
                .toString()
                .split(/\r?\n/)
                .map((e, i) => `
                    <li class="code-line">
                        <span class="line-number">${i}</span>
                        <span class="code-string">${
                            e.replace(/\s/g, '&nbsp;')
                             .replace(/</g, '&lt;')
                             .replace(/>/g, '&gt;')
                        }</span>
                    </li> 
                `).join(''));

        // set output strings
        template.setConsole(
            this.dialog.map(e => `
                <div>
                    <div class="console-string">${e.replace(/\s/g, '&nbsp')}</div>
                </div>        
            `).join(''));

        // write the html file
        await fs.writeFile(this.markup_file, template.text);     
    }
}


function write(process, text) {
    return new Promise((resolve, reject) => {

        // write a string to the preocess' stdin
        process.stdin.write(text, () => {
            resolve()
        })
    })
}


main()