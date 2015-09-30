`stability: unstable`

# Jade-doc
Jade-doc is a [Jade](http://www.jade-lang.com) documentation generator. It takes Jade files as input, looks for comments flagged with `@jadedoc` and puts its contents in an output JSON file. _It does not provide a styled interface for the documentation itself._


## Usage
Use the keyword `@jadedoc` to flag [unbuffered block comments](http://jade-lang.com/reference/comments/) inside your jade files. Comments should be written in [YAML](http://en.wikipedia.org/wiki/YAML) format.

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

`npm install jade-doc -g`

`jade-doc --input file.jade --output file.json`


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

