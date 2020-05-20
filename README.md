# Pug-doc
Pug-doc is a [Pug](http://www.pugjs.org) documentation generator. It takes Pug files as input, looks for comments flagged with `@pugdoc` and puts its contents in an output JSON file. It looks for the immediate next pug code block for output.

> This package does not provide a styled interface for the documentation itself. Use [Discodip](https://www.npmjs.com/package/discodip) for HTML output of all the examples, which can be used however you like. 

> You could also use [pug-doc-html](https://github.com/Aratramba/pug-doc-html) or [pug-doc-markdown](https://github.com/Aratramba/pug-doc-markdown) for human readable docs. Optionally use [pug-doc-faucet](https://github.com/Aratramba/pug-doc-faucet) for prettier terminal reporting.


## Usage
Use the keyword `@pugdoc` to flag [unbuffered block comments](https://pugjs.org/language/comments.html) inside your pug files. Comments should be written in properly formatted [YAML](http://en.wikipedia.org/wiki/YAML) format.

```pug
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

```pug
//- @pugdoc
  name: some-node

div.this-is-output-for-pug-doc
div.this-isnt
```

---

#### Mixins
Optionally provide mixin arguments, attributes and example calls. If no examples are given, mixins will not be executed, so no output will be generated. 

Arguments and attributes  follow the [jsdoc param](http://usejsdoc.org/tags-param.html) syntax.

```pug
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
    - 
      name: My mixin
      description: this is my subexample
      examples:
        - |
          +myMixin('beep', 3)

mixin myMixin(arg1, arg2)
  div this is a mixin #{arg1} #{arg2} #{attr1} #{attr2}
```

---

#### Examples
You can add an example or multiple examples with the `example` or `examples` keyword, where the former is a YAML string and the latter a YAML list. The `block` flag will be replaced by the captured block.

For documenting mixins the use of examples is recommended, since mixins will not be executed if no examples are given. For other pug blocks, examples are optional and can be used to add extra context (e.g. a parent div with styling).

If an object is found inside the examples list, two things will happen. The subexample is 1) rendered and appended to the rest of the examples and 2) added to a list of fragments. This way a complete, rendered HTML example will be available, while also keeping the named subexamples intact.

_single example_
```pug
//- @pugdoc
  name: example
  example: |
    div.example(style="max-width: 300px")
      block

p this is my example
```

_multiple example_
```pug
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

_subexamples example_
```pug
//- @pugdoc
  name: example
  examples: 
    - 
      name: Subexample 1
      example: |
        div.example1
          block
    - 
      name: Subexample 2
      example: |
        div.example2
          block

p this is my example
```

Should you need multiline examples, use [YAML's folded style](http://www.yaml.org/spec/1.2/spec.html#id2796251), like:

```pug
  //- @pugdoc
    examples:
      - >
        +myMixin({
          foo: 'foo
        }
```

_beforeEach example_
```pug
//- @pugdoc
  name: example
  beforeEach: |
    include ./my-mixin
  examples:
    - 
      name: Example 1
      example: +my-mixin(1)
    - 
      name: Example 2
      example: +my-mixin(2)
    - 
      name: Example 2
      beforeEach: 
      example: +my-mixin(3) // ‹- error: my-mixin is undefined
```



---

#### Locals
Pug locals can be also be passed.

```pug
//- @pugdoc
  name: tag
  locals:
    foo: foo

div #{foo}
```

---

#### Capture multiple blocks
The `capture` keyword specifies how many blocks after the comment will be returned. Use `capture: all` to capture the rest of the document. Use `capture: section` to capture all items until the next pugdoc tag.

```pug
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

#### Keywords
* `name` used as an id
* `description` provide context
* `arguments` for mixin arguments.
* `attributes` for (mixin) attributes.
* `locals` for template locals.
* `beforeEach` (string) add pug code before each example
* `afterEach` (string) add pug code after each example
* `example` 
  - (string) for example mixin call or example block, or 
  - (false) to prevent rendering of master example combining all examples
* `examples` (list) for example mixin calls or example blocks
* `examples.name`
* `examples.description`
* `examples.example` (string)
* `examples.examples` (list)
* `examples.beforeEach` (string) overwrite beforeEach for single example
* `examples.afterEach` (string) overwrite afterEach for single example
* `capture` for the number of code blocks to be captured
  - `all`: the rest of the document until it meets a lower indent
  - `section`: the rest of the document until it meets a lower indent or a new pugdoc comment
  - `number`: the exact positive number of blocks

---

## How to use
`npm install pug-doc`

```js
const pugDoc = require('pug-doc');

pugDoc({
  input: '**/*.pug',
  output: 'anything.json',
  complete: function(){},
  locals: {
    myTemplateLocal: 'foo'
  }
});
```

---

## Caveats
### Mixin dependencies
Mixins are standalone blocks, so you need to include any dependencies inside the mixin.

```pug
include ../mixin1.pug

//- @pugdoc
  name: mixin2
  example: +mixin2

mixin mixin2
  +mixin1
```

Will throw something like `TypeError: pug_mixins.mixin1 is not a function on line x`. Instead you need to do the include inside the mixin, 

```pug
mixin mixin2
  include ../mixin1.pug
  +mixin1
+mixin2
```

or include it inside the example

```pug
//- @pugdoc
  name: mixin2
  example: |
    include ../mixin1.pug
    +mixin2

mixin mixin2
  +mixin1
```

---


### Command line
Optionally use it through the command line.

```bash
pug-doc input.pug
```

```bash
pug-doc input.pug --output output.json
pug-doc "**/*.pug" --output output.json
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
    "file": "file.pug",
    "source": "// foo",
    "output": "<!-- foo-->"
  }
]
```

