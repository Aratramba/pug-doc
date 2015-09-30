`stability: unstable`

# Jade-doc
Jade-doc is a [Jade](http://www.jade-lang.com) documentation generator. It takes Jade files as input, looks for comments flagged with `@jadedoc` and puts its contents in an output JSON file. _It does not provide a styled interface for the documentation itself._


## Basic usage
Use the keyword `@jadedoc` to flag [unbuffered block comments](http://jade-lang.com/reference/comments/) inside your jade files. Comments should be written in [YAML](http://en.wikipedia.org/wiki/YAML) format.

```jade
//- @jadedoc
  name: My JadeDoc
  description: this is a description for my jade doc
  foo: bar
```


### Ouput
The immediate next code block after the comment will be compiled to HTML output.

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
  name: doc3
  description: this is jade mixin 3 documentation
  arguments: 
    arg1: foo
    arg2: faa

mixin doc3(arg1, arg2)
  div(class="foo") this is a mixin
```



## How to use
`npm install jade-doc`

```js
var jadeDoc = require('jade-doc');

jadeDoc({
  input: '**/*.jade',
  output: 'anything.json' // default none
});
```
