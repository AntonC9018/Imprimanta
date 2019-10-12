

$(() => {
    const conditionEl = $('#condition')
    const codeEl = $('#code');
    const consoleEl = $('#console');


    const fakeCondition = 
        `Se introduce doua siruri. Demonstati ca sunt egale<br>
        formula
        `

    conditionEl.html('`x^2*(x+1)/b-(sin(x+a))^2`');
    

    // $('body').append(`<script src="tex-mml-chtml.js"></script>`)
    

    const fakeStrings = [
        'This is a test',
        'var main i++',
        'mov cx,dx',
        'add ecx,edi',
        'print(i--)'
    ];


    for (let i = 0; i < fakeStrings.length; i++) {

        $(`
            <li class="code-line">
                <span class="line-number">${i}</span>
                <span class="code-string">${fakeStrings[i]}</span>
            </li>        
        `)
            .appendTo(codeEl)


    }


    const fakeConsole = [
        'Enter a number:',
        '> abcdefgh',
        'This is not a number. Try again.',
        '> 123',
        'You have entered 123'
    ]


    for (let i = 0; i < fakeStrings.length; i++) {

        $(`
            <div>
                <div class="console-string">${fakeConsole[i]}</div>
            </div>        
        `)
            .appendTo(consoleEl)

    }

    MathJax = {
        loader: {load: ['input/asciimath', 'output/chtml', 'ui/menu'] },
    };

    $('body').append('<script type="text/javascript" id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/startup.js">')
    

})