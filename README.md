# Pug-doc
Pug-doc is a [Pug (Jade)](http://www.jade-lang.com) documentation generator. It takes Jade files as input, looks for comments flagged with `@pugdoc` and puts its contents in an output JSON file. It looks for the immediate next pug code block for output.

_This package does not provide a styled interface for the documentation itself._ Use [pug-doc-html](https://github.com/Aratramba/pug-doc-html) or [pug-doc-markdown](https://github.com/Aratramba/pug-doc-markdown) for human readable docs. Optionally use [pug-doc-faucet](https://github.com/Aratramba/pug-doc-faucet) for prettier terminal reporting.


## Usage
Use the keyword `@pugdoc` to flag [unbuffered block comments](http://jade-lang.com/reference/comments/) inside your jade files. Comments should be written in properly formatted [YAML](http://en.wikipedia.org/wiki/YAML) format.

```jade
//- @pugdoc
  name: my pugdoc
  description: this is a description for my pug doc
  beep: boop
  foo: faa
```

see [test/fixtures](https://github.com/Aratramba/pug-doc/tree/master/test/fixtures) for examples.

---

### HTML Output
The immediate next Pug code block after the comment will be compiled to HTML output. If you need to capture multiple blocks, see [Capture multiple blocks](#capture-multiple-blocks)

```jade
//- @pugdoc
  name: some-node

div.this-is-output-for-pug-doc
div.this-isnt
```

---

#### Mixins
Optionally provide mixin arguments, attributes and example calls. If no examples are given, mixins will not be executed, so no output will be generated. 

Arguments and attributes  follow the [jsdoc param](http://usejsdoc.org/tags-param.html) syntax.

```jade
//- @pugdoc
  name: my mixin
  description: this is my mixin documentation
  arguments: 
    - {string} arg1 - this is the description of arg1
    - {number} arg2 - this is the description of arg2
  attributes: 
    - {string} attr1 - this is the description of attr1
    - {number} attr2 - this is the description of attr2
  examples:
    - +myMixin('foo', 1)
    - +myMixin('faa', 2, attr1='foo', attr2='faa')

mixin myMixin(arg1, arg2)
  div this is a mixin #{arg1} #{arg2} #{attr1} #{attr2}
```

---

#### Examples
You can add an example or multiple examples with the `example` or `examples` keyword, where the former is a YAML string and the latter a YAML list. The `block` flag will be replaced by the captured block.

For documenting mixins the use of examples is recommended, since mixins will not be executed if no examples are given. For other jade blocks, examples are optional and can be used to add extra context (e.g. a parent div with styling).

_single example_
```jade
//- @pugdoc
  name: example
  example: |
    div.example(style="max-width: 300px")
      block

p this is my example
```

_multiple example_
```jade
//- @pugdoc
  name: example
  examples: 
    - |
      div.example
        block
    - |
      div.example
        block

p this is my example
```

Should you need multiline examples, use [YAML's folded style](http://www.yaml.org/spec/1.2/spec.html#id2796251), like:

```jade
  //- @pugdoc
    examples:
      - >
        +myMixin({
          foo: 'foo
        }
```

---

#### Locals
Pug locals can be also be passed.

```jade
//- @pugdoc
  name: tag
  locals:
    foo: foo

div #{foo}
```

---

#### Capture multiple blocks
The `capture` keyword specifies how many blocks after the comment will be returned. Use `capture: all` to capture the rest of the document. Use `capture: section` to capture all items until the next pugdoc tag.

```jade
//- @pugdoc
  name: tag
  capture: 3

div 1
div 2
div 3
div nope
div nope
```

---

#### Reserved words
* `arguments` for mixin arguments.
* `attributes` for (mixin) attributes.
* `locals` for template locals.
* `example` for example mixin call or example block
* `examples` for example mixin calls or example blocks
* `capture` for the number of code blocks to be captured
  - `all`: the rest of the document until it meets a lower indent
  - `section`: the rest of the document until it meets a lower indent or a new pugdoc comment
  - `number`: the exact positive number of blocks

---

## How to use
`npm install pug-doc`

```js
var pugDoc = require('pug-doc');

pugDoc({
  input: '**/*.jade',
  output: 'anything.json',
  complete: function(){},
  globals: {
    myGlobal: 'foo'
  }
});
```

---

## Caveats
### Mixin dependencies
Mixins are standalone blocks, so you need to include any dependencies inside the mixin.

```jade
include ../mixin1.jade

//- @pugdoc
  name: mixin2
  example: +mixin2

mixin mixin2
  +mixin1
```

Will throw something like `TypeError: jade_mixins.mixin1 is not a function on line x`. Instead you need to do the include inside the mixin, 

```jade
mixin mixin2
  include ../mixin1.jade
  +mixin1
+mixin2
```

or include it inside the example

```jade
//- @pugdoc
  name: mixin2
  example: |
    include ../mixin1.jade
    +mixin2

mixin mixin2
  +mixin1
```

---


### Command line
Optionally use it through the command line.

```bash
pug-doc input.jade
```

```bash
pug-doc input.jade --output output.json
pug-doc "**/*.jade" --output output.json
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

