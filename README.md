# Collect Jade comments
Takes jade files, looks for `@jadedoc` comments and puts those in an output JSON file.


## Basic usage
Use the keyword `@jadedoc` to search for comments inside your jade files to be used as input. Comments should be written in [YAML](http://en.wikipedia.org/wiki/YAML) format.

Only the name argument is required. This is the key of your output JSON object.

```jade
//- @jadedoc
  name: Only doc
```

You can provide any other data you want.

```jade
//- @jadedoc
  name: Only doc
  description: this is a description
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

output will be

```json
{
  "some-node": {
    "meta": {
      "file": "./test/fixtures/node.jade"
    },
    "jade": {
      "root": "div.this-is-output-for-jade-doc",
      "comment": "  name: some-node",
      "block": "div.this-is-output-for-jade-doc",
      "type": "node"
    },
    "name": "some-node",
    "output": "<div class=\"this-is-output-for-jade-doc\"></div>"
  }
}
```


#### Mixins
Optionally provide mixins arguments. If no arguments are given, mixin will be executed without any arguments.

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

#### Includes
Includes are not supported (for now).



## How to use
`npm install jade-doc`

```js
var options = {
  input: '**/*.jade', // glob
  output: 'anything.json', // default jade-doc.json
  keyword: '@anything' // default @jadedoc
};

new JadeDoc(options, function(){
  console.log('optional callback');
});
```