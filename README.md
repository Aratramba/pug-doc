# Jade-doc
Jade-doc is a [Jade](http://www.jade-lang.com) documentation generator. It takes Jade files as input, looks for comments flagged with `@jadedoc` and puts its contents in an output JSON file. 

_This package does not provide a styled interface for the documentation itself._ Use [jade-doc-html](https://github.com/Aratramba/jade-doc-html) or [jade-doc-markdown](https://github.com/Aratramba/jade-doc-markdown) for human readable docs. Optionally use [jade-doc-faucet](https://github.com/Aratramba/jade-doc-faucet) for prettier terminal reporting.


## Usage
Use the keyword `@jadedoc` to flag [unbuffered block comments](http://jade-lang.com/reference/comments/) inside your jade files. Comments should be written in properly formatted [YAML](http://en.wikipedia.org/wiki/YAML) format.

```jade
//- @jadedoc
  name: my jadedoc
  description: this is a description for my jade doc
  beep: boop
  foo: faa
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
Optionally provide mixin arguments and example calls. If no examples are given, mixins will not be executed, so no output will be generated. Arguments must follow the [jsdoc param](http://usejsdoc.org/tags-param.html) syntax.

```jade
//- @jadedoc
  name: my mixin
  description: this is my mixin documentation
  arguments: 
    - {string} arg1 - arg1 is a string
    - {number} [arg2=1] - arg2 is a number with default value 1
  examples:
    - +myMixin('foo', 1)
    - +myMixin('faa', 2)

mixin myMixin(arg1, arg2)
  div this is a mixin #{arg1} #{arg2}
```


#### Locals
Jade locals can be also be passed.

```jade
//- @jadedoc
  name: tag
  locals:
    foo: foo

div #{foo}
```


#### Reserved words
* `arguments` for mixin arguments.
* `locals` for template locals.
* `examples` for example mixin calls


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

