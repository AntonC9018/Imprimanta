const { spawn } = require('child_process');

const sink = spawn('D:\\Test\\New folder\\3_1');

let first = true

sink.stdout.on('data', data => {
    console.log('New Output')
    console.log(data.toString())
})

sink.stdin.on('data', data => {
    console.log('New Input')
    console.log(data)
})

sink.stderr.on('data', data => {
    console.log(data)
})

sink.on('close', async code => {
    console.log(`The process has terminated with exit code ${code}`);
})