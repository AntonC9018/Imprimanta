#How to use
`node index <your-folder>`
This will generate .out, .html and .exe files in the given folder, from all files with extension .c and .cpp from that folder usin the config .json files with the same name. See the structure of config files in Example.

#Some notes on config file
The `ioscheme` parameter indicates how many outputs-inputs-outputs-etc. are to be expected from the program. E.g. in the example config we have `"ioscheme": [1, 3, 1]`, which stands for *1 output* from the program, then *3 inputs*, then *1 output*.
