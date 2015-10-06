# Jade-doc
Jade-doc is a [Jade](http://www.jade-lang.com) documentation generator. It takes Jade files as input, looks for comments flagged with `@jadedoc` and puts its contents in an output JSON file. 

_This package does not provide a styled interface for the documentation itself._ Use [jade-doc-html](https://github.com/Aratramba/jade-doc-html) or [jade-doc-markdown](https://github.com/Aratramba/jade-doc-markdown) for human readable docs. Optionally use [jade-doc-faucet](https://github.com/Aratramba/jade-doc-faucet) for prettier terminal reporting.


## Usage
Use the keyword `@jadedoc` to flag [unbuffered block comments](http://jade-lang.com/reference/comments/) inside your jade files. Comments should be written in properly formatted [YAML](http://en.wikipedia.org/wiki/YAML) format.

```jade
//- @jadedoc
  name: My JadeDoc
  description: this is a description for my jade doc
  beep: boop
  foo: bar
```


### HTML Output
The immediate next Jade code block after the comment will be compiled to HTML output.

```jade
//- @jadedoc
  name: some-node

div.this-is-output-for-jade-doc
div.this-isnt
```


#### Mixins
Optionally provide mixin arguments. If no arguments are given, mixins will be executed without any arguments.

```jade
//- @jadedoc
  name: mixin
  description: this is jade mixin documentation
  arguments: 
    arg1: foo
    arg2: faa

mixin doc3(arg1, arg2)
  div this is a mixin #{arg1} #{arg2}
```


## How to use
`npm install jade-doc`

```js
var jadeDoc = require('jade-doc');

jadeDoc({
  input: '**/*.jade',
  output: 'anything.json'
});
```



### Command line
Optionally use it through the command line.

```bash
jade-doc input.jade
```

```bash
jade-doc input.jade --output output.json
```


### Output file
Output will look something like this.

```json
[
  {
    "meta": {
      "name": "foo",
      "description": "foo description"
    },
    "file": "file.jade",
    "source": "// foo",
    "output": "<!-- foo-->"
  }
]
```

